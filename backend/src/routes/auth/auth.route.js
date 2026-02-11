// @ts-nocheck
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../prisma");


console.log("AUTH ROUTE FILE LOADED");

// in-memory users


// ================= REGISTER =================
// ================= REGISTER (WHOLESALER ONLY) =================
router.post("/register/wholesaler", async (req, res) => {
  try {
    const {
      name,
      businessName,
      email,
      phone,
      address,
      password,
    } = req.body;

    // Validation
    if (!name || !businessName || !email || !phone || !address || !password) {
      return res.status(400).json({
        message: "All wholesaler fields are required",
      });
    }

    // Check existing user
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🧩 Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "wholesaler",
        name,
        businessName,
        phone,
        address,
      },
    });

    // 🏪 Auto-create store
    const store = await prisma.store.create({
      data: {
        name: businessName,
        address,
        ownerEmail: email,
      },
    });

    res.status(201).json({
      message: "Wholesaler registered successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      store: {
        id: store.id,
        name: store.name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Registration failed",
      error: err.message,
    });
  }
});

// ================= REGISTER RETAILER =================
router.post("/register/retailer", async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({
        message: "All retailer fields are required",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "retailer",
        name,
        phone,
        address,
      },
    });

    res.status(201).json({
      message: "Retailer registered successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Retailer registration failed",
    });
  }
});

// ================= REGISTER AGENT =================
router.post("/register/agent", async (req, res) => {
  try {
    const { name, email, phone, address, password } = req.body;

    if (!name || !email || !phone || !address || !password) {
      return res.status(400).json({
        message: "All agent fields are required",
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "agent",
        name,
        phone,
        address
      },
    });

    res.status(201).json({
      message: "Agent registered successfully",
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Agent registration failed",
    });
  }
});

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed",
    });
  }
});





module.exports = router;
