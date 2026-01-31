const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: { type: String, required: true },
  shortCode: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  variant: String, // Regular, Large, etc.
  customizations: [
    {
      name: String,
      options: [String],
      additionalPrice: { type: Number, default: 0 },
    },
  ],
  specialInstructions: String,
  kitchenSection: { type: String, default: "main" },
  isComplimentary: { type: Boolean, default: false },
  discount: {
    type: { type: String, enum: ["percentage", "fixed"] },
    value: { type: Number, default: 0 },
    reason: String,
  },
  itemTotal: { type: Number, required: true },
  kotPrinted: { type: Boolean, default: false },
  kotPrintedAt: Date,
  isReady: { type: Boolean, default: false },
  readyAt: Date,
});

const OrderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: { type: String, required: true, unique: true },
  customOrderId: String, // For display purposes

  // Customer & Location
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  customerName: String,
  customerMobile: String,

  // Table & Area
  tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
  areaId: { type: mongoose.Schema.Types.ObjectId, ref: "Area" },
  tableNumber: String,

  // Order type
  orderType: {
    type: String,
    enum: ["dine-in", "takeaway", "delivery", "pos"],
    default: "dine-in",
  },
  isPosOrder: { type: Boolean, default: false }, // Flag for POS orders

  // Items
  items: [OrderItemSchema],

  // Pricing
  subtotal: { type: Number, required: true },

  // Discounts
  discounts: [
    {
      type: {
        type: String,
        enum: ["percentage", "fixed", "coupon", "happy-hour"],
      },
      value: Number,
      amount: Number,
      reason: String,
      appliedBy: String,
    },
  ],
  totalDiscount: { type: Number, default: 0 },

  // Taxes
  taxes: [
    {
      name: String, // CGST, SGST, Service Charge
      rate: Number,
      amount: Number,
    },
  ],
  totalTax: { type: Number, default: 0 },

  // Final amounts
  total: { type: Number, required: true },
  roundOff: { type: Number, default: 0 },
  finalAmount: { type: Number, required: true },

  // Payment
  payments: [
    {
      method: {
        type: String,
        enum: ["cash", "card", "upi", "wallet", "online"],
      },
      amount: Number,
      reference: String,
      paidAt: { type: Date, default: Date.now },
    },
  ],
  totalPaid: { type: Number, default: 0 },
  balanceAmount: { type: Number, default: 0 },
  
  // Primary payment method for display
  paymentMethod: {
    type: String,
    enum: ["Cash", "UPI", "Card", "Wallet", "Online"],
    default: "Cash",
  },

  // Status tracking
  status: {
    type: String,
    enum: [
      "draft",
      "confirmed",
      "preparing",
      "ready",
      "served",
      "billed",
      "paid",
      "cancelled",
    ],
    default: "draft",
  },

  // Kitchen workflow
  kotNumber: String,
  kotPrinted: { type: Boolean, default: false },
  kotPrintedAt: Date,

  // Billing
  billPrinted: { type: Boolean, default: false },
  billPrintedAt: Date,

  // Special flags
  isComplimentary: { type: Boolean, default: false },
  isSplit: { type: Boolean, default: false },
  parentOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  splitOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],

  // Delivery (if applicable)
  deliveryAddress: {
    street: String,
    city: String,
    pincode: String,
    landmark: String,
  },
  deliveryCharge: { type: Number, default: 0 },
  estimatedDeliveryTime: Date,

  // Staff tracking
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  servedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  billedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Timestamps
  orderTime: { type: Date, default: Date.now },
  confirmedAt: Date,
  readyAt: Date,
  servedAt: Date,
  billedAt: Date,
  paidAt: Date,

  // Notes
  notes: String,
  kitchenNotes: String,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });
OrderSchema.index({ tableId: 1, status: 1 });
OrderSchema.index({ customerId: 1, createdAt: -1 });
OrderSchema.index({ createdAt: -1 });

// Auto-generate order number
OrderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        $lt: new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 1,
        ),
      },
    });
    this.orderNumber = `${dateStr}${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", OrderSchema);
