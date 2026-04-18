const express = require("express");
const Razorpay = require("razorpay");

const router = express.Router();

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

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

    const amountInPaise = Math.round(Number(amount) * 100);

    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: `REC-${Date.now().toString().slice(-8)}`,
        notes: { provider: provider || "upi" },
      });

      return res.json({
        ok: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID,
        provider,
      });
    } catch (razorpayError) {
      console.error("Razorpay API error:", razorpayError);

      if (razorpayError.statusCode === 401) {
        return res.json({
          ok: true,
          orderId: `order_mock_${Date.now()}`,
          amount: amountInPaise,
          currency: "INR",
          key: process.env.RAZORPAY_KEY_ID,
          provider,
          mock: true,
        });
      }

      throw razorpayError;
    }
  } catch (err) {
    console.error("Error creating Razorpay order:", err.message);
    return res
      .status(500)
      .json({ error: "Failed to create payment. Please try again." });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    if (!razorpay) {
      return res.status(500).json({ error: "Payment gateway not configured" });
    }

    const crypto = require("crypto");
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
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
      return res
        .status(400)
        .json({
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

router.get("/:id/status", async (req, res) => {
  return res.json({ ok: true, status: "PENDING", id: req.params.id });
});

module.exports = router;
