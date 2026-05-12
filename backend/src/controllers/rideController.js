const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const Ride = require("../models/Ride");
const User = require("../models/User");
const mongoose = require("mongoose");
const { calculateFare, findNearestDriver, haversineKm, countEligibleDriversAtPickup } = require("../services/rideService");

const emitRide = (req, rideId, event, payload) => {
  const io = req.app.get("io");
  io.to(`ride:${rideId}`).emit(event, payload);
};

const emitSystemRefresh = (req, payload = {}) => {
  const io = req.app.get("io");
  io.emit("system:refresh", { ts: Date.now(), ...payload });
};

const RIDE_TYPES = new Set(["single", "share", "family", "intercity-reserve", "intercity-day-trip", "intercity-inside-city"]);

function normalizeRideType(value) {
  const raw = String(value || "single")
    .trim()
    .toLowerCase()
    .replace(/_/g, "-");
  return RIDE_TYPES.has(raw) ? raw : "single";
}

function normalizeBookingMode(value) {
  const raw = String(value || "full_car")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
  if (raw === "seat_share" || raw === "shared" || raw === "share_seats") return "seat_share";
  return "full_car";
}

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

exports.requestRide = async (req, res) => {
  try {
    const riderId = String(req.user?.id || "").trim();
    if (!mongoose.Types.ObjectId.isValid(riderId)) {
      return res.status(401).json({ success: false, message: "Invalid session. Please log in again." });
    }

    const rider = await User.findById(riderId);
    if (!rider || !rider.isActive) return res.status(403).json({ success: false, message: "User account unavailable." });

    const pickupLat = toFiniteNumber(req.body.pickup_lat);
    const pickupLng = toFiniteNumber(req.body.pickup_lng);
    const dropoffLat = toFiniteNumber(req.body.dropoff_lat);
    const dropoffLng = toFiniteNumber(req.body.dropoff_lng);
    if ([pickupLat, pickupLng, dropoffLat, dropoffLng].some((n) => n == null)) {
      return res.status(400).json({ success: false, message: "Pickup and dropoff coordinates must be valid numbers." });
    }

    const distanceKm =
      toFiniteNumber(req.body.distance_km) ||
      haversineKm(pickupLat, pickupLng, dropoffLat, dropoffLng);
    const rideType = normalizeRideType(req.body.ride_type);
    const bookingMode = normalizeBookingMode(req.body.booking_mode);
    const vehicleCapacity = Math.min(8, Math.max(2, Number(req.body.vehicle_capacity) || 5));
    let partySize = Math.min(vehicleCapacity, Math.max(1, Number(req.body.party_size) || 1));
    if (bookingMode === "full_car") partySize = vehicleCapacity;

    const pricing = await calculateFare({
      distanceKm,
      rideType,
      promoCode: req.body.promo_code,
      pendingPenalty: rider.pendingPenalty || 0,
      cashbackBalance: rider.cashbackBalance || 0,
      bookingMode,
      vehicleCapacity,
      partySize,
    });
    if (![pricing.estimatedFare, pricing.fare, pricing.commissionAmount, pricing.driverEarning, pricing.tripTotalAfterPromo].every(Number.isFinite)) {
      return res.status(400).json({ success: false, message: "Ride fare could not be calculated. Please review trip inputs." });
    }
    const selectedDriverId = String(req.body.selected_driver_id || "").trim();
    let assigned = null;
    let selectedDriverApplied = false;
    if (mongoose.Types.ObjectId.isValid(selectedDriverId)) {
      const selected = await User.findOne({
        _id: selectedDriverId,
        role: "driver",
        isActive: true,
        isOnline: true,
        approved: true,
      }).select("_id location");
      if (selected && selected.location && typeof selected.location.lat === "number" && typeof selected.location.lng === "number") {
        assigned = selected;
        selectedDriverApplied = true;
      }
    }
    if (!assigned) {
      assigned = await findNearestDriver({ pickupLat, pickupLng });
    }
    const eligibleDriversNearPickup = await countEligibleDriversAtPickup({ pickupLat, pickupLng });
    const pickupAddress = String(req.body.pickup_address || "").trim();
    const dropoffAddress = String(req.body.dropoff_address || "").trim();
    if (!pickupAddress || !dropoffAddress) {
      return res.status(400).json({ success: false, message: "Pickup and dropoff addresses are required." });
    }

    const ride = await Ride.create({
      riderId,
      userId: riderId,
      driverId: assigned?._id,
      rideType,
      bookingMode: pricing.bookingMode,
      vehicleCapacity: pricing.vehicleCapacity,
      partySize: pricing.partySize,
      tripTotalAfterPromo: pricing.tripTotalAfterPromo,
      pickupAddress,
      dropoffAddress,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      distanceKm,
      estimatedFare: pricing.estimatedFare,
      fare: pricing.fare,
      commissionAmount: pricing.commissionAmount,
      driverEarning: pricing.driverEarning,
      penaltyApplied: Number(rider.pendingPenalty || 0),
      promoCode: String(req.body.promo_code || "").toUpperCase(),
    });
    rider.pendingPenalty = 0;
    await rider.save();
    if (assigned?._id) {
      await Notification.create({ userId: assigned._id, title: "New ride request", message: `New ${ride.rideType} ride request nearby.` });
    }
    emitSystemRefresh(req, { type: "ride:requested", rideId: String(ride._id) });
    res.status(201).json({
      success: true,
      message: "Ride requested",
      data: ride,
      matching: {
        eligibleDriversNearPickup,
        preAssignedToNearestDriver: Boolean(assigned?._id) && !selectedDriverApplied,
        selectedDriverId: selectedDriverId || null,
        selectedDriverApplied,
      },
    });
  } catch (error) {
    console.error("requestRide", error);
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ride request data format." });
    }
    if (error.name === "ValidationError") {
      const msg = Object.values(error.errors || {})
        .map((e) => e.message)
        .join(" ");
      return res.status(400).json({ success: false, message: msg || "Invalid ride data." });
    }
    res.status(500).json({ success: false, message: error.message || "Could not book ride. Try again." });
  }
};

exports.getRide = async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  res.json({ success: true, data: ride });
};

exports.acceptRide = async (req, res) => {
  const driver = await User.findById(req.user.id);
  if (!driver || !driver.isActive) return res.status(403).json({ success: false, message: "Driver account is inactive." });
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  if (String(ride.status || "").toLowerCase() !== "requested") {
    return res.status(400).json({ success: false, message: "This ride is no longer available to accept." });
  }
  if ((ride.rejectedDriverIds || []).some((id) => String(id) === String(req.user.id))) {
    return res.status(400).json({ success: false, message: "You already rejected this ride." });
  }
  ride.driverId = req.user.id;
  ride.status = "accepted";
  await ride.save();
  emitRide(req, req.params.id, "ride:status", { status: "accepted" });
  await Notification.create({ userId: ride.riderId, title: "Ride accepted", message: "Driver accepted your request." });
  emitSystemRefresh(req, { type: "ride:accepted", rideId: String(ride._id) });
  res.json({ success: true, message: "Ride accepted", data: ride });
};

exports.riderAcceptRide = async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  if (String(ride.riderId) !== String(req.user.id)) {
    return res.status(403).json({ success: false, message: "This trip does not belong to your account." });
  }
  const status = String(ride.status || "").toLowerCase();
  if (!["requested", "accepted", "arrived", "started", "ongoing"].includes(status)) {
    return res.status(400).json({ success: false, message: "Only live rides can be accepted." });
  }
  ride.riderAccepted = true;
  ride.riderAcceptedAt = new Date();
  await ride.save();
  if (ride.driverId) {
    await Notification.create({
      userId: ride.driverId,
      title: "Rider confirmed",
      message: "Rider confirmed this incoming trip from dashboard.",
    });
  }
  emitSystemRefresh(req, { type: "ride:riderAccepted", rideId: String(ride._id) });
  res.json({ success: true, message: "Ride accepted by rider", data: ride });
};

exports.rejectRide = async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  if (String(ride.status || "").toLowerCase() !== "requested") {
    return res.status(400).json({ success: false, message: "Only requested rides can be rejected." });
  }
  const driver = await User.findById(req.user.id);
  if (driver) {
    driver.pendingPenalty = Number(driver.pendingPenalty || 0) + 30;
    await driver.save();
  }
  const rejected = new Set((ride.rejectedDriverIds || []).map((id) => String(id)));
  rejected.add(String(req.user.id));
  ride.rejectedDriverIds = [...rejected];
  if (String(ride.driverId || "") === String(req.user.id)) {
    ride.driverId = null;
  }
  await ride.save();
  await Notification.create({ userId: ride.riderId, title: "Ride rejected", message: "Driver rejected your request. Reassigning nearby driver." });
  emitSystemRefresh(req, { type: "ride:rejected", rideId: String(ride._id) });
  res.json({ success: true, message: "Ride rejected. 30 BDT penalty applied." });
};

exports.driverArrived = async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(req.params.id, { status: "arrived" }, { returnDocument: "after" });
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  emitRide(req, req.params.id, "ride:status", { status: "arrived" });
  await Notification.create({ userId: ride.riderId, title: "Driver arrived", message: "Your driver has arrived at pickup." });
  emitSystemRefresh(req, { type: "ride:arrived", rideId: String(ride._id) });
  res.json({ success: true, message: "Driver marked as arrived", data: ride });
};

exports.startRide = async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(
    req.params.id,
    { status: "ongoing", tripStartedAt: new Date() },
    { returnDocument: "after" }
  );
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  emitRide(req, req.params.id, "ride:status", { status: "ongoing" });
  await Notification.create({ userId: ride.riderId, title: "Ride started", message: "Your trip is now in progress." });
  emitSystemRefresh(req, { type: "ride:ongoing", rideId: String(ride._id) });
  res.json({ success: true, message: "Ride started", data: ride });
};

exports.completeRide = async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(
    req.params.id,
    { status: "completed", tripCompletedAt: new Date() },
    { returnDocument: "after" }
  );
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  const rider = await User.findById(ride.riderId);
  const driver = await User.findById(ride.driverId);
  if (driver) {
    const bonusRate = driver.joinedAt && new Date(driver.joinedAt).getTime() <= Date.now() - 365 * 24 * 60 * 60 * 1000 ? 0.05 : 0;
    const bonus = Number(ride.driverEarning || 0) * bonusRate;
    driver.totalEarnings = Number(driver.totalEarnings || 0) + Number(ride.driverEarning || 0) + bonus;
    driver.loyaltyBonusEligible = bonusRate > 0;
    await driver.save();
  }
  if (rider && driver) {
    const previousRide = await Ride.findOne({ riderId: rider._id, driverId: driver._id, _id: { $ne: ride._id }, status: "completed" });
    if (previousRide) {
      const cashback = Number((ride.fare || 0) * 0.05);
      rider.cashbackBalance = Number(rider.cashbackBalance || 0) + cashback;
      ride.cashbackEarned = cashback;
      await rider.save();
      await ride.save();
    }
  }
  emitRide(req, req.params.id, "ride:status", { status: "completed" });
  await Notification.create({
    userId: ride.riderId,
    title: "Ride completed",
    message: "Trip finished. Pay with Cash, bKash, Nagad, or Card from Trip History, then rate your driver.",
  });
  if (ride.driverId) {
    await Notification.create({ userId: ride.driverId, title: "Ride completed", message: "Trip completed successfully. Earnings updated." });
  }
  emitSystemRefresh(req, { type: "ride:completed", rideId: String(ride._id) });
  res.json({ success: true, message: "Ride completed", data: ride });
};

exports.cancelRide = async (req, res) => {
  const cancelledBy = req.user.role === "driver" ? "driver" : "user";
  const ride = await Ride.findByIdAndUpdate(
    req.params.id,
    { status: "cancelled", cancelReason: req.body.reason || "", cancelledBy },
    { returnDocument: "after" }
  );
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  if (cancelledBy === "user") {
    await User.findByIdAndUpdate(ride.riderId, { $inc: { pendingPenalty: 30 } });
  } else {
    await Notification.create({ userId: ride.riderId, title: "Ride cancelled", message: "Driver cancelled this trip." });
  }
  emitRide(req, req.params.id, "ride:status", { status: "cancelled" });
  emitSystemRefresh(req, { type: "ride:cancelled", rideId: String(ride._id) });
  res.json({ success: true, message: "Ride cancelled", data: ride });
};

async function refreshDriverAverageRating(driverId) {
  if (!driverId || !mongoose.Types.ObjectId.isValid(String(driverId))) return;
  const agg = await Ride.aggregate([
    {
      $match: {
        driverId: new mongoose.Types.ObjectId(String(driverId)),
        status: "completed",
        riderRating: { $gte: 1, $lte: 5 },
      },
    },
    { $group: { _id: null, avg: { $avg: "$riderRating" } } },
  ]);
  const avg = agg[0]?.avg;
  if (avg != null) {
    await User.findByIdAndUpdate(driverId, { rating: Math.round(Number(avg) * 100) / 100 });
  }
}

exports.rateDriver = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
    if (String(ride.riderId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Only the rider can review this trip." });
    }
    if (String(ride.status || "").toLowerCase() !== "completed") {
      return res.status(400).json({ success: false, message: "You can review after the trip is completed." });
    }
    const alreadyRated = Number.isFinite(Number(ride.riderRating)) && Number(ride.riderRating) >= 1 && Number(ride.riderRating) <= 5;
    const alreadyCommented = typeof ride.riderFeedback === "string" && ride.riderFeedback.trim().length > 0;
    if (alreadyRated || alreadyCommented) {
      return res.status(409).json({ success: false, message: "Feedback can be submitted only once per trip." });
    }
    const textFeedback = String(req.body.comment ?? req.body.feedback ?? "").trim();
    let rating = Number(req.body.rating);
    if ((!Number.isFinite(rating) || rating < 1 || rating > 5) && textFeedback.length > 0) {
      const fallback = Number(ride.riderRating || 5);
      rating = Number.isFinite(fallback) && fallback >= 1 && fallback <= 5 ? fallback : 5;
    }
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });
    }
    const update = { riderRating: rating };
    if (req.body.comment != null || req.body.feedback != null) {
      update.riderFeedback = textFeedback.slice(0, 2000);
    }
    await Ride.findByIdAndUpdate(req.params.id, update);
    if (ride.driverId) await refreshDriverAverageRating(ride.driverId);
    emitSystemRefresh(req, { type: "ride:riderRating", rideId: String(req.params.id) });
    res.json({ success: true, message: "Feedback saved" });
  } catch (e) {
    console.error("rateDriver", e);
    res.status(500).json({ success: false, message: e.message || "Could not save review." });
  }
};

exports.rateRider = async (req, res) => {
  await Ride.findByIdAndUpdate(req.params.id, { driverRating: Number(req.body.rating || 0) });
  emitSystemRefresh(req, { type: "ride:driverRating", rideId: String(req.params.id) });
  res.json({ success: true, message: "Rider rated successfully" });
};

const PAY_METHODS = new Set(["cash", "bkash", "nagad", "card"]);

exports.processPayment = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
    if (String(ride.riderId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Only the rider can pay for this trip." });
    }
    if (String(ride.status || "").toLowerCase() !== "completed") {
      return res.status(400).json({ success: false, message: "Pay after your trip is completed." });
    }
    const existingPaid = await Payment.findOne({ rideId: ride._id, status: "paid" });
    if (existingPaid) {
      return res.json({ success: true, message: "Payment already recorded", data: existingPaid });
    }
    const raw = String(req.body.method || "cash")
      .trim()
      .toLowerCase();
    const method = PAY_METHODS.has(raw) ? raw : "cash";
    const payment = await Payment.create({
      rideId: ride._id,
      riderId: ride.riderId,
      amount: Number(req.body.amount || ride.fare || 0),
      method,
      status: "paid",
    });
    emitSystemRefresh(req, { type: "payment:paid", rideId: String(ride._id) });
    res.json({ success: true, message: "Payment recorded successfully", data: payment });
  } catch (e) {
    console.error("processPayment", e);
    res.status(500).json({ success: false, message: e.message || "Payment failed." });
  }
};

exports.trackRide = async (req, res) => {
  const ride = await Ride.findById(req.params.id).populate("driverId", "name phone location profilePhoto rating");
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  res.json({ success: true, data: ride });
};

exports.getRideChat = async (req, res) => {
  const ride = await Ride.findById(req.params.id).select("chatMessages");
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  res.json({ success: true, data: ride.chatMessages || [] });
};

exports.sendRideChat = async (req, res) => {
  const msg = String(req.body.message || "").trim();
  if (!msg) return res.status(400).json({ success: false, message: "Message is required." });
  const ride = await Ride.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        chatMessages: {
          senderRole: req.user.role === "driver" ? "driver" : "user",
          senderId: req.user.id,
          message: msg,
        },
      },
    },
    { returnDocument: "after" }
  ).select("chatMessages");
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  res.json({ success: true, data: ride.chatMessages || [] });
};
