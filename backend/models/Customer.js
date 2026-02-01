const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true, unique: true },
  email: { type: String },
  birthday: { type: Date },
  anniversary: { type: Date },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String,
  },

  // Customer classification
  type: {
    type: String,
    enum: ["regular", "vip", "bulk", "corporate"],
    default: "regular",
  },

  // Visit tracking
  totalVisits: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastVisit: { type: Date },
  firstVisit: { type: Date, default: Date.now },

  // Preferences
  preferences: {
    cuisine: [String],
    spiceLevel: { type: String, enum: ["mild", "medium", "hot"] },
    dietaryRestrictions: [String],
  },

  // Loyalty
  loyaltyPoints: { type: Number, default: 0 },
  membershipTier: {
    type: String,
    enum: ["bronze", "silver", "gold", "platinum"],
    default: "bronze",
  },

  // Marketing
  allowMarketing: { type: Boolean, default: true },
  allowSMS: { type: Boolean, default: true },
  allowEmail: { type: Boolean, default: true },

  notes: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes
CustomerSchema.index({ mobile: 1 });
CustomerSchema.index({ type: 1, isActive: 1 });
CustomerSchema.index({ totalSpent: -1 });

module.exports = mongoose.model("Customer", CustomerSchema);
