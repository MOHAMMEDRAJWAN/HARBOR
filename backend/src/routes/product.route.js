const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyWholesaler } = require("../middleware/role.middleware");

// ADD PRODUCT
router.post(
  "/:categoryId",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const { name, price, unit, stock, moq } = req.body;

      // 🔎 Basic validation
      if (!name || !price || !unit || !stock || !moq) {
        return res.status(400).json({
          message: "All product fields are required",
        });
      }

      // 🔢 Convert types properly
      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock);
      const parsedMoq = parseInt(moq);

      if (
        isNaN(parsedPrice) ||
        isNaN(parsedStock) ||
        isNaN(parsedMoq)
      ) {
        return res.status(400).json({
          message: "Invalid numeric values",
        });
      }

      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(404).json({
          message: "Category not found",
        });
      }

      const product = await prisma.product.create({
        data: {
          name,
          price: parsedPrice,
          unit,
          stock: parsedStock,
          moq: parsedMoq,
          categoryId,
        },
      });

      res.status(201).json({
        message: "Product added successfully",
        product,
      });
    } catch (error) {
      console.error("PRODUCT CREATE ERROR:", error);
      res.status(500).json({
        message: "Failed to add product",
        error: error.message,
      });
    }
  }
);

// VIEW PRODUCTS (Wholesaler)
router.get(
  "/",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        where: {
          category: {
            store: {
              ownerEmail: req.user.email,
            },
          },
        },
        include: {
          category: true,
        },
        
      });

      res.json({ products });
    } catch (error) {
      console.error("FULL PRODUCT LIST ERROR:", error);
      res.status(500).json({
        message: "Failed to fetch products",
        error: error.message,
      });
    }
  }
);


// LIST PRODUCTS OF A CATEGORY (Retailer browsing)
router.get(
  "/category/:categoryId",
  authMiddleware,
  async (req, res) => {
    const categoryId = parseInt(req.params.categoryId);

    try {
      const products = await prisma.product.findMany({
        where: {
          categoryId,
          active: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
          unit: true,
          stock: true,
          moq: true,
        },
      });

      res.json({ products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  }
);

// RETAILER VIEW ALL ACTIVE PRODUCTS
router.get(
  "/retailer/all",
  authMiddleware,
  async (req, res) => {
    try {
      const products = await prisma.product.findMany({
        where: {
          active: true,
        },
        select: {
          id: true,
          name: true,
          price: true,
          unit: true,
          stock: true,
          moq: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      });

      res.json({ products });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  }
);

module.exports = router;
