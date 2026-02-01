const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
  // Cafe Information
  cafeName: { type: String, default: "Friends Cafe" },
  cafeTagline: { type: String, default: "Coffee & More" },
  logo: { type: String, default: "" }, // URL to logo image

  // Contact Information
  address: {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },
  },

  phone: { type: String, default: "" },
  email: { type: String, default: "" },
  website: { type: String, default: "" },

  // Business Information
  gstNumber: { type: String, default: "" },
  fssaiNumber: { type: String, default: "" },
  businessHours: {
    monday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "22:00" },
      closed: { type: Boolean, default: false },
    },
    tuesday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "22:00" },
      closed: { type: Boolean, default: false },
    },
    wednesday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "22:00" },
      closed: { type: Boolean, default: false },
    },
    thursday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "22:00" },
      closed: { type: Boolean, default: false },
    },
    friday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "22:00" },
      closed: { type: Boolean, default: false },
    },
    saturday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "22:00" },
      closed: { type: Boolean, default: false },
    },
    sunday: {
      open: { type: String, default: "09:00" },
      close: { type: String, default: "22:00" },
      closed: { type: Boolean, default: false },
    },
  },

  // System Settings
  currency: { type: String, default: "INR" },
  currencySymbol: { type: String, default: "₹" },
  timezone: { type: String, default: "Asia/Kolkata" },

  // Tax Settings
  defaultTaxRate: { type: Number, default: 18 }, // GST rate
  serviceChargeRate: { type: Number, default: 0 },

  // Receipt Settings
  receiptHeader: { type: String, default: "" },
  receiptFooter: {
    type: String,
    default: "Thank you for your business!\nVisit us again soon",
  },
  printLogo: { type: Boolean, default: true },

  // POS Settings
  autoKotPrint: { type: Boolean, default: false },
  autoBillPrint: { type: Boolean, default: false },
  roundOffBills: { type: Boolean, default: true },

  // Notification Settings
  lowStockAlert: { type: Boolean, default: true },
  lowStockThreshold: { type: Number, default: 10 },
  orderNotifications: { type: Boolean, default: true },

  // Social Media
  socialMedia: {
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
  },

  // Theme Settings
  primaryColor: { type: String, default: "#059669" }, // emerald-600
  secondaryColor: { type: String, default: "#0891b2" }, // cyan-600

  // System Info
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure only one settings document exists
SettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Update timestamp on save
SettingsSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Settings", SettingsSchema);
