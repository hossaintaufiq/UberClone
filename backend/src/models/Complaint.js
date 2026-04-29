const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: "Ride" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in_review", "resolved", "rejected"],
      default: "open",
    },
    adminNote: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
