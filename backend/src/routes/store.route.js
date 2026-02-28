console.log("STORE ROUTES LOADED");

const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyWholesaler } = require("../middleware/role.middleware");

/* =====================================================
   CREATE STORE (Wholesaler Only)
   POST /stores
===================================================== */
router.post(
  "/stores",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const { name, address } = req.body;

      if (!name || !address) {
        return res
          .status(400)
          .json({ message: "Name and address required" });
      }

      const existingStore = await prisma.store.findFirst({
        where: { ownerEmail: req.user.email },
      });

      if (existingStore) {
        return res
          .status(409)
          .json({ message: "Store already exists" });
      }

      const store = await prisma.store.create({
        data: {
          name,
          address,
          ownerEmail: req.user.email,
        },
      });

      res.status(201).json({
        message: "Store created successfully",
        store,
      });
    } catch (error) {
      console.error("CREATE STORE ERROR:", error);
      res.status(500).json({
        message: "Failed to create store",
      });
    }
  }
);

/* =====================================================
   GET MY STORE (Wholesaler)
   GET /stores/my
===================================================== */
router.get(
  "/stores/my",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const store = await prisma.store.findFirst({
        where: { ownerEmail: req.user.email },
        select: {
          id: true,
          name: true,
          address: true,
        },
      });

      if (!store) {
        return res.status(404).json({
          message:
            "Store not found. Please create a store first.",
        });
      }

      res.json({ store });
    } catch (error) {
      console.error("GET MY STORE ERROR:", error);
      res.status(500).json({
        message: "Failed to fetch store",
      });
    }
  }
);

/* =====================================================
   LIST ALL STORES (Retailer / Authenticated Users)
   GET /stores
===================================================== */
router.get(
  "/stores",
  authMiddleware,
  async (req, res) => {
    try {
      const stores = await prisma.store.findMany({
        select: {
          id: true,
          name: true,
          address: true,
        },
      });

      res.json({ stores });
    } catch (error) {
      console.error("LIST STORES ERROR:", error);
      res.status(500).json({
        message: "Failed to fetch stores",
      });
    }
  }
);

module.exports = router;