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
  const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
  const eta = 10 + Math.floor(Math.random() * 20);
  const status = paid ? "Paid" : "Pending Payment";
  const order = { userId, status, eta, items, total };
  if (tableNumber) {
    order.tableNumber = tableNumber;
  }

  if (usingMongo() && Order) {
    const o = await Order.create(order);
    const orderObj = o.toObject();

    console.log(`✅ Order created successfully with ID: ${orderObj._id}`);
    return orderObj;
  }

  // File-based DB fallback
  const { getISTDateForDB } = require("./dateUtils");
  const id = `ORD-${Date.now().toString().slice(-6)}`;
  const createdAt = getISTDateForDB();
  const fileOrder = { id, userId, status, createdAt, eta, items, total };
  if (tableNumber) {
    fileOrder.tableNumber = tableNumber;
  }

  const db = await readDB();
  db.orders = db.orders || [];
  db.orders.unshift(fileOrder);
  await writeDB(db);

  console.log(`✅ Order created successfully with ID: ${id}`);
  return fileOrder;
}

async function getOrdersByUser(userId) {
  if (usingMongo() && Order) {
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return orders.map((o) => o.toObject());
  }
  const db = await readDB();
  return (db.orders || []).filter((o) => o.userId === userId);
}

async function payOrder(userId, orderId) {
  if (usingMongo() && Order) {
    const o = await Order.findOne({ _id: orderId, userId });
    if (!o) return null;
    o.status = "Paid";
    await o.save();

    console.log(`✅ Order ${orderId} marked as paid successfully`);
    return o.toObject();
  }

  const db = await readDB();
  const idx = (db.orders || []).findIndex(
    (o) => o.id === orderId && o.userId === userId
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
      { upsert: true, new: true, setDefaultsOnInsert: true }
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
