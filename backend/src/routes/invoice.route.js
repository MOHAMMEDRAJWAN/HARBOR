const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const prisma = require("../prisma");
const authMiddleware = require("../middleware/auth.middleware");
const { onlyWholesaler } = require("../middleware/role.middleware");

router.get(
  "/invoice/:orderId",
  authMiddleware,
  onlyWholesaler,
  async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          store: true,
        },
      });

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const doc = new PDFDocument({ margin: 40 });

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=invoice_${order.id}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");

      doc.pipe(res);

      // HEADER
      doc.fontSize(20).text("HARBOR WHOLESALE", { align: "center" });
      doc.moveDown();
      doc.fontSize(16).text("INVOICE", { align: "center" });
      doc.moveDown(2);

      // ORDER INFO
      doc.fontSize(12);
      doc.text(`Invoice ID: ${order.id}`);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`);
      doc.text(`Retailer: ${order.retailerEmail}`);
      doc.text(`Store: ${order.store.name}`);
      doc.moveDown();

      // TABLE HEADER
      doc.text("Items:");
      doc.moveDown(0.5);

      order.items.forEach((item) => {
        doc.text(
          `${item.product.name} - ${item.quantity} x ₹${item.price} = ₹${item.subtotal}`
        );
      });

      doc.moveDown(2);
      doc.fontSize(14).text(`Total Amount: ₹ ${order.totalAmount}`, {
        align: "right",
      });

      doc.end();
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  }
);

module.exports = router;