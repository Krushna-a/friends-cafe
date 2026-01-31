const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, index: true, unique: true },
    hash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    name: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
