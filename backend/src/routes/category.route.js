console.log("CATEGORY ROUTE FILE LOADED");
const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyWholesaler } = require("../middleware/role.middleware");

// -----------------------------
// ADD CATEGORY (Wholesaler)
// POST /categories/:storeId
// -----------------------------
router.post(
  "/:storeId",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    const storeId = parseInt(req.params.storeId);
    const { name } = req.body;

    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        ownerEmail: req.user.email,
      },
    });

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const category = await prisma.category.create({
      data: {
        name,
        storeId: store.id,
      },
    });

    res.status(201).json({
      message: "Category added successfully",
      category,
    });
  }
);

// ------------------------------------
// LIST CATEGORIES OF A STORE (SAFE)
// GET /categories/store/:storeId
// ------------------------------------
router.get(
  "/store/:storeId",
  authMiddleware,
  async (req, res) => {
    const storeId = parseInt(req.params.storeId);

    try {
      const categories = await prisma.category.findMany({
        where: { storeId },
        select: {
          id: true,
          name: true,
        },
      });

      res.json({ categories });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed fetching categories" });
    }
  }
);

module.exports = router;