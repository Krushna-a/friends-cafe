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

    // Send WhatsApp confirmation if order is already paid
    if (paid) {
      try {
        const user = await getUserById(userId);
        if (user && user.mobile) {
          const { sendOrderConfirmation } = require("./whatsapp");

          // Generate invoice URL using MongoDB ObjectId
          const invoiceUrl = `${
            process.env.FRONTEND_URL || "http://localhost:3000"
          }/invoice/${orderObj._id}`;

          await sendOrderConfirmation(user, orderObj, invoiceUrl);
          console.log(
            `WhatsApp confirmation sent to ${user.mobile} for new paid order ${orderObj._id}`
          );
        }
      } catch (whatsappError) {
        console.error(
          "Failed to send WhatsApp confirmation for new order:",
          whatsappError
        );
      }
    }

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

  // Send WhatsApp confirmation if order is already paid (file-based DB)
  if (paid) {
    try {
      const user = await getUserById(userId);
      if (user && user.mobile) {
        const { sendOrderConfirmation } = require("./whatsapp");

        // Generate invoice URL
        const invoiceUrl = `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/invoice/${id}`;

        await sendOrderConfirmation(user, fileOrder, invoiceUrl);
        console.log(
          `WhatsApp confirmation sent to ${user.mobile} for new paid order ${id}`
        );
      }
    } catch (whatsappError) {
      console.error(
        "Failed to send WhatsApp confirmation for new order:",
        whatsappError
      );
    }
  }

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

    // Send WhatsApp confirmation after successful payment
    try {
      console.log("🔍 Attempting to send WhatsApp confirmation...");
      const user = await getUserById(userId);
      console.log(
        "👤 User found:",
        user ? `${user.name} (${user.mobile})` : "No user found"
      );

      if (user && user.mobile) {
        const { sendOrderConfirmation } = require("./whatsapp");

        // Generate invoice URL (you can customize this)
        const invoiceUrl = `${
          process.env.FRONTEND_URL || "http://localhost:3000"
        }/invoice/${orderId}`;
        console.log("🔗 Invoice URL:", invoiceUrl);

        const whatsappResult = await sendOrderConfirmation(
          user,
          o.toObject(),
          invoiceUrl
        );

        if (whatsappResult.success) {
          console.log(
            `✅ WhatsApp confirmation sent successfully to ${user.mobile} for order ${orderId}`
          );
          console.log(`📱 Message SID: ${whatsappResult.data?.sid}`);
        } else {
          console.log(
            `❌ WhatsApp confirmation failed for order ${orderId}:`,
            whatsappResult.error
          );
        }
      } else {
        console.log(
          "⚠️ No user or mobile number found for WhatsApp notification"
        );
      }
    } catch (whatsappError) {
      console.error("❌ WhatsApp confirmation error:", whatsappError.message);
      // Don't fail the payment if WhatsApp fails
    }

    return o.toObject();
  }

  const db = await readDB();
  const idx = (db.orders || []).findIndex(
    (o) => o.id === orderId && o.userId === userId
  );
  if (idx === -1) return null;
  db.orders[idx].status = "Paid";
  await writeDB(db);

  // Send WhatsApp confirmation for file-based DB
  try {
    const user = await getUserById(userId);
    if (user && user.mobile) {
      const { sendOrderConfirmation } = require("./whatsapp");

      // Generate invoice URL
      const invoiceUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/invoice/${orderId}`;

      await sendOrderConfirmation(user, db.orders[idx], invoiceUrl);
      console.log(
        `WhatsApp confirmation sent to ${user.mobile} for order ${orderId}`
      );
    }
  } catch (whatsappError) {
    console.error("Failed to send WhatsApp confirmation:", whatsappError);
    // Don't fail the payment if WhatsApp fails
  }

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
