const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { generateOrderNumber, handleError } = require("../utils/helpers");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Table = require("../models/Table");
const Area = require("../models/Area");
const Settings = require("../models/Settings");

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
      },
    );
    Readable.from(buffer).pipe(uploadStream);
  });
}

// Public Settings (no auth required)
router.get("/public/settings", async (req, res) => {
  try {
    const settings = (await Settings.getSettings()).toObject();
    const publicSettings = {
      cafeName: settings.cafeName,
      cafeTagline: settings.cafeTagline,
      logo: settings.logo,
      address: settings.address,
      phone: settings.phone,
      email: settings.email,
      website: settings.website,
      currency: settings.currency,
      currencySymbol: settings.currencySymbol,
      timezone: settings.timezone,
      socialMedia: settings.socialMedia,
      googleMapsReviewUrl: settings.googleMapsReviewUrl,
      enableReviewRequest: settings.enableReviewRequest,
      primaryColor: settings.primaryColor,
      secondaryColor: settings.secondaryColor,
    };
    return res.json({ ok: true, settings: publicSettings });
  } catch (error) {
    return handleError(res, error, "Failed to fetch settings");
  }
});

// Admin Login - removed, no auth required

// Admin Product Routes

// Create Product
router.post("/products", upload.single("image1"), async (req, res) => {
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
      inStock: inStock === "true" || inStock === true || inStock === undefined,
      image: imageUrl,
    };

    let product;
    product = (await Product.create(productData)).toObject();

    return res.json({ ok: true, product });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ error: "Failed to create product" });
  }
});

// Get Single Product (admin)
router.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ error: "Product not found" });
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    return res.json({ ok: true, product: product.toObject() });
  } catch (error) {
    return handleError(res, error, "Failed to fetch product");
  }
});

// Update Product
router.put("/products/:id", upload.single("image1"), async (req, res) => {
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
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ error: "Product not found" });
    product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

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

    await product.save();
    return res.json({ ok: true, product: product.toObject() });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete Product
router.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).json({ error: "Product not found" });
    const product = await Product.findByIdAndDelete(id);
    if (!product) return res.status(404).json({ error: "Product not found" });

    return res.json({ ok: true, message: "Product deleted" });
  } catch (error) {
    return handleError(res, error, "Failed to delete product");
  }
});

// Admin Order Routes

// Create POS Order (Staff creates order for customer)
router.post("/pos/orders", async (req, res) => {
  try {
    const {
      customOrderId,
      customerName,
      customerMobile,
      tableNumber,
      orderType = "dine-in",
      items,
      subtotal,
      taxes = [],
      totalTax = 0,
      discounts = [],
      totalDiscount = 0,
      total,
      finalAmount,
      payments = [],
      totalPaid = 0,
      balanceAmount = 0,
      status = "confirmed",
      isComplimentary = false,
      kotPrinted = false,
      kotPrintedAt,
      createdBy,
      notes = "",
      orderTime,
      confirmedAt,
      paidAt,
    } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }

    if (!tableNumber) {
      return res.status(400).json({ error: "Table number is required" });
    }

    const isPosOrder = orderType === "pos";
    if (!isPosOrder && !customerName) {
      return res.status(400).json({ error: "Customer name is required" });
    }

    // Calculate required values
    const calculatedSubtotal =
      subtotal ||
      items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const calculatedTotalTax = totalTax || calculatedSubtotal * 0.18;
    const calculatedTotal =
      total || calculatedSubtotal + calculatedTotalTax - (totalDiscount || 0);
    const calculatedFinalAmount = finalAmount || calculatedTotal;

    // Handle createdBy - create a dummy ObjectId if needed
    let createdByObjectId;
    try {
      if (createdBy && createdBy !== "staff" && ObjectId.isValid(createdBy)) {
        createdByObjectId = new ObjectId(createdBy);
      } else {
        // Create a dummy ObjectId for staff orders
        createdByObjectId = new ObjectId();
      }
    } catch (e) {
      // If invalid ObjectId, create a new one
      createdByObjectId = new ObjectId();
    }

    // Ensure all items have required fields including itemTotal
    const validatedItems = items.map((item) => {
      const itemTotal = item.itemTotal || item.price * item.quantity;
      return {
        productId:
          item.productId && ObjectId.isValid(item.productId)
            ? new ObjectId(item.productId)
            : null,
        name: item.name || "Unknown Item",
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        specialInstructions: item.specialInstructions || "",
        itemTotal: parseFloat(itemTotal),
        isComplimentary: Boolean(item.isComplimentary),
        kotPrinted: Boolean(item.kotPrinted),
      };
    });

    const orderNumber = generateOrderNumber();

    const orderData = {
      customOrderId: customOrderId || `ORD-${Date.now()}`,
      customerName: isPosOrder ? "" : customerName, // Blank for POS orders
      customerMobile: isPosOrder ? "" : customerMobile || "",
      tableNumber: tableNumber.toString(),
      orderType,
      isPosOrder: isPosOrder, // Add flag to identify POS orders
      items: validatedItems,
      subtotal: parseFloat(calculatedSubtotal.toFixed(2)),
      taxes:
        taxes.length > 0
          ? taxes
          : [
              {
                name: "GST",
                rate: 18,
                amount: parseFloat(calculatedTotalTax.toFixed(2)),
              },
            ],
      totalTax: parseFloat(calculatedTotalTax.toFixed(2)),
      discounts: discounts || [],
      totalDiscount: parseFloat((totalDiscount || 0).toFixed(2)),
      total: parseFloat(calculatedTotal.toFixed(2)),
      finalAmount: parseFloat(calculatedFinalAmount.toFixed(2)),
      payments: payments || [],
      totalPaid: parseFloat((totalPaid || 0).toFixed(2)),
      balanceAmount: parseFloat(
        (
          balanceAmount || Math.max(0, calculatedFinalAmount - (totalPaid || 0))
        ).toFixed(2),
      ),
      status: status || "confirmed",
      isComplimentary: Boolean(isComplimentary),
      kotPrinted: Boolean(kotPrinted),
      kotPrintedAt: kotPrintedAt ? new Date(kotPrintedAt) : undefined,
      createdBy: createdByObjectId,
      notes: notes || "",
      orderTime: orderTime ? new Date(orderTime) : new Date(),
      confirmedAt: confirmedAt ? new Date(confirmedAt) : new Date(),
      paidAt: paidAt
        ? new Date(paidAt)
        : (totalPaid || 0) >= calculatedFinalAmount
          ? new Date()
          : undefined,
    };

    const order = (await Order.create(orderData)).toObject();
    return res.json({ ok: true, order });
  } catch (error) {
    console.error("Error creating POS order:", error);
    return res
      .status(500)
      .json({ error: "Failed to create POS order", details: error.message });
  }
});

// Create General Order (for both POS and regular orders)
router.post("/orders", async (req, res) => {
  try {
    const {
      items,
      total,
      orderType = "pos",
      paymentMethod = "Cash",
      tableNumber,
      isPosOrder = true,
      status = "completed",
      paid = true,
    } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required" });
    }

    if (!total || total <= 0) {
      return res.status(400).json({ error: "Valid total is required" });
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Prepare order data
    const orderData = {
      orderNumber: orderNumber,
      customOrderId: `ORD-${Date.now()}`,
      customerName: isPosOrder ? "" : "", // Blank for POS orders
      customerMobile: isPosOrder ? "" : "",
      tableNumber: tableNumber ? tableNumber.toString() : "",
      orderType: orderType,
      isPosOrder: Boolean(isPosOrder),
      items: items.map((item) => ({
        productId: item.productId || null,
        name: item.name || "Unknown Item",
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity || item.qty || 1), // Handle both quantity and qty
        specialInstructions: item.specialInstructions || "",
        itemTotal:
          item.itemTotal ||
          parseFloat(item.price || 0) *
            parseInt(item.quantity || item.qty || 1),
        isComplimentary: Boolean(item.isComplimentary),
        kotPrinted: Boolean(item.kotPrinted),
      })),
      subtotal: parseFloat(total),
      taxes: [
        {
          name: "GST",
          rate: 0,
          amount: 0,
        },
      ],
      totalTax: 0,
      discounts: [],
      totalDiscount: 0,
      total: parseFloat(total),
      finalAmount: parseFloat(total),
      payments: [
        {
          method: paymentMethod.toLowerCase(),
          amount: parseFloat(total),
          paidAt: new Date(),
        },
      ],
      totalPaid: parseFloat(total),
      balanceAmount: 0,
      status: "paid", // Use valid enum value
      paymentMethod: paymentMethod, // Add payment method field
      isComplimentary: false,
      kotPrinted: false,
      notes: "",
      orderTime: new Date(),
      confirmedAt: new Date(),
      paidAt: paid ? new Date() : undefined,
      createdAt: new Date(),
    };

    const order = (await Order.create(orderData)).toObject();
    return res.json({ ok: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    return res
      .status(500)
      .json({ error: "Failed to create order", details: error.message });
  }
});

// Get All Orders
router.get("/orders", async (req, res) => {
  try {
    const User = require("../models/User");
    const orders = (await Order.find().sort({ createdAt: -1 })).map((o) =>
      o.toObject(),
    );

    for (const order of orders) {
      let user = null;
      if (order.userId) {
        try {
          user = await User.findById(order.userId);
        } catch {}
        if (!user) user = await User.findOne({ mobile: order.userId });
      }
      order.userName = user
        ? user.name || user.mobile || "Unknown"
        : order.customerName || "Unknown";
      order.userMobile = user ? user.mobile : "";
    }

    return res.json({ ok: true, orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update Order Status
router.patch("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    let order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.status = status;
    await order.save();
    return res.json({ ok: true, order: order.toObject() });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({ error: "Failed to update order status" });
  }
});

// Get All Users with their orders
router.get("/users", async (req, res) => {
  try {
    const User = require("../models/User");
    const users = (await User.find().sort({ createdAt: -1 })).map((u) =>
      u.toObject(),
    );

    for (const user of users) {
      try {
        const userOrders = await Order.find({
          customerId: user._id,
          $or: [{ isPosOrder: { $ne: true } }, { orderType: { $ne: "pos" } }],
        }).sort({ createdAt: -1 });
        user.orders = userOrders.map((o) => o.toObject());
        user.orderCount = userOrders.length;
      } catch {
        user.orders = [];
        user.orderCount = 0;
      }
    }

    return res.json({ ok: true, users });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get Statistics
router.get("/stats", async (req, res) => {
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
    products = (await Product.find()).map((p) => p.toObject());
    users = (await User.find()).map((u) => u.toObject());

    // Calculate statistics
    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrders = orders.length;
    const paidOrders = orders.filter(
      (o) => o.status === "Paid" || o.status === "Completed",
    ).length;
    const pendingOrders = orders.filter(
      (o) => o.status === "Pending Payment",
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
        date.getMonth() + 1,
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
          date.getMonth() + 1,
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

// Admin Area & Table Routes

// Get All Areas
router.get("/areas", async (req, res) => {
  try {
    const areas = (
      await Area.find({ isActive: true }).sort({ sortOrder: 1, name: 1 })
    ).map((a) => a.toObject());
    return res.json({ ok: true, areas });
  } catch (error) {
    console.error("Get areas error:", error);
    return res.status(500).json({ error: "Failed to fetch areas" });
  }
});

// Admin Table Routes

// Get All Tables
router.get("/tables", async (req, res) => {
  try {
    const tables = (await Table.find().sort({ tableNumber: 1 })).map((t) =>
      t.toObject(),
    );
    return res.json({ ok: true, tables });
  } catch (error) {
    console.error("Get tables error:", error);
    return res.status(500).json({ error: "Failed to fetch tables" });
  }
});

// Create Table
router.post("/tables", async (req, res) => {
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
    // Check if table number already exists
    const existing = await Table.findOne({
      tableNumber: tableData.tableNumber,
    });
    if (existing)
      return res.status(400).json({ error: "Table number already exists" });
    table = (await Table.create(tableData)).toObject();

    return res.json({ ok: true, table });
  } catch (error) {
    console.error("Create table error:", error);
    return res.status(500).json({ error: "Failed to create table" });
  }
});

// Delete Table
router.delete("/tables/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findByIdAndDelete(id);
    if (!table) return res.status(404).json({ error: "Table not found" });

    return res.json({ ok: true, message: "Table deleted" });
  } catch (error) {
    console.error("Delete table error:", error);
    return res.status(500).json({ error: "Failed to delete table" });
  }
});

// Generate QR Code for Table
router.get("/tables/:id/qr", async (req, res) => {
  try {
    const { id } = req.params;
    const QRCode = require("qrcode");

    let table;
    table = await Table.findById(id);

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

    // Update table with QR code data
    table.qrCode = qrCodeDataUrl;
    table.qrUrl = qrUrl;
    await table.save();

    return res.json({ ok: true, qrCode: qrCodeDataUrl, qrUrl, table });
  } catch (error) {
    console.error("Generate QR code error:", error);
    return res.status(500).json({ error: "Failed to generate QR code" });
  }
});

// Admin Settings Routes

// Get Settings
router.get("/settings", async (req, res) => {
  try {
    const settings = (await Settings.getSettings()).toObject();
    return res.json({ ok: true, settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update Settings
router.put("/settings", upload.single("logo"), async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle nested objects
    if (updateData.address && typeof updateData.address === "string") {
      updateData.address = JSON.parse(updateData.address);
    }
    if (updateData.socialMedia && typeof updateData.socialMedia === "string") {
      updateData.socialMedia = JSON.parse(updateData.socialMedia);
    }
    if (
      updateData.businessHours &&
      typeof updateData.businessHours === "string"
    ) {
      updateData.businessHours = JSON.parse(updateData.businessHours);
    }

    // Handle logo upload
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer);
        updateData.logo = result.secure_url;
      } catch (error) {
        console.error("Logo upload error:", error);
        return res.status(500).json({ error: "Failed to upload logo" });
      }
    }

    let settings = await Settings.getSettings();
    Object.assign(settings, updateData);
    await settings.save();
    return res.json({ ok: true, settings: settings.toObject() });
  } catch (error) {
    console.error("Update settings error:", error);
    return res.status(500).json({ error: "Failed to update settings" });
  }
});

module.exports = router;
