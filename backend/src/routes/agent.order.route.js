const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyAgent } = require("../middleware/role.middleware");

// AGENT ORDER HISTORY
router.get(
  "/agent/orders",
  authMiddleware,
  onlyAgent,
  async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: {
          agentEmail: req.user.email,
        },
        include: {
          store: {
            select: { name: true },
          },
          items: {
            include: {
              product: {
                select: { name: true },
              },
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
        message: "Failed to fetch agent orders",
      });
    }
  }
);

// AGENT DASHBOARD SUMMARY
router.get(
  "/agent/orders/summary",
  authMiddleware,
  onlyAgent,
  async (req, res) => {
    const statuses = ["dispatched", "delivered"];
    const summary = {};

    for (const status of statuses) {
      summary[status] = await prisma.order.count({
        where: {
          agentEmail: req.user.email,
          status,
        },
      });
    }

    res.json({ summary });
  }
);


module.exports = router;
