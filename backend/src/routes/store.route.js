console.log("STORE ROUTES LOADED");

const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyWholesaler } = require("../middleware/role.middleware");

// in-memory stores
const stores = [];

// CREATE STORE (WHOLESALER ONLY)
router.post("/stores", authMiddleware, onlyWholesaler, async (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    return res.status(400).json({ message: "Name and address required" });
  }

  // check if wholesaler already has a store
  const existingStore = await prisma.store.findFirst({
    where: { ownerEmail: req.user.email },
  });

  if (existingStore) {
    return res.status(409).json({ message: "Store already exists" });
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
});


// GET ALL STORES (RETAILER BROWSING)
// LIST STORES (Retailer / Public browsing)
router.get("/stores", authMiddleware, async (req, res) => {
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
    console.error(error);
    res.status(500).json({ message: "Failed to fetch stores" });
  }
});



// ADD CATEGORY (WHOLESALER ONLY, SINGLE STORE)
router.post(
  "/stores/:storeId/categories",
  authMiddleware,
  onlyWholesaler,
  (req, res) => {
    const { storeId } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Category name is required",
      });
    }

    const store = stores.find(s => s.id === parseInt(storeId));

    if (!store) {
      return res.status(404).json({
        message: "Store not found",
      });
    }

    // 🔐 ownership check
    if (store.ownerEmail !== req.user.email) {
      return res.status(403).json({
        message: "You can add categories only to your own store",
      });
    }

    const categoryExists = store.categories.find(
      c => c.name.toLowerCase() === name.toLowerCase()
    );

    if (categoryExists) {
      return res.status(409).json({
        message: "Category already exists",
      });
    }

    const newCategory = {
      id: store.categories.length + 1,
      name,
      products: [],
    };

    store.categories.push(newCategory);

    res.status(201).json({
      message: "Category added successfully",
      category: newCategory,
    });
  }
);
// GET CATEGORIES OF A STORE (RETAILER VIEW)
router.get("/stores/:storeId/categories", (req, res) => {
  const { storeId } = req.params;

  const store = stores.find(s => s.id === parseInt(storeId));

  if (!store) {
    return res.status(404).json({
      message: "Store not found",
    });
  }

  res.json({
    storeId: store.id,
    storeName: store.name,
    categories: store.categories,
  });
});

// ADD PRODUCT TO CATEGORY (WHOLESALER ONLY)
router.post(
  "/stores/:storeId/categories/:categoryId/products",
  authMiddleware,
  onlyWholesaler,
  (req, res) => {
    const { storeId, categoryId } = req.params;
    const { name, price, unit, stock, moq } = req.body;

    if (!name || !price || !unit || stock == null || moq == null) {
      return res.status(400).json({
        message: "All product fields are required",
      });
    }

    const store = stores.find(s => s.id === parseInt(storeId));
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // ownership check
    if (store.ownerEmail !== req.user.email) {
      return res.status(403).json({
        message: "You can add products only to your own store",
      });
    }

    const category = store.categories.find(
      c => c.id === parseInt(categoryId)
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const newProduct = {
      id: category.products.length + 1,
      name,
      price,
      unit,
      stock,
      moq,
      active: true,
    };

    category.products.push(newProduct);

    res.status(201).json({
      message: "Product added successfully",
      product: newProduct,
    });
  }
);

// GET PRODUCTS OF A CATEGORY (RETAILER VIEW)
router.get(
  "/stores/:storeId/categories/:categoryId/products",
  (req, res) => {
    const { storeId, categoryId } = req.params;

    const store = stores.find(s => s.id === parseInt(storeId));
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    const category = store.categories.find(
      c => c.id === parseInt(categoryId)
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({
      store: store.name,
      category: category.name,
      products: category.products.filter(p => p.active),
    });
  }
);

// ===============================
// LIST STORES (Retailer View)
// ===============================
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
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  }
);


module.exports = router;

