const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String }, // Alias for name
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
  category: { type: String, required: true },
  type: { type: String },
  size: [{ type: String }],
  color: [{ type: String }],
  tags: [{ type: String }],
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", ProductSchema);
