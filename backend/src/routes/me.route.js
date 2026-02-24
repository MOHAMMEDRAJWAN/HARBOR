const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "You are authenticated",
    user: req.user,
  });
});

// UPDATE PROFILE
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, businessName } = req.body;

    const updatedUser = await prisma.user.update({
      where: { email: req.user.email },
      data: {
        name,
        phone,
        address,
        businessName,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        address: true,
        businessName: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

module.exports = router;
