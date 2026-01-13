const express = require("express");
const jwt = require("jsonwebtoken");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s*/, "");
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    req.user = payload;
    return next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.post("/", authMiddleware, async (req, res) => {
  const { items, paid, tableNumber } = req.body || {};
  if (!items || !Array.isArray(items) || items.length === 0)
    return res.status(400).json({ error: "items required" });

  try {
    const adapter = require("../utils/adapter");
    const order = await adapter.createOrder({
      userId: req.user.id,
      items,
      paid,
      tableNumber,
    });
    console.log(
      `Order created: ${order._id || order.id} for user: ${
        req.user.id
      }, table: ${tableNumber || "N/A"}, status: ${order.status}`
    );
    return res.json({ ok: true, order });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/", authMiddleware, async (req, res) => {
  const adapter = require("../utils/adapter");
  const orders = await adapter.getOrdersByUser(req.user.id);
  return res.json({ ok: true, orders });
});

// Pay an order (mark as Paid)
router.patch("/:id/pay", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body || {};

    // Require payment verification details to mark an order Paid
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ error: "Missing payment verification details" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const crypto = require("crypto");
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const adapter = require("../utils/adapter");
    const order = await adapter.payOrder(req.user.id, id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Optionally include payment id in response so client can show it
    return res.json({ ok: true, order, paymentId: razorpay_payment_id });
  } catch (err) {
    console.error("Error in order pay route:", err);
    return res.status(500).json({ error: "Failed to process payment update" });
  }
});

module.exports = router;
