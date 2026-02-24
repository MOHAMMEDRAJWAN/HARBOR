const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyWholesaler } = require("../middleware/role.middleware");

/* =====================================================
   VIEW ORDERS
===================================================== */
router.get(
  "/wholesaler/orders",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const { status } = req.query;

    const whereClause = {
      store: { ownerEmail: req.user.email },
    };

    if (status) whereClause.status = status;

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
        store: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ orders });
  }
);

/* =====================================================
   ORDER SUMMARY
===================================================== */
router.get(
  "/wholesaler/orders/summary",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const orders = await prisma.order.groupBy({
        by: ["status"],
        _count: { status: true },
        where: { store: { ownerEmail: req.user.email } },
      });

      const summary = {
        pending: 0,
        accepted: 0,
        assigned: 0,
        dispatched: 0,
        delivered: 0,
        rejected: 0,
      };

      orders.forEach(o => {
        summary[o.status] = o._count.status;
      });

      res.json({ summary });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch summary" });
    }
  }
);

/* =====================================================
   ACCEPT ORDER
===================================================== */
router.post(
  "/orders/:orderId/accept",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true, store: true },
      });

      if (!order)
        return res.status(404).json({ message: "Order not found" });

      if (order.store.ownerEmail !== req.user.email)
        return res.status(403).json({ message: "Access denied" });

      if (order.status !== "pending")
        return res.status(400).json({
          message: "Only pending orders can be accepted",
        });

      // 🔹 CREDIT HANDLING
      if (order.paymentMethod === "CREDIT") {
        const retailer = await prisma.user.findUnique({
          where: { email: order.retailerEmail },
        });

        if (!retailer)
          return res.status(404).json({ message: "Retailer not found" });

        if (retailer.creditStatus !== "approved")
          return res.status(400).json({
            message: "Retailer credit not approved",
          });

        const available =
          retailer.creditLimit - retailer.creditUsed;

        if (available < order.totalAmount)
          return res.status(400).json({
            message: "Insufficient credit limit",
          });

        // Deduct credit
        await prisma.user.update({
          where: { email: retailer.email },
          data: {
            creditUsed: {
              increment: order.totalAmount,
            },
          },
        });

        await prisma.order.update({
          where: { id: orderId },
          data: { creditStatus: "approved" },
        });
      }

      // 🔹 Reduce stock
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: { status: "accepted" },
        include: {
          items: { include: { product: true } },
        },
      });

      res.json({
        message: "Order accepted successfully",
        order: updatedOrder,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Accept failed" });
    }
  }
);

/* =====================================================
   REJECT ORDER
===================================================== */
router.post(
  "/orders/:orderId/reject",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const orderId = parseInt(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.status !== "pending")
      return res.status(400).json({
        message: "Only pending orders can be rejected",
      });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "rejected" },
    });

    res.json({
      message: "Order rejected successfully",
      order: updatedOrder,
    });
  }
);

/* =====================================================
   ASSIGN AGENT
===================================================== */
router.post(
  "/orders/:orderId/assign-agent",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const orderId = parseInt(req.params.orderId);
    const { agentEmail } = req.body;

    if (!agentEmail)
      return res.status(400).json({
        message: "agentEmail is required",
      });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.status !== "accepted")
      return res.status(400).json({
        message: "Agent can only be assigned to accepted orders",
      });

    const agent = await prisma.user.findUnique({
      where: { email: agentEmail },
    });

    if (!agent || agent.role !== "agent")
      return res.status(400).json({
        message: "Invalid agent selected",
      });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        agentEmail,
        status: "assigned",
      },
    });

    res.json({
      message: "Agent assigned successfully",
      order: updatedOrder,
    });
  }
);

/* =====================================================
   DISPATCH ORDER
===================================================== */
router.post(
  "/orders/:orderId/dispatch",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const orderId = parseInt(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.status !== "assigned")
      return res.status(400).json({
        message: "Only assigned orders can be dispatched",
      });

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "dispatched" },
    });

    res.json({
      message: "Order dispatched successfully",
      order: updatedOrder,
    });
  }
);

/* =====================================================
   GET ALL AGENTS
===================================================== */
router.get(
  "/wholesaler/agents",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const agents = await prisma.user.findMany({
      where: { role: "agent" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    res.json({ agents });
  }
);

/* =====================================================
   ANALYTICS
===================================================== */
router.get(
  "/wholesaler/analytics",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: { store: { ownerEmail: req.user.email } },
      });

      const totalRevenue = orders
        .filter(o => o.status === "delivered")
        .reduce((sum, o) => sum + o.totalAmount, 0);

      const statusCounts = {
        pending: orders.filter(o => o.status === "pending").length,
        accepted: orders.filter(o => o.status === "accepted").length,
        assigned: orders.filter(o => o.status === "assigned").length,
        dispatched: orders.filter(o => o.status === "dispatched").length,
        delivered: orders.filter(o => o.status === "delivered").length,
        rejected: orders.filter(o => o.status === "rejected").length,
      };

      const monthlySales = {};

      orders.forEach(order => {
        if (order.status === "delivered") {
          const month = new Date(order.createdAt)
            .toLocaleString("default", { month: "short" });

          monthlySales[month] =
            (monthlySales[month] || 0) + order.totalAmount;
        }
      });

      res.json({
        totalRevenue,
        statusCounts,
        monthlySales,
      });
    } catch (err) {
      res.status(500).json({
        message: "Failed to fetch analytics",
      });
    }
  }
);

router.get(
  "/wholesaler/orders/recent",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: {
          store: {
            ownerEmail: req.user.email,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      res.json({ orders });
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch recent orders",
      });
    }
  }
);

module.exports = router;