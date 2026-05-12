const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    rideId: { type: mongoose.Schema.Types.ObjectId, ref: "Ride", required: true },
    riderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    /** cash | bkash | nagad | card — validated on POST /rides/:id/pay */
    method: { type: String, default: "cash" },
    status: { type: String, enum: ["paid", "failed"], default: "paid" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
