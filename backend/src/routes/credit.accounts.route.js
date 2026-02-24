/*const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyWholesaler } = require("../middleware/role.middleware");

// ===============================
// GET ALL RETAILERS WITH CREDIT
// ===============================
router.get(
  "/credit/accounts",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const retailers = await prisma.user.findMany({
        where: {
          role: "retailer",
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          creditLimit: true,
          creditUsed: true,
          creditStatus: true,
        },
      });

      res.json({ retailers });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to fetch credit accounts",
      });
    }
  }
);

module.exports = router;*/