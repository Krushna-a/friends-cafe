const express = require("express");
const jwt = require("jsonwebtoken");
const adapter = require("../utils/adapter");
const { normalizePhone } = require("../utils/helpers");

const router = express.Router();

// Login: provide mobile + name, get JWT back immediately
router.post("/login", async (req, res) => {
  let { mobile, name } = req.body || {};

  try {
    mobile = normalizePhone(mobile);
  } catch {
    return res.status(400).json({ error: "Invalid mobile number" });
  }

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const user = await adapter.findOrCreateUserByMobile(mobile, name.trim());
    const token = jwt.sign(
      { id: user._id, mobile: user.mobile },
      process.env.JWT_SECRET || "devsecret",
      { expiresIn: "7d" },
    );
    return res.json({ ok: true, user, token });
  } catch (e) {
    console.error("Login error", e);
    return res.status(500).json({ error: "Login failed" });
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

// Check if user exists by mobile (for pre-filling name)
router.post("/check-user", async (req, res) => {
  let { mobile } = req.body || {};

  try {
    mobile = normalizePhone(mobile);
  } catch {
    return res.status(400).json({ error: "Invalid mobile number" });
  }

  try {
    const User = require("../models/User");
    const user = await User.findOne({ mobile });
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
