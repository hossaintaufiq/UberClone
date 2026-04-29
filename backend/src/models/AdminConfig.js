const mongoose = require("mongoose");

const promoSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, uppercase: true, trim: true },
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    active: { type: Boolean, default: true },
    expiresAt: { type: Date },
  },
  { _id: false }
);

const adminConfigSchema = new mongoose.Schema(
  {
    perKmFare: { type: Number, default: 40, min: 1 },
    commissionRate: { type: Number, default: 0.05, min: 0, max: 1 },
    promoCodes: { type: [promoSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminConfig", adminConfigSchema);
