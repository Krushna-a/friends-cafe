const mongoose = require("mongoose");

const AreaSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Ground Floor, First Floor, AC Hall, etc.
  code: { type: String, required: true, unique: true }, // GF, FF, AC, etc.
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Area", AreaSchema);
