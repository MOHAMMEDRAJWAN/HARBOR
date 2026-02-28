const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyWholesaler } = require("../middleware/role.middleware");
console.log("PRODUCT ROUTE FILE LOADED");

// ADD PRODUCT
router.post("/:categoryId", async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    const { name, price, unit, stock, moq } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseFloat(price),
        unit,
        stock: parseInt(stock),
        moq: parseInt(moq),
        categoryId,
        storeId: category.storeId,
      },
    });

    res.status(201).json(product);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Failed to add product" });
  }
});

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
        where: { active: true },
        select: {
          id: true,
          name: true,
          price: true,
          unit: true,
          stock: true,
          moq: true,
          category: {
            select: {
              storeId: true,   
              store: {
                select: { id: true, name: true }
              }
            }
          }
        }
      });

      res.json({ products });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  }
);

module.exports = router;
