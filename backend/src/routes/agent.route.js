/*const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyAgent } = require("../middleware/role.middleware");

// VIEW ACCEPTED ORDERS
router.get(
  "/agent/orders",
  authMiddleware,
  onlyAgent,
  async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { status: "accepted" },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json({ orders });
  }
);

// DISPATCH ORDER (Agent)
router.post(
  "/orders/:orderId/dispatch",
  authMiddleware,
  onlyAgent,
  async (req, res) => {
    const orderId = parseInt(req.params.orderId);

    // 1️⃣ Fetch order FIRST
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Validate lifecycle
    if (order.status !== "accepted") {
      return res.status(400).json({
        message: "Only accepted orders can be dispatched",
      });
    }

    // 🔐 Payment & credit enforcement
    if (order.paymentMethod === "ONLINE" && order.paymentStatus !== "paid") {
      return res.status(400).json({
        message: "Online payment not completed",
     });
    }

    if (order.paymentMethod === "CREDIT" && order.creditStatus !== "approved") {
      return res.status(400).json({
        message: "Credit not approved",
    });
   } 

    // 3️⃣ Update status + assign agent
      const updatedOrder = await prisma.order.update({
         where: { id: orderId },
          data: {
            status: "dispatched",
            agentEmail: req.user.email, // ✅ THIS ASSIGNS THE AGENT
  },
});


    res.json({
      message: "Order dispatched successfully",
      order: updatedOrder,
    });
  }
);
;

// DELIVER ORDER (Agent)
router.post(
  "/orders/:orderId/deliver",
  authMiddleware,
  onlyAgent,
  async (req, res) => {
    const orderId = parseInt(req.params.orderId);

    // 1️⃣ Fetch order FIRST
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Validate lifecycle
    if (order.status !== "dispatched") {
      return res.status(400).json({
        message: "Only dispatched orders can be delivered",
      });
    }

    // 3️⃣ Update status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: "delivered" },
    });

    res.json({
      message: "Order delivered successfully",
      order: updatedOrder,
    });
  }
);

module.exports = router;*/
