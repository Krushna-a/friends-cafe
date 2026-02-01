const express = require("express");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const adapter = require("../utils/adapter");

const router = express.Router();
const OTP_LIFETIME = 5 * 60 * 1000; // 5 minutes

// Rate limiter for send-otp: limit to 5 requests per 15 minutes per IP
const sendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: "Too many OTP requests, try again later" },
});

// ---------- Helpers ----------

function genOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function hashOtp(otp) {
  const secret = process.env.OTP_SECRET || "dev-otp-secret";
  return crypto.createHmac("sha256", secret).update(otp).digest("hex");
}

// Normalize to E.164 (India default)
function normalizePhone(mobile) {
  if (!mobile) throw new Error("Mobile required");

  let phone = String(mobile).trim();
  phone = phone.replace(/[\s\-()]/g, "");

  // Already E.164
  if (phone.startsWith("+")) return phone;

  // India numbers: 10 digits starting 6–9
  if (/^[6-9]\d{9}$/.test(phone)) {
    return "+91" + phone;
  }

  throw new Error("Invalid mobile number");
}

// ---------- Routes ----------

router.post("/send-otp", sendLimiter, async (req, res) => {
  let { mobile, name } = req.body || {};

  try {
    mobile = normalizePhone(mobile);
  } catch {
    return res.status(400).json({ error: "Invalid mobile number" });
  }

  const code = genOtp();
  const expiresAt = new Date(Date.now() + OTP_LIFETIME);
  const hash = hashOtp(code);

  try {
    await adapter.saveOtpForMobile(mobile, hash, expiresAt, name || "");
  } catch (e) {
    console.error("Failed to save OTP", e);
    return res.status(500).json({ error: "Failed to generate OTP" });
  }

  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM;

  const resp = { ok: true };

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const client = require("twilio")(twilioSid, twilioToken);
      const message = await client.messages.create({
        body: `Your verification code is ${code}`,
        from: twilioFrom,
        to: mobile,
      });
      console.log(
        `OTP sent successfully via Twilio SMS. SID: ${message.sid}, To: ${mobile}`
      );
      resp.message = "OTP sent via SMS";
    } catch (e) {
      console.error("Twilio SMS send failed:", {
        error: e.message,
        code: e.code,
        status: e.status,
        moreInfo: e.moreInfo,
        mobile: mobile,
        from: twilioFrom,
      });
      // Return more detailed error in development, generic in production
      const errorMsg =
        process.env.NODE_ENV === "development"
          ? `Failed to send OTP via SMS: ${e.message || "Unknown error"}`
          : "Failed to send OTP. Please check server logs for details.";
      return res.status(500).json({
        error: errorMsg,
        details: process.env.NODE_ENV === "development" ? e.message : undefined,
      });
    }
  } else {
    // Log warning when Twilio credentials are missing
    const missingVars = [];
    if (!twilioSid) missingVars.push("TWILIO_ACCOUNT_SID");
    if (!twilioToken) missingVars.push("TWILIO_AUTH_TOKEN");
    if (!twilioFrom) missingVars.push("TWILIO_FROM");

    console.warn(
      `Twilio credentials missing: ${missingVars.join(
        ", "
      )}. OTP will not be sent via SMS.`
    );

    // DEV fallback only
    if (process.env.NODE_ENV === "development") {
      resp.otp = code;
      resp.message = "OTP generated (dev mode - SMS not configured)";
      resp.warning =
        "Twilio not configured. OTP returned in response for development only.";
    } else {
      // In production, we should not silently fail
      console.error(
        "ERROR: Twilio credentials missing in production mode. OTP cannot be sent!"
      );
      return res.status(500).json({
        error: "SMS service not configured. Please contact support.",
        message:
          "OTP generation succeeded but SMS sending failed due to missing configuration.",
      });
    }
  }

  return res.json(resp);
});

router.post("/verify", async (req, res) => {
  let { mobile, code } = req.body || {};

  try {
    mobile = normalizePhone(mobile);
  } catch {
    return res.status(400).json({ error: "Invalid mobile number" });
  }

  if (!code) return res.status(400).json({ error: "OTP required" });

  try {
    const rec = await adapter.getOtpRecord(mobile);
    if (!rec)
      return res.status(400).json({ error: "OTP expired or not found" });

    if (new Date(rec.expiresAt) < new Date()) {
      await adapter.deleteOtpRecord(mobile);
      return res.status(400).json({ error: "OTP expired" });
    }

    if (hashOtp(code) !== rec.hash) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const user = await adapter.findOrCreateUserByMobile(mobile, rec.name || "");

    await adapter.deleteOtpRecord(mobile);

    const token = jwt.sign(
      { id: user._id, mobile: user.mobile },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" }
    );

    return res.json({ ok: true, user, token });
  } catch (e) {
    console.error("OTP verify error", e);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s*/, "");

  if (!token) return res.status(401).json({ error: "Missing token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "devsecret");
    const user = await adapter.getUserById(payload.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ ok: true, user });
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
});

// Check if user exists by mobile (for showing existing name)
router.post("/check-user", async (req, res) => {
  let { mobile } = req.body || {};

  try {
    mobile = normalizePhone(mobile);
  } catch {
    return res.status(400).json({ error: "Invalid mobile number" });
  }

  try {
    const User = require("../models/User");
    let user = null;

    if (adapter.usingMongo() && User) {
      user = await User.findOne({ mobile });
    } else {
      const { readDB } = require("../utils/db");
      const db = await readDB();
      user = (db.users || []).find((u) => u.mobile === mobile);
    }

    if (user) {
      return res.json({
        ok: true,
        exists: true,
        name: user.name || "",
        mobile: user.mobile,
      });
    }

    return res.json({ ok: true, exists: false });
  } catch (e) {
    console.error("Check user error", e);
    return res.status(500).json({ error: "Failed to check user" });
  }
});

module.exports = router;
