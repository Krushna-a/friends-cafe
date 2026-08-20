require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const productsRoutes = require("./routes/products");
const ordersRoutes = require("./routes/orders");
const payRoutes = require("./routes/pay");
const adminRoutes = require("./routes/admin");
const { connectMongo } = require("./utils/mongo");

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "https://friends-cafe-seven.vercel.app",
  "https://friends-cafe-v5m2.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  }),
);
app.options("*", cors()); // handle preflight for all routes
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "FCC Backend running" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/pay", payRoutes);
app.use("/api/admin", adminRoutes);

async function start() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error("❌ MONGO_URI is not set in .env. Exiting.");
    process.exit(1);
  }

  try {
    await connectMongo(mongoUri);
    console.log("✅ Connected to MongoDB Atlas");
  } catch (e) {
    console.error("❌ Failed to connect to MongoDB Atlas:", e.message);
    process.exit(1);
  }

  app.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}`),
  );
}

start();
