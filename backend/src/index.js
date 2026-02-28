const cors = require("cors");
console.log("CWD =", process.cwd());
console.log("__dirname =", __dirname);

const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
});

console.log("JWT_SECRET =", process.env.JWT_SECRET);

const express = require("express");

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// routes

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

const healthRoute = require("./routes/health.route");
app.use("/", healthRoute);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const authRoute = require("./routes/auth/auth.route");
app.use("/auth", authRoute);

const meRoute = require("./routes/me.route");
app.use("/", meRoute);

const storeRoute = require("./routes/store.route");
app.use("/", storeRoute); 

const orderRoute = require("./routes/order.route");
app.use("/", orderRoute);

const wholesalerOrderRoute = require("./routes/wholesaler.order.route");
app.use("/", wholesalerOrderRoute);



const categoryRoutes = require("./routes/category.route");
app.use("/categories", categoryRoutes);

const productRoutes = require("./routes/product.route");
app.use("/products", productRoutes);

const retailerOrderRoute = require("./routes/retailer.order.route");
app.use("/", retailerOrderRoute);

const agentOrderRoute = require("./routes/agent.order.route");
app.use("/", agentOrderRoute);





const creditRoutes = require("./routes/credit.routes");
app.use("/", creditRoutes);

const invoiceRoute = require("./routes/invoice.route");
app.use("/", invoiceRoute);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});


