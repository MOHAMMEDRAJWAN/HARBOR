const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyRetailer } = require("../middleware/role.middleware");

// VIEW ORDERS FOR RETAILER (OWN ORDERS ONLY)
router.get(
  "/retailer/orders",
  authMiddleware,
  onlyRetailer,
  async (req, res) => {
    try {
      const orders = await prisma.order.findMany({
        where: {
          retailerEmail: req.user.email, // 🔐 critical security filter
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
          store: {
            select: {
              name: true,
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
        message: "Failed to fetch retailer orders",
      });
    }
  }
);

module.exports = router;
