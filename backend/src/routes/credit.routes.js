const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyRetailer, onlyWholesaler } = require("../middleware/role.middleware");


// ===============================
// RETAILER REQUEST CREDIT
// ===============================
router.post(
  "/credit/request",
  authMiddleware,
  onlyRetailer,
  async (req, res) => {
    try {
      const retailer = await prisma.user.findUnique({
        where: { email: req.user.email },
      });

      if (retailer.creditStatus === "approved") {
        return res.status(400).json({
          message: "Credit already approved",
        });
      }

      await prisma.user.update({
        where: { email: req.user.email },
        data: { creditStatus: "requested" },
      });

      res.json({ message: "Credit request submitted" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to request credit" });
    }
  }
);


// ===============================
// WHOLESALER VIEW CREDIT REQUESTS
// ===============================
router.get(
  "/credit/requests",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const retailers = await prisma.user.findMany({
        where: {
          role: "retailer",
          creditStatus: "requested",
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });

      res.json({ retailers });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to load credit requests",
      });
    }
  }
);


// ===============================
// APPROVE CREDIT
// ===============================
router.put(
  "/credit/:retailerId/approve",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const retailerId = parseInt(req.params.retailerId);
      const { creditLimit } = req.body;

      await prisma.user.update({
        where: { id: retailerId },
        data: {
          creditStatus: "approved",
          creditLimit,
          creditUsed: 0,
        },
      });

      res.json({ message: "Credit approved" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Approval failed" });
    }
  }
);


// ===============================
// REJECT CREDIT
// ===============================
router.put(
  "/credit/:retailerId/reject",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const retailerId = parseInt(req.params.retailerId);

      await prisma.user.update({
        where: { id: retailerId },
        data: {
          creditStatus: "rejected",
        },
      });

      res.json({ message: "Credit rejected" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Reject failed" });
    }
  }
);

// GET approved credit accounts (Wholesaler)
router.get(
  "/credit/accounts",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const retailers = await prisma.user.findMany({
        where: {
          role: "retailer",
          creditStatus: "approved",
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          creditLimit: true,
          creditUsed: true,
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

// ===============================
// SETTLE CREDIT (Wholesaler)
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

// ===============================
// RETAILER VIEW OWN CREDIT INFO
// ===============================
router.get(
  "/credit/me",
  authMiddleware,
  onlyRetailer,
  async (req, res) => {
    try {
      const retailer = await prisma.user.findUnique({
        where: { email: req.user.email },
        select: {
          creditLimit: true,
          creditUsed: true,
          creditStatus: true,
        },
      });

      res.json({ credit: retailer });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to fetch credit info",
      });
    }
  }
);

// ===============================
// RETAILER SELF CREDIT SETTLEMENT
// ===============================
router.put(
  "/credit/self/settle",
  authMiddleware,
  onlyRetailer,
  async (req, res) => {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Valid amount required",
      });
    }

    try {
      const retailer = await prisma.user.findUnique({
        where: { email: req.user.email },
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

      const updated = await prisma.user.update({
        where: { email: req.user.email },
        data: {
          creditUsed: retailer.creditUsed - amount,
        },
      });

      res.json({
        message: "Credit settled successfully",
        creditUsed: updated.creditUsed,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        message: "Settlement failed",
      });
    }
  }
);

module.exports = router;