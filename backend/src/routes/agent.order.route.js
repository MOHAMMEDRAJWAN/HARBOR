const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyAgent } = require("../middleware/role.middleware");

/* =========================================
   1️⃣ MY ACTIVE ORDERS (assigned + dispatched)
========================================= */
router.get(
  "/agent/orders/active",
  authMiddleware,
  onlyAgent,
  async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: {
          agentEmail: req.user.email,
          status: {
            in: ["assigned", "dispatched"],
          },
        },
        include: {
          store: { select: { name: true } },
          items: {
            include: {
              product: { select: { name: true } },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json({ orders });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to fetch active orders",
      });
    }
  }
);

/* =========================================
   2️⃣ ORDER HISTORY (delivered only)
========================================= */
router.get(
  "/agent/orders/history",
  authMiddleware,
  onlyAgent,
  async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: {
          agentEmail: req.user.email,
          status: "delivered",
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ orders });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch history" });
    }
  }
);

/* =========================================
   3️⃣ AGENT DASHBOARD SUMMARY (with earnings)
========================================= */
router.get(
  "/agent/orders/summary",
  authMiddleware,
  onlyAgent,
  async (req, res) => {
    try {
      const now = new Date();

      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const activeCount = await prisma.order.count({
        where: {
          agentEmail: req.user.email,
          status: { in: ["assigned", "dispatched"] },
        },
      });

      const deliveredOrders = await prisma.order.findMany({
        where: {
          agentEmail: req.user.email,
          status: "delivered",
        },
        select: {
          agentEarnings: true,
          createdAt: true,
        },
      });

      const deliveredCount = deliveredOrders.length;

      let totalEarnings = 0;
      let weekEarnings = 0;
      let monthEarnings = 0;

      deliveredOrders.forEach((order) => {
        const earnings = order.agentEarnings || 0;
        totalEarnings += earnings;

        if (new Date(order.createdAt) >= startOfWeek) {
          weekEarnings += earnings;
        }

        if (new Date(order.createdAt) >= startOfMonth) {
          monthEarnings += earnings;
        }
      });

      res.json({
        summary: {
          active: activeCount,
          delivered: deliveredCount,
          earnings: totalEarnings,
          weekEarnings,
          monthEarnings,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to fetch agent summary",
      });
    }
  }
);
/* =========================================
   4️⃣ DELIVER ORDER (Hybrid Earnings Model)
========================================= */
router.post(
  "/orders/:orderId/deliver",
  authMiddleware,
  onlyAgent,
  async (req, res) => {
    const orderId = parseInt(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.agentEmail !== req.user.email)
      return res.status(403).json({ message: "Access denied" });

    if (order.status !== "dispatched")
      return res.status(400).json({ message: "Invalid order status" });

    // ===============================
    // HYBRID EARNINGS CALCULATION
    // ===============================
    const BASE_AMOUNT = 20;       // ₹20 base
    const PERCENTAGE = 0.02;      // 2%

    const earnings =
      BASE_AMOUNT + order.totalAmount * PERCENTAGE;

    const updateData = {
      status: "delivered",
      agentEarnings: earnings,
    };

    // If COD, mark as paid
    if (order.paymentMethod === "COD") {
      updateData.paymentStatus = "paid";
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    res.json({
      message: "Order delivered successfully",
      order: updatedOrder,
    });
  }
);

module.exports = router;