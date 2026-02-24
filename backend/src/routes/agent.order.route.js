const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyAgent } = require("../middleware/role.middleware");

/* =========================================
   1️⃣ MY ACTIVE ORDERS (dispatched only)
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
          status: "dispatched",
        },
        include: {
          store: { select: { name: true } },
        },
      });

      res.json({ orders });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active orders" });
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
      const activeCount = await prisma.order.count({
        where: {
          agentEmail: req.user.email,
          status: "dispatched",
        },
      });

      const deliveredOrders = await prisma.order.findMany({
        where: {
          agentEmail: req.user.email,
          status: "delivered",
        },
        select: {
          agentEarnings: true,
        },
      });

      const deliveredCount = deliveredOrders.length;

      const totalEarnings = deliveredOrders.reduce(
        (sum, o) => sum + (o.agentEarnings || 0),
        0
      );

      res.json({
        summary: {
          active: activeCount,
          delivered: deliveredCount,
          earnings: totalEarnings,
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