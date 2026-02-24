/*const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyWholesaler } = require("../middleware/role.middleware");

// ===============================
// CREDIT SETTLEMENT
// ===============================
router.put(
  "/credit/:retailerId/settle",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const retailerId = parseInt(req.params.retailerId);
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid amount required",
      });
    }

    const retailer = await prisma.user.findUnique({
      where: { id: retailerId }, //  IMPORTANT
    });

    if (!retailer) {
      return res.status(404).json({
        message: "Retailer not found",
      });
    }

    if (retailer.creditUsed < amount) {
      return res.status(400).json({
        message: "Amount exceeds credit used",
      });
    }

    const updatedRetailer = await prisma.user.update({
      where: { id: retailerId },
      data: {
        creditUsed: retailer.creditUsed - amount,
      },
    });

    res.json({
      message: "Credit settled successfully",
      retailer: updatedRetailer,
    });
  }
);

module.exports = router;*///