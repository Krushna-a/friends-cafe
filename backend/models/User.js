const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  name: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
