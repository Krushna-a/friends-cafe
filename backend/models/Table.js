const mongoose = require("mongoose");

const TableSchema = new mongoose.Schema({
  tableNumber: { type: String, required: true, unique: true },
  areaId: { type: mongoose.Schema.Types.ObjectId, ref: "Area" }, // Made optional
  capacity: { type: Number, default: 4 },
  status: {
    type: String,
    enum: ["vacant", "running", "billed", "maintenance"],
    default: "vacant",
  },
  currentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  qrCode: { type: String },
  qrUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

// Index for table number uniqueness
TableSchema.index({ tableNumber: 1 }, { unique: true });

module.exports = mongoose.model("Table", TableSchema);
