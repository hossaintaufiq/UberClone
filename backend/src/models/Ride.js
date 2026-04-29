const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    pickupAddress: { type: String, required: true },
    dropoffAddress: { type: String, required: true },
    pickupLat: Number,
    pickupLng: Number,
    dropoffLat: Number,
    dropoffLng: Number,
    fare: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["requested", "accepted", "arrived", "started", "completed", "cancelled"],
      default: "requested",
    },
    cancelReason: String,
    riderRating: Number,
    driverRating: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ride", rideSchema);
