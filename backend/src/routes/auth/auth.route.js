// @ts-nocheck
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../../prisma");


console.log("AUTH ROUTE FILE LOADED");

// in-memory users


// ================= REGISTER =================
router.post("/register", async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({
      message: "Email, password, and role are required",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    res.status(201).json({
      message: "Registered",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Registration failed",
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
