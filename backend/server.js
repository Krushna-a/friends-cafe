require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");
const payRoutes = require("./routes/pay");
const adminRoutes = require("./routes/admin");
const whatsappWebhookRoutes = require("./routes/whatsapp-webhook");
const { connectMongo } = require("./utils/mongo");
const Product = require("./models/Product");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "FCC Backend running" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/pay", payRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/whatsapp", whatsappWebhookRoutes);

async function start() {
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri) {
    try {
      await connectMongo(mongoUri);
      console.log("Connected to MongoDB");

      // seed products from data/db.json if collection empty
      const count = await Product.countDocuments();
      if (count === 0) {
        try {
          const raw = fs.readFileSync(
            require("path").join(__dirname, "data", "db.json"),
            "utf8"
          );
          const parsed = JSON.parse(raw);
          const items = (parsed.products || []).map((p) => {
            const { id, ...productData } = p; // Remove custom id field
            return productData;
          });
          if (items.length) await Product.insertMany(items);
          console.log(`Seeded ${items.length} products`);
        } catch (e) {
          console.warn("No product seed file or failed to parse:", e.message);
        }
      }
    } catch (e) {
      console.error("Failed to connect to MongoDB:", e.message);
    }
  } else {
    console.warn(
      "MONGO_URI not set; running with file-based DB to simplify offline mode"
    );
  }

  app.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}`)
  );
}

start();
