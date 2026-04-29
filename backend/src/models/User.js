const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "rider", "driver", "super_admin", "moderator", "support"],
      required: true,
    },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    otp: { type: String },
    otpExpiresAt: { type: Date },
    profilePhoto: { type: String },
    isOnline: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    approved: { type: Boolean, default: false },
    rating: { type: Number, default: 5 },
    cashbackBalance: { type: Number, default: 0 },
    pendingPenalty: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    loyaltyBonusEligible: { type: Boolean, default: false },
    joinedAt: { type: Date, default: Date.now },
    location: {
      lat: Number,
      lng: Number,
      updatedAt: Date,
    },
    documents: [
      {
        name: String,
        url: String,
        verified: { type: Boolean, default: false },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
    fcmToken: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
