const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  qty: Number,
  image: String,
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tableNumber: { type: String }, // Table number from QR code
  status: { type: String, default: "Pending Payment" },
  eta: { type: Number },
  items: [OrderItemSchema],
  total: Number,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
