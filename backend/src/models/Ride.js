const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    rideType: {
      type: String,
      enum: ["single", "share", "family", "intercity-reserve", "intercity-day-trip", "intercity-inside-city"],
      default: "single",
    },
    pickupAddress: { type: String, required: true },
    dropoffAddress: { type: String, required: true },
    pickupLat: Number,
    pickupLng: Number,
    dropoffLat: Number,
    dropoffLng: Number,
    distanceKm: { type: Number, default: 0 },
    estimatedFare: { type: Number, default: 0 },
    fare: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 },
    driverEarning: { type: Number, default: 0 },
    cashbackEarned: { type: Number, default: 0 },
    penaltyApplied: { type: Number, default: 0 },
    promoCode: { type: String, default: "" },
    bookingMode: {
      type: String,
      enum: ["full_car", "seat_share"],
      default: "full_car",
    },
    vehicleCapacity: { type: Number, default: 5, min: 2, max: 8 },
    partySize: { type: Number, default: 1, min: 1, max: 8 },
    /** Whole-vehicle subtotal after promo, before seat-share split (BDT). */
    tripTotalAfterPromo: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["requested", "accepted", "arrived", "started", "ongoing", "completed", "cancelled"],
      default: "requested",
    },
    cancelReason: String,
    cancelledBy: { type: String, enum: ["user", "driver", "system", ""], default: "" },
    riderRating: Number,
    driverRating: Number,
    chatMessages: [
      {
        senderRole: { type: String, enum: ["user", "driver"], required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
