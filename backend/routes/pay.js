const express = require("express");
const Razorpay = require("razorpay");

const router = express.Router();

// Initialise Razorpay instance with keys from environment
// Make sure you set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env
const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

// Create a payment order with Razorpay (supports UPI apps like GPay / PhonePe / Paytm)
router.post("/create", async (req, res) => {
  try {
    const { amount, provider } = req.body || {};
    if (!amount) {
      return res.status(400).json({ error: "amount required" });
    }

    if (!razorpay) {
      return res.status(500).json({
        error:
          "Payment gateway not configured. Ask admin to set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }

    // Razorpay expects amount in paise (₹100 => 10000)
    const amountInPaise = Math.round(Number(amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `REC-${Date.now().toString().slice(-8)}`,
      notes: {
        provider: provider || "upi",
      },
    });

    return res.json({
      ok: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      provider,
    });
  } catch (err) {
    console.error("Error creating Razorpay order:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to create payment. Please try again." });
  }
});

// Verify payment signature
router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    if (!razorpay) {
      return res.status(500).json({
        error: "Payment gateway not configured",
      });
    }

    // Verify the payment signature
    const crypto = require("crypto");
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      return res.json({
        ok: true,
        verified: true,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
    } else {
      return res.status(400).json({
        ok: false,
        verified: false,
        error: "Invalid payment signature",
      });
    }
  } catch (err) {
    console.error("Error verifying payment:", err.message);
    return res.status(500).json({ error: "Failed to verify payment" });
  }
});

// Keep status route for potential future verification / polling
router.get("/:id/status", async (req, res) => {
  const { id } = req.params;
  return res.json({
    ok: true,
    status: "PENDING",
    id,
    note: "Status endpoint not wired to gateway yet; rely on Razorpay callback.",
  });
});

module.exports = router;
