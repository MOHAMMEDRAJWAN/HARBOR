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
      // Get wholesaler info from token
      const wholesaler = await prisma.user.findUnique({
        where: { email: req.user.email },
      });

      // Find retailers with requested credit status
      const allRequesters = await prisma.user.findMany({
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

      // Filter out those already processed by this wholesaler
      const existingAccounts = await prisma.creditAccount.findMany({
        where: {
          wholesalerId: wholesaler.id,
        },
        select: {
          retailerId: true,
        },
      });

      const existingRetailerIds = new Set(
        existingAccounts.map((acc) => acc.retailerId)
      );

      const pendingRetailers = allRequesters.filter(
        (retailer) => !existingRetailerIds.has(retailer.id)
      );

      res.json({ retailers: pendingRetailers });
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

      // Get wholesaler info from token
      const wholesaler = await prisma.user.findUnique({
        where: { email: req.user.email },
      });

      // Check if credit account already exists for this wholesaler-retailer pair
      const existingAccount = await prisma.creditAccount.findUnique({
        where: {
          wholesalerId_retailerId: {
            wholesalerId: wholesaler.id,
            retailerId: retailerId,
          },
        },
      });

      if (existingAccount && existingAccount.creditStatus === "approved") {
        return res.status(400).json({
          message: "Credit already approved for this retailer",
        });
      }

      // Create or update credit account
      const creditAccount = await prisma.creditAccount.upsert({
        where: {
          wholesalerId_retailerId: {
            wholesalerId: wholesaler.id,
            retailerId: retailerId,
          },
        },
        update: {
          creditStatus: "approved",
          creditLimit,
          creditUsed: 0,
          updatedAt: new Date(),
        },
        create: {
          wholesalerId: wholesaler.id,
          retailerId: retailerId,
          creditLimit,
          creditUsed: 0,
          creditStatus: "approved",
        },
      });

      res.json({ message: "Credit approved", creditAccount });
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

      // Get wholesaler info from token
      const wholesaler = await prisma.user.findUnique({
        where: { email: req.user.email },
      });

      // Create or update credit account with rejected status
      const creditAccount = await prisma.creditAccount.upsert({
        where: {
          wholesalerId_retailerId: {
            wholesalerId: wholesaler.id,
            retailerId: retailerId,
          },
        },
        update: {
          creditStatus: "rejected",
          updatedAt: new Date(),
        },
        create: {
          wholesalerId: wholesaler.id,
          retailerId: retailerId,
          creditLimit: 0,
          creditUsed: 0,
          creditStatus: "rejected",
        },
      });

      res.json({ message: "Credit rejected", creditAccount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Reject failed" });
    }
  }
);

// GET approved credit accounts (Wholesaler - only their own)
router.get(
  "/credit/accounts",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      // Get wholesaler info from token
      const wholesaler = await prisma.user.findUnique({
        where: { email: req.user.email },
      });

      // Fetch credit accounts approved by this wholesaler
      const creditAccounts = await prisma.creditAccount.findMany({
        where: {
          wholesalerId: wholesaler.id,
          creditStatus: "approved",
        },
        include: {
          retailer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      // Format response to match frontend expectations
      const retailers = creditAccounts.map((account) => ({
        id: account.retailer.id,
        name: account.retailer.name,
        email: account.retailer.email,
        phone: account.retailer.phone,
        creditLimit: account.creditLimit,
        creditUsed: account.creditUsed,
        creditAccountId: account.id,
      }));

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
    try {
      const retailerId = parseInt(req.params.retailerId);
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({
          message: "Valid amount required",
        });
      }

      // Get wholesaler info from token
      const wholesaler = await prisma.user.findUnique({
        where: { email: req.user.email },
      });

      // Find the credit account
      const creditAccount = await prisma.creditAccount.findUnique({
        where: {
          wholesalerId_retailerId: {
            wholesalerId: wholesaler.id,
            retailerId: retailerId,
          },
        },
      });

      if (!creditAccount) {
        return res.status(404).json({
          message: "Credit account not found",
        });
      }

      if (creditAccount.creditUsed < amount) {
        return res.status(400).json({
          message: "Amount exceeds credit used",
        });
      }

      // Update credit account
      const updatedAccount = await prisma.creditAccount.update({
        where: { id: creditAccount.id },
        data: {
          creditUsed: creditAccount.creditUsed - amount,
        },
      });

      res.json({
        message: "Credit settled successfully",
        creditAccount: updatedAccount,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Settlement failed",
      });
    }
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