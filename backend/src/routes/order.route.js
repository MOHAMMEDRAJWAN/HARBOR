const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyRetailer } = require("../middleware/role.middleware");

// ===============================
// PLACE ORDER (Retailer)
// ===============================
router.post(
  "/orders/:storeId",
  authMiddleware,
  onlyRetailer,
  async (req, res) => {
    const storeId = parseInt(req.params.storeId);
    const { items, paymentMethod } = req.body;

    const allowedMethods = ["COD", "ONLINE", "CREDIT"];
    const method = paymentMethod || "COD";

    if (!allowedMethods.includes(method)) {
      return res.status(400).json({
        message: "Invalid payment method",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Order items required",
      });
    }

    try {
      // 1️⃣ Verify store
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        return res.status(404).json({
          message: "Store not found",
        });
      }
      console.log("STORE ID RECEIVED:", storeId);

      let totalAmount = 0;
      const orderItemsData = [];

      // 2️⃣ Validate products & calculate total
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return res.status(404).json({
            message: `Product ${item.productId} not found`,
          });
        }

        if (item.quantity > product.stock) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}`,
          });
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        orderItemsData.push({
          productId: product.id,
          price: product.price,
          quantity: item.quantity,
          subtotal,
        });
      }

      // 3️⃣ TRANSACTION START (CRITICAL FIX)
      const order = await prisma.$transaction(async (tx) => {
        let paymentStatus = "unpaid";
        let creditStatus = "none";

        // ==========================
        // CREDIT PAYMENT LOGIC
        // ==========================
        if (method === "CREDIT") {
          const retailer = await tx.user.findUnique({
            where: { email: req.user.email },
          });

          if (!retailer) {
            throw new Error("Retailer not found");
          }

          if (retailer.creditStatus !== "approved") {
            throw new Error("Credit not approved");
          }

          const available =
            retailer.creditLimit - retailer.creditUsed;

          if (totalAmount > available) {
            throw new Error("Insufficient credit limit");
          }

          /* Deduct credit safely
          await tx.user.update({
            where: { email: req.user.email },
            data: {
              creditUsed: {
                increment: totalAmount,
              },
            },
          });*/

          creditStatus = "approved";
        }

        // ==========================
        // ONLINE PAYMENT STUB
        // ==========================
        if (method === "ONLINE") {
          paymentStatus = "paid";
        }

        // ==========================
        // Reduce product stock
        // ==========================
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // ==========================
        // Create Order
        // ==========================
        const createdOrder = await tx.order.create({
          data: {
            storeId,
            retailerEmail: req.user.email,
            totalAmount,
            paymentMethod: method,
            paymentStatus,
            creditStatus,
            items: {
              create: orderItemsData,
            },
          },
          include: {
            items: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
        });

        return createdOrder;
      });

      res.status(201).json({
        message: "Order placed successfully",
        order,
      });
    } catch (error) {
      console.error(error.message);
      res.status(400).json({
        message: error.message || "Order placement failed",
      });
    }
  }
);

module.exports = router;