const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortCode: { type: String, unique: true, sparse: true }, // 101, CP, etc.
  numericCode: { type: String, unique: true, sparse: true }, // 101, 102, etc.
  alphabeticCode: { type: String, unique: true, sparse: true }, // CP, PP, etc.
  price: { type: Number, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  description: { type: String },
  image: { type: String },
  isVeg: { type: Boolean, default: true },
  isJain: { type: Boolean, default: false },
  isSpicy: { type: Boolean, default: false },
  preparationTime: { type: Number, default: 15 }, // minutes
  kitchenSection: { type: String, default: "main" }, // main, bar, dessert, etc.
  isFavorite: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  inStock: { type: Boolean, default: true },

  // Customization options
  customizations: [
    {
      name: String, // Size, Toppings, etc.
      type: { type: String, enum: ["single", "multiple"] },
      mandatory: { type: Boolean, default: false },
      options: [
        {
          name: String,
          price: { type: Number, default: 0 },
          isDefault: { type: Boolean, default: false },
        },
      ],
    },
  ],

  // Pricing tiers
  variants: [
    {
      name: String, // Regular, Large, Family
      price: Number,
      isDefault: { type: Boolean, default: false },
    },
  ],

  // Happy hour settings
  happyHour: {
    enabled: { type: Boolean, default: false },
    discountPercent: { type: Number, default: 0 },
    startTime: String, // "17:00"
    endTime: String, // "19:00"
    days: [String], // ["monday", "tuesday"]
  },

  tags: [String],
  allergens: [String],
  nutritionInfo: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
  },

  // Legacy fields for backward compatibility
  title: { type: String },
  type: { type: String },
  size: [{ type: String }],
  color: [{ type: String }],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for fast search
ProductSchema.index({ name: "text", tags: "text" });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ shortCode: 1 });
ProductSchema.index({ isFavorite: -1, isActive: 1 });

module.exports = mongoose.model("Product", ProductSchema);
