const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyWholesaler } = require("../middleware/role.middleware");

// VIEW ORDERS FOR WHOLESALER (WITH FILTERS)
router.get(
  "/wholesaler/orders",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const { status } = req.query;

    const whereClause = {
      store: {
        ownerEmail: req.user.email,
      },
    };

    if (status) {
      whereClause.status = status;
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
        store: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ orders });
  }
);

// WHOLESALER ORDER SUMMARY
router.get(
  "/wholesaler/orders/summary",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const statuses = ["pending", "accepted", "dispatched", "delivered"];

    const summary = {};

    for (const status of statuses) {
      summary[status] = await prisma.order.count({
        where: {
          status,
          store: {
            ownerEmail: req.user.email,
          },
        },
      });
    }

    res.json({ summary });
  }
);


// ACCEPT ORDER (Wholesaler)
router.post(
  "/orders/:orderId/accept",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const orderId = parseInt(req.params.orderId);

    // 1️⃣ Fetch order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        store: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Ensure order belongs to this wholesaler
    if (order.store.ownerEmail !== req.user.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 3️⃣ Prevent double acceptance
    if (order.status !== "pending") {
      return res.status(400).json({
        message: "Order cannot be accepted again",
      });
    }

    // 4️⃣ Reduce stock for each item
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 5️⃣ Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "accepted" },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json({
      message: "Order accepted successfully",
      order: updatedOrder,
    });
  }
);

// APPROVE CREDIT (Wholesaler)
router.post(
  "/orders/:orderId/credit/approve",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const orderId = parseInt(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.store.ownerEmail !== req.user.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (order.paymentMethod !== "CREDIT") {
      return res.status(400).json({
        message: "Order is not a credit order",
      });
    }

    if (order.creditStatus !== "requested") {
      return res.status(400).json({
        message: "Credit is not in requested state",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        creditStatus: "approved",
      },
    });

    res.json({
      message: "Credit approved",
      order: updatedOrder,
    });
  }
);

// REJECT CREDIT (Wholesaler)
router.post(
  "/orders/:orderId/credit/reject",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const orderId = parseInt(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.store.ownerEmail !== req.user.email) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (order.paymentMethod !== "CREDIT") {
      return res.status(400).json({
        message: "Order is not a credit order",
      });
    }

    if (order.creditStatus !== "requested") {
      return res.status(400).json({
        message: "Credit is not in requested state",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        creditStatus: "rejected",
      },
    });

    res.json({
      message: "Credit rejected",
      order: updatedOrder,
    });
  }
);


module.exports = router;
