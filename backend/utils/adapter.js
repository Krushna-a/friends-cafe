const mongoose = require("mongoose");
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { generateOrderNumber } = require("./helpers");

function usingMongo() {
  return mongoose.connection.readyState === 1;
}

async function findOrCreateUserByMobile(mobile, name) {
  let user = await User.findOne({ mobile });
  if (!user) user = await User.create({ mobile, name });
  return user.toObject();
}

async function getUserById(id) {
  try {
    const user = await User.findById(id);
    return user ? user.toObject() : null;
  } catch {
    return null;
  }
}

async function getProducts() {
  return (await Product.find()).map((p) => p.toObject());
}

async function getProductById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const p = await Product.findById(id);
  return p ? p.toObject() : null;
}

async function createOrder({ userId, items, paid, tableNumber }) {
  const transformedItems = items.map((item) => ({
    name: item.name,
    price: item.price || 0,
    quantity: item.qty || 1,
    itemTotal: (item.price || 0) * (item.qty || 1),
    kitchenSection: "main",
    isComplimentary: false,
    kotPrinted: false,
    isReady: false,
  }));

  const subtotal = transformedItems.reduce((s, it) => s + it.itemTotal, 0);
  const total = subtotal;
  const finalAmount = total;

  const orderNumber = generateOrderNumber();

  let customerName = "Customer";
  let customerMobile = "";
  try {
    const user = await User.findById(userId);
    if (user) {
      customerName = user.name || "Customer";
      customerMobile = user.mobile || "";
    }
  } catch {}

  const orderData = {
    orderNumber,
    customerId: userId,
    customerName,
    customerMobile,
    orderType: "dine-in",
    isPosOrder: false,
    items: transformedItems,
    subtotal,
    totalDiscount: 0,
    totalTax: 0,
    total,
    finalAmount,
    totalPaid: paid ? finalAmount : 0,
    balanceAmount: paid ? 0 : finalAmount,
    status: paid ? "paid" : "confirmed",
    tableNumber: tableNumber || null,
    orderTime: new Date(),
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

  const o = await Order.create(orderData);
  return o.toObject();
}

async function getOrdersByUser(userId) {
  const orders = await Order.find({ customerId: userId }).sort({
    createdAt: -1,
  });
  return orders.map((o) => o.toObject());
}

async function payOrder(userId, orderId) {
  try {
    const query = mongoose.Types.ObjectId.isValid(orderId)
      ? { _id: orderId, customerId: userId }
      : { orderNumber: orderId, customerId: userId };

    const o = await Order.findOne(query);
    if (!o) return null;

    o.status = "paid";
    o.paidAt = new Date();
    o.totalPaid = o.finalAmount;
    o.balanceAmount = 0;
    await o.save();
    return o.toObject();
  } catch {
    return null;
  }
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
};
