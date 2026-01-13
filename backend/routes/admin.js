const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const adapter = require("../utils/adapter");
const { readDB, writeDB } = require("../utils/db");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Table = require("../models/Table");

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Helper function to upload to Cloudinary
function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "fcc-products" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

// Admin authentication middleware
function adminAuthMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s*/, "");
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    req.admin = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Admin Login
router.post("/login", async (req, res) => {
  const { username, password } = req.body || {};

  // Simple admin credentials check (in production, use proper hashing and database)
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (username === adminUsername && password === adminPassword) {
    const token = jwt.sign(
      { id: "admin", username, role: "admin" },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );
    return res.json({ ok: true, token, user: { username, role: "admin" } });
  }

  return res.status(401).json({ error: "Invalid credentials" });
});

// Admin Product Routes

// Create Product
router.post(
  "/products",
  adminAuthMiddleware,
  upload.single("image1"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        price,
        category,
        type,
        inStock,
        size,
        color,
        tags,
      } = req.body;

      if (!title || !price || !category) {
        return res
          .status(400)
          .json({ error: "Title, price, and category are required" });
      }

      let imageUrl = "";
      if (req.file) {
        try {
          const result = await uploadToCloudinary(req.file.buffer);
          imageUrl = result.secure_url;
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: "Failed to upload image" });
        }
      }

      const productData = {
        name: title,
        title,
        price: parseFloat(price),
        description: description || "",
        category,
        type: type || "",
        size: size ? (typeof size === "string" ? JSON.parse(size) : size) : [],
        color: color
          ? typeof color === "string"
            ? JSON.parse(color)
            : color
          : [],
        tags: tags ? (typeof tags === "string" ? JSON.parse(tags) : tags) : [],
        inStock:
          inStock === "true" || inStock === true || inStock === undefined,
        image: imageUrl,
      };

      let product;
      if (adapter.usingMongo() && Product) {
        product = await Product.create(productData);
        product = product.toObject();
      } else {
        const db = await readDB();
        db.products = db.products || [];
        db.products.push(productData);
        await writeDB(db);
        product = productData;
      }

      return res.json({ ok: true, product });
    } catch (error) {
      console.error("Create product error:", error);
      return res.status(500).json({ error: "Failed to create product" });
    }
  }
);

// Update Product
router.put(
  "/products/:id",
  adminAuthMiddleware,
  upload.single("image1"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        description,
        price,
        category,
        type,
        inStock,
        size,
        color,
        tags,
      } = req.body;

      let product;
      if (adapter.usingMongo() && Product) {
        product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
      } else {
        const db = await readDB();
        product = db.products.find((p) => p.id === id);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
      }

      // Upload new image if provided
      if (req.file) {
        try {
          const result = await uploadToCloudinary(req.file.buffer);
          product.image = result.secure_url;
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: "Failed to upload image" });
        }
      }

      // Update fields
      if (title) {
        product.name = title;
        product.title = title;
      }
      if (description !== undefined) product.description = description;
      if (price !== undefined) product.price = parseFloat(price);
      if (category !== undefined) product.category = category;
      if (type !== undefined) product.type = type;
      if (inStock !== undefined)
        product.inStock = inStock === "true" || inStock === true;
      if (size !== undefined)
        product.size = size
          ? typeof size === "string"
            ? JSON.parse(size)
            : size
          : [];
      if (color !== undefined)
        product.color = color
          ? typeof color === "string"
            ? JSON.parse(color)
            : color
          : [];
      if (tags !== undefined)
        product.tags = tags
          ? typeof tags === "string"
            ? JSON.parse(tags)
            : tags
          : [];

      if (adapter.usingMongo() && Product) {
        await product.save();
        product = product.toObject();
      } else {
        const db = await readDB();
        const idx = db.products.findIndex((p) => p.id === id);
        if (idx !== -1) {
          db.products[idx] = product;
          await writeDB(db);
        }
      }

      return res.json({ ok: true, product });
    } catch (error) {
      console.error("Update product error:", error);
      return res.status(500).json({ error: "Failed to update product" });
    }
  }
);

// Delete Product
router.delete("/products/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (adapter.usingMongo() && Product) {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
    } else {
      const db = await readDB();
      const idx = db.products.findIndex((p) => p.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Product not found" });
      }
      db.products.splice(idx, 1);
      await writeDB(db);
    }

    return res.json({ ok: true, message: "Product deleted" });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({ error: "Failed to delete product" });
  }
});

// Admin Order Routes

// Get All Orders
router.get("/orders", adminAuthMiddleware, async (req, res) => {
  try {
    let orders;
    const User = require("../models/User");

    if (adapter.usingMongo() && Order) {
      orders = await Order.find().sort({ createdAt: -1 });
      orders = orders.map((o) => o.toObject());

      // Populate user info
      if (User && adapter.usingMongo()) {
        for (const order of orders) {
          // Try to find user by id field or _id
          let user = await User.findOne({ id: order.userId });
          if (!user && order.userId) {
            // Try as MongoDB _id
            try {
              user = await User.findById(order.userId);
            } catch (e) {
              // Not a valid ObjectId, try mobile
              user = await User.findOne({ mobile: order.userId });
            }
          }
          if (user) {
            order.userName = user.name || user.mobile || "Unknown";
            order.userMobile = user.mobile;
          } else {
            order.userName = order.userId || "Unknown";
            order.userMobile = "";
          }
        }
      } else {
        // File-based: get user info from db
        const db = await readDB();
        const users = db.users || [];
        for (const order of orders) {
          const user = users.find((u) => u.id === order.userId);
          if (user) {
            order.userName = user.name || user.mobile || "Unknown";
            order.userMobile = user.mobile;
          } else {
            order.userName = order.userId || "Unknown";
            order.userMobile = "";
          }
        }
      }
    } else {
      const db = await readDB();
      orders = db.orders || [];
      const users = db.users || [];

      // Populate user info
      for (const order of orders) {
        const user = users.find((u) => u.id === order.userId);
        if (user) {
          order.userName = user.name || user.mobile || "Unknown";
          order.userMobile = user.mobile;
        } else {
          order.userName = order.userId || "Unknown";
          order.userMobile = "";
        }
      }
    }

    return res.json({ ok: true, orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update Order Status
router.patch("/orders/:id/status", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    let order;
    if (adapter.usingMongo() && Order) {
      order = await Order.findById(id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      order.status = status;
      await order.save();
      order = order.toObject();
    } else {
      const db = await readDB();
      const idx = db.orders.findIndex((o) => o.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Order not found" });
      }
      db.orders[idx].status = status;
      await writeDB(db);
      order = db.orders[idx];
    }

    return res.json({ ok: true, order });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ error: "Failed to update order status" });
  }
});

// Get All Users with their orders
router.get("/users", adminAuthMiddleware, async (req, res) => {
  try {
    const User = require("../models/User");
    let users;

    if (adapter.usingMongo() && User) {
      users = await User.find().sort({ createdAt: -1 });
      users = users.map((u) => u.toObject());

      // Get orders for each user
      if (Order && adapter.usingMongo()) {
        for (const user of users) {
          try {
            // Use the MongoDB ObjectId (_id) for querying orders
            const userId = user._id;
            const userOrders = await Order.find({ userId }).sort({
              createdAt: -1,
            });
            user.orders = userOrders.map((o) => o.toObject());
            user.orderCount = userOrders.length;
          } catch (orderError) {
            console.error(
              `Error fetching orders for user ${user._id}:`,
              orderError.message
            );
            // If there's an error fetching orders, set empty arrays
            user.orders = [];
            user.orderCount = 0;
          }
        }
      } else {
        const db = await readDB();
        const orders = db.orders || [];
        for (const user of users) {
          const userOrders = orders.filter(
            (o) => o.userId === (user.id || user._id)
          );
          user.orders = userOrders;
          user.orderCount = userOrders.length;
        }
      }
    } else {
      const db = await readDB();
      users = db.users || [];
      const orders = db.orders || [];

      // Get orders for each user
      for (const user of users) {
        const userOrders = orders.filter((o) => o.userId === user.id);
        user.orders = userOrders;
        user.orderCount = userOrders.length;
      }
    }

    return res.json({ ok: true, users });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get Statistics
router.get("/stats", adminAuthMiddleware, async (req, res) => {
  try {
    const { period = "month" } = req.query; // day, week, month, year
    const Order = require("../models/Order");
    const Product = require("../models/Product");
    const User = require("../models/User");

    const now = new Date();
    let startDate;

    switch (period) {
      case "day":
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "week":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    let orders, products, users;

    if (adapter.usingMongo() && Order) {
      // Get orders in the period
      // Filter orders after fetching to handle both Date and string formats
      const allOrders = await Order.find();
      orders = allOrders
        .map((o) => o.toObject())
        .filter((o) => {
          if (!o.createdAt) return false;
          try {
            const orderDate = new Date(o.createdAt);
            return !isNaN(orderDate.getTime()) && orderDate >= startDate;
          } catch {
            return false;
          }
        });

      // Get all products for item stats
      products = await Product.find();
      products = products.map((p) => p.toObject());

      // Get all users
      users = await User.find();
      users = users.map((u) => u.toObject());
    } else {
      const db = await readDB();
      orders = (db.orders || []).filter((o) => {
        if (!o.createdAt) return false;
        try {
          const orderDate = new Date(o.createdAt);
          return !isNaN(orderDate.getTime()) && orderDate >= startDate;
        } catch {
          return false;
        }
      });
      products = db.products || [];
      users = db.users || [];
    }

    // Calculate statistics
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const paidOrders = orders.filter(
      (o) => o.status === "Paid" || o.status === "Completed"
    ).length;
    const pendingOrders = orders.filter(
      (o) => o.status === "Pending Payment"
    ).length;

    // Calculate profit (assuming 30% profit margin for simplicity)
    // In production, you'd calculate based on actual cost vs selling price
    const profit = totalRevenue * 0.3;

    // Daily stats for the period
    const dailyStats = {};
    orders.forEach((order) => {
      if (!order.createdAt) return;
      try {
        const date = new Date(order.createdAt);
        if (isNaN(date.getTime())) return;
        const dateKey = date.toISOString().split("T")[0];
        if (!dailyStats[dateKey]) {
          dailyStats[dateKey] = { revenue: 0, orders: 0, profit: 0 };
        }
        dailyStats[dateKey].revenue += order.total || 0;
        dailyStats[dateKey].orders += 1;
        dailyStats[dateKey].profit += (order.total || 0) * 0.3;
      } catch {
        // Skip invalid dates
      }
    });

    // Monthly stats (last 12 months)
    const monthlyStats = {};
    const last12Months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      last12Months.push(monthKey);
      monthlyStats[monthKey] = { revenue: 0, orders: 0, profit: 0 };
    }

    orders.forEach((order) => {
      if (!order.createdAt) return;
      try {
        const date = new Date(order.createdAt);
        if (isNaN(date.getTime())) return;
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (monthlyStats[monthKey]) {
          monthlyStats[monthKey].revenue += order.total || 0;
          monthlyStats[monthKey].orders += 1;
          monthlyStats[monthKey].profit += (order.total || 0) * 0.3;
        }
      } catch {
        // Skip invalid dates
      }
    });

    // Top selling items
    const itemSales = {};
    orders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item) => {
          const itemName = item.name || item.title || "Unknown";
          if (!itemSales[itemName]) {
            itemSales[itemName] = { name: itemName, quantity: 0, revenue: 0 };
          }
          itemSales[itemName].quantity += item.qty || 1;
          itemSales[itemName].revenue += (item.price || 0) * (item.qty || 1);
        });
      }
    });

    const topSellingItems = Object.values(itemSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    // Orders by status
    const ordersByStatus = {
      "Pending Payment": orders.filter((o) => o.status === "Pending Payment")
        .length,
      Paid: orders.filter((o) => o.status === "Paid").length,
      Preparing: orders.filter((o) => o.status === "Preparing").length,
      Ready: orders.filter((o) => o.status === "Ready").length,
      Completed: orders.filter((o) => o.status === "Completed").length,
    };

    // Customer stats
    const totalCustomers = users.length;
    const newCustomers = users.filter((u) => {
      if (!u.createdAt) return false;
      try {
        const userDate = new Date(u.createdAt);
        return !isNaN(userDate.getTime()) && userDate >= startDate;
      } catch {
        return false;
      }
    }).length;

    return res.json({
      ok: true,
      stats: {
        period,
        summary: {
          totalRevenue,
          totalOrders,
          paidOrders,
          pendingOrders,
          profit,
          totalCustomers,
          newCustomers,
        },
        dailyStats: Object.entries(dailyStats)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, data]) => ({ date, ...data })),
        monthlyStats: last12Months.map((month) => ({
          month,
          ...monthlyStats[month],
        })),
        topSellingItems,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

// Admin Table Routes

// Get All Tables
router.get("/tables", adminAuthMiddleware, async (req, res) => {
  try {
    let tables;

    if (adapter.usingMongo() && Table) {
      tables = await Table.find().sort({ tableNumber: 1 });
      tables = tables.map((t) => t.toObject());
    } else {
      const db = await readDB();
      tables = db.tables || [];
    }

    return res.json({ ok: true, tables });
  } catch (error) {
    console.error("Get tables error:", error);
    return res.status(500).json({ error: "Failed to fetch tables" });
  }
});

// Create Table
router.post("/tables", adminAuthMiddleware, async (req, res) => {
  try {
    const { tableNumber } = req.body;

    if (!tableNumber) {
      return res.status(400).json({ error: "Table number is required" });
    }

    // Generate QR code URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const qrUrl = `${frontendUrl}?table=${tableNumber}`;

    const tableData = {
      tableNumber: tableNumber.toString(),
      qrUrl,
      isActive: true,
    };

    let table;
    if (adapter.usingMongo() && Table) {
      // Check if table number already exists
      const existing = await Table.findOne({
        tableNumber: tableData.tableNumber,
      });
      if (existing) {
        return res.status(400).json({ error: "Table number already exists" });
      }
      table = await Table.create(tableData);
      table = table.toObject();
    } else {
      const db = await readDB();
      db.tables = db.tables || [];
      // Check if table number already exists
      const existing = db.tables.find(
        (t) => t.tableNumber === tableData.tableNumber
      );
      if (existing) {
        return res.status(400).json({ error: "Table number already exists" });
      }
      db.tables.push(tableData);
      await writeDB(db);
      table = tableData;
    }

    return res.json({ ok: true, table });
  } catch (error) {
    console.error("Create table error:", error);
    return res.status(500).json({ error: "Failed to create table" });
  }
});

// Delete Table
router.delete("/tables/:id", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (adapter.usingMongo() && Table) {
      const table = await Table.findByIdAndDelete(id);
      if (!table) {
        return res.status(404).json({ error: "Table not found" });
      }
    } else {
      const db = await readDB();
      const idx = db.tables.findIndex((t) => t.id === id);
      if (idx === -1) {
        return res.status(404).json({ error: "Table not found" });
      }
      db.tables.splice(idx, 1);
      await writeDB(db);
    }

    return res.json({ ok: true, message: "Table deleted" });
  } catch (error) {
    console.error("Delete table error:", error);
    return res.status(500).json({ error: "Failed to delete table" });
  }
});

// Generate QR Code for Table
router.get("/tables/:id/qr", adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const QRCode = require("qrcode");

    let table;
    if (adapter.usingMongo() && Table) {
      table = await Table.findById(id);
    } else {
      const db = await readDB();
      table = db.tables.find((t) => t.id === id);
    }

    if (!table) {
      return res.status(404).json({ error: "Table not found" });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const qrUrl = `${frontendUrl}?table=${table.tableNumber}`;

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 300,
      margin: 2,
    });

    // Update table with QR code data if using MongoDB
    if (adapter.usingMongo() && Table) {
      table.qrCode = qrCodeDataUrl;
      table.qrUrl = qrUrl;
      await table.save();
    }

    return res.json({ ok: true, qrCode: qrCodeDataUrl, qrUrl, table });
  } catch (error) {
    console.error("Generate QR code error:", error);
    return res.status(500).json({ error: "Failed to generate QR code" });
  }
});

module.exports = router;
