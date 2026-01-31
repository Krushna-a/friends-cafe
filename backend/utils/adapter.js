const mongoose = require("mongoose");
const { readDB, writeDB } = require("./db");

let User, Product, Order, Otp;
try {
  User = require("../models/User");
  Product = require("../models/Product");
  Order = require("../models/Order");
  Otp = require("../models/Otp");
} catch (e) {
  // models may not be available if mongo not installed
}

function usingMongo() {
  return (
    mongoose && mongoose.connection && mongoose.connection.readyState === 1
  );
}

async function findOrCreateUserByMobile(mobile, name) {
  if (usingMongo() && User) {
    let user = await User.findOne({ mobile });
    if (!user) {
      user = await User.create({ mobile, name });
    }
    return user.toObject();
  }

  const db = await readDB();
  let user = db.users.find((u) => u.mobile === mobile);
  if (!user) {
    user = { id: `U-${Date.now().toString().slice(-6)}`, mobile, name };
    db.users.push(user);
    await writeDB(db);
  }
  return user;
}

async function getUserById(id) {
  if (usingMongo() && User) {
    try {
      const user = await User.findById(id);
      return user ? user.toObject() : null;
    } catch (error) {
      console.error("Error finding user by ID:", error.message);
      return null;
    }
  }

  const db = await readDB();
  return db.users.find((u) => u.id === id) || null;
}

async function getProducts() {
  if (usingMongo() && Product) {
    return (await Product.find()).map((p) => p.toObject());
  }
  const db = await readDB();
  return db.products || [];
}

async function getProductById(id) {
  if (usingMongo() && Product) {
    const p = await Product.findById(id);
    return p ? p.toObject() : null;
  }
  const db = await readDB();
  return db.products.find((p) => p.id === id) || null;
}

async function createOrder({ userId, items, paid, tableNumber }) {
  // Transform items to match Order model schema
  const transformedItems = items.map((item) => ({
    name: item.name,
    price: item.price || 0,
    quantity: item.qty || 1, // Map qty to quantity
    itemTotal: (item.price || 0) * (item.qty || 1), // Calculate itemTotal
    // Add other required fields with defaults
    kitchenSection: "main",
    isComplimentary: false,
    kotPrinted: false,
    isReady: false,
  }));

  const subtotal = transformedItems.reduce((s, it) => s + it.itemTotal, 0);
  const totalTax = 0; // No tax for now
  const totalDiscount = 0; // No discount for now
  const total = subtotal - totalDiscount + totalTax;
  const finalAmount = total;

  console.log("Order totals:", { subtotal, total, finalAmount });

  // Generate order number manually to ensure it's set
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const orderNumber = `${dateStr}${String(Date.now()).slice(-4)}`;
  console.log("Generated order number:", orderNumber);

  // Get user information to populate customer details
  let customerName = "Customer";
  let customerMobile = "";

  if (usingMongo() && User) {
    try {
      const user = await User.findById(userId);
      if (user) {
        customerName = user.name || "Customer";
        customerMobile = user.mobile || "";
        console.log("Found user details:", {
          name: customerName,
          mobile: customerMobile,
        });
      }
    } catch (error) {
      console.log("Could not fetch user details:", error.message);
    }
  }

  const orderData = {
    // Order identification
    orderNumber: orderNumber,

    // Customer info
    customerId: userId,
    customerName: customerName,
    customerMobile: customerMobile,

    // Order type
    orderType: "dine-in",
    isPosOrder: false,

    // Items
    items: transformedItems,

    // Pricing
    subtotal,
    totalDiscount,
    totalTax,
    total,
    finalAmount,

    // Payment
    totalPaid: paid ? finalAmount : 0,
    balanceAmount: paid ? 0 : finalAmount,

    // Status
    status: paid ? "paid" : "confirmed",

    // Table
    tableNumber: tableNumber || null,

    // Timestamps
    orderTime: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  if (paid) {
    orderData.payments = [
      {
        method: "online",
        amount: finalAmount,
        reference: `mock_payment_${Date.now()}`,
        paidAt: new Date(),
      },
    ];
    orderData.paidAt = new Date();
  }

  if (usingMongo() && Order) {
    try {
      const o = await Order.create(orderData);
      const orderObj = o.toObject();
      console.log(`✅ Order created successfully with ID: ${orderObj._id}`);
      return orderObj;
    } catch (error) {
      console.error("MongoDB Order creation error:", error);
      throw error;
    }
  }

  // File-based DB fallback
  const { getISTDateForDB } = require("./dateUtils");
  const id = `ORD-${Date.now().toString().slice(-6)}`;
  const createdAt = getISTDateForDB();
  const eta = 10 + Math.floor(Math.random() * 20);
  const status = paid ? "Paid" : "Pending Payment";

  const fileOrder = {
    id,
    userId,
    status,
    createdAt,
    eta,
    items,
    total: subtotal,
    tableNumber,
  };

  const db = await readDB();
  db.orders = db.orders || [];
  db.orders.unshift(fileOrder);
  await writeDB(db);

  console.log(`✅ Order created successfully with ID: ${id}`);
  return fileOrder;
}

async function getOrdersByUser(userId) {
  console.log("getOrdersByUser called with userId:", userId);

  if (usingMongo() && Order) {
    // Query using customerId instead of userId to match the Order model
    const orders = await Order.find({ customerId: userId }).sort({
      createdAt: -1,
    });
    console.log("Found orders for user:", orders.length);
    return orders.map((o) => o.toObject());
  }
  const db = await readDB();
  return (db.orders || []).filter((o) => o.userId === userId);
}

async function payOrder(userId, orderId) {
  if (usingMongo() && Order) {
    try {
      // Handle both string and ObjectId formats
      const query = mongoose.Types.ObjectId.isValid(orderId)
        ? { _id: orderId, customerId: userId }
        : { orderNumber: orderId, customerId: userId };

      const o = await Order.findOne(query);
      if (!o) {
        console.log(`Order not found with query:`, query);
        return null;
      }

      o.status = "paid";
      o.paidAt = new Date();
      o.totalPaid = o.finalAmount;
      o.balanceAmount = 0;
      await o.save();

      console.log(`✅ Order ${orderId} marked as paid successfully`);
      return o.toObject();
    } catch (error) {
      console.error("Error in payOrder:", error);
      return null;
    }
  }

  const db = await readDB();
  const idx = (db.orders || []).findIndex(
    (o) => o.id === orderId && o.userId === userId,
  );
  if (idx === -1) return null;
  db.orders[idx].status = "Paid";
  await writeDB(db);

  console.log(`✅ Order ${orderId} marked as paid successfully`);
  return db.orders[idx];
}

// OTP helpers: save/get/delete OTP records (works with Mongo or file-based db)
async function saveOtpForMobile(mobile, hash, expiresAt, name = "") {
  if (usingMongo() && Otp) {
    const up = await Otp.findOneAndUpdate(
      { mobile },
      { hash, expiresAt, name },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
    return up.toObject();
  }
  const db = await readDB();
  db.otps = db.otps || [];
  const idx = db.otps.findIndex((o) => o.mobile === mobile);
  const rec = { mobile, hash, expiresAt: expiresAt, name };
  if (idx === -1) db.otps.push(rec);
  else db.otps[idx] = rec;
  await writeDB(db);
  return rec;
}

async function getOtpRecord(mobile) {
  if (usingMongo() && Otp) {
    const r = await Otp.findOne({ mobile });
    return r ? r.toObject() : null;
  }
  const db = await readDB();
  db.otps = db.otps || [];
  return db.otps.find((o) => o.mobile === mobile) || null;
}

async function deleteOtpRecord(mobile) {
  if (usingMongo() && Otp) {
    await Otp.deleteOne({ mobile });
    return true;
  }
  const db = await readDB();
  db.otps = (db.otps || []).filter((o) => o.mobile !== mobile);
  await writeDB(db);
  return true;
}

module.exports = {
  usingMongo,
  findOrCreateUserByMobile,
  getUserById,
  getProducts,
  getProductById,
  createOrder,
  getOrdersByUser,
  payOrder,
  saveOtpForMobile,
  getOtpRecord,
  deleteOtpRecord,
};
