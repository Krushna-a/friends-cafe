const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true, unique: true },
  qrCode: { type: String }, // URL to QR code image or data
  qrUrl: { type: String }, // URL that the QR code points to
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Table", TableSchema);
