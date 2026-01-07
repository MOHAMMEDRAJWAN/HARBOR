const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyRetailer } = require("../middleware/role.middleware");

// PLACE ORDER (Retailer)
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
      return res.status(400).json({ message: "Order items required" });
    }

    try {
      // verify store exists
      const store = await prisma.store.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }

      let totalAmount = 0;

      // prepare order items
      const orderItemsData = [];

      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });

        if (item.quantity > product.stock) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}`,
       });
     }


        if (!product) {
          return res.status(404).json({
            message: `Product ${item.productId} not found`,
          });
        }

        const subtotal = product.price * item.quantity;
        totalAmount += subtotal;

        orderItemsData.push({
          productId: product.id,
          //productName: product.name,//
          price: product.price, // 🔒 price frozen
          quantity: item.quantity,
          subtotal,
        });
      }
       //payment method handling can be added here
       let paymentStatus = "unpaid";
       let creditStatus = "none";

       if (method === "ONLINE") {
       paymentStatus = "paid"; // stub
         }

       if (method === "CREDIT") {
       creditStatus = "requested";
         }

      // create order
      const order = await prisma.order.create({
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
              select: {
               name: true,
        },
      },
    },
  },
}});

      res.status(201).json({
        message: "Order placed successfully",
        order,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Order placement failed" });
    }
  }
);

module.exports = router;
