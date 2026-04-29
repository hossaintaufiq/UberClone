const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const Ride = require("../models/Ride");

const emitRide = (req, rideId, event, payload) => {
  const io = req.app.get("io");
  io.to(`ride:${rideId}`).emit(event, payload);
};

exports.requestRide = async (req, res) => {
  const ride = await Ride.create({
    riderId: req.user.id,
    pickupAddress: req.body.pickup_address,
    dropoffAddress: req.body.dropoff_address,
    pickupLat: req.body.pickup_lat,
    pickupLng: req.body.pickup_lng,
    dropoffLat: req.body.dropoff_lat,
    dropoffLng: req.body.dropoff_lng,
    fare: req.body.fare || 0,
  });
  res.status(201).json({ success: true, message: "Ride requested", data: ride });
};

exports.getRide = async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  res.json({ success: true, data: ride });
};

exports.acceptRide = async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(req.params.id, { driverId: req.user.id, status: "accepted" }, { new: true });
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  emitRide(req, req.params.id, "ride:status", { status: "accepted" });
  await Notification.create({ userId: ride.riderId, title: "Ride accepted", message: "Driver accepted your request." });
  res.json({ success: true, message: "Ride accepted", data: ride });
};

exports.driverArrived = async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(req.params.id, { status: "arrived" }, { new: true });
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  emitRide(req, req.params.id, "ride:status", { status: "arrived" });
  res.json({ success: true, message: "Driver marked as arrived", data: ride });
};

exports.startRide = async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(req.params.id, { status: "started" }, { new: true });
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  emitRide(req, req.params.id, "ride:status", { status: "started" });
  res.json({ success: true, message: "Ride started", data: ride });
};

exports.completeRide = async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(req.params.id, { status: "completed" }, { new: true });
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  emitRide(req, req.params.id, "ride:status", { status: "completed" });
  res.json({ success: true, message: "Ride completed", data: ride });
};

exports.cancelRide = async (req, res) => {
  const ride = await Ride.findByIdAndUpdate(req.params.id, { status: "cancelled", cancelReason: req.body.reason || "" }, { new: true });
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  emitRide(req, req.params.id, "ride:status", { status: "cancelled" });
  res.json({ success: true, message: "Ride cancelled", data: ride });
};

exports.rateDriver = async (req, res) => {
  await Ride.findByIdAndUpdate(req.params.id, { riderRating: Number(req.body.rating || 0) });
  res.json({ success: true, message: "Driver rated successfully" });
};

exports.rateRider = async (req, res) => {
  await Ride.findByIdAndUpdate(req.params.id, { driverRating: Number(req.body.rating || 0) });
  res.json({ success: true, message: "Rider rated successfully" });
};

exports.processPayment = async (req, res) => {
  const ride = await Ride.findById(req.params.id);
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  const payment = await Payment.create({
    rideId: ride._id,
    riderId: ride.riderId,
    amount: Number(req.body.amount || ride.fare || 0),
    method: req.body.method || "card",
    status: "paid",
  });
  res.json({ success: true, message: "Payment successful", data: payment });
};

exports.trackRide = async (req, res) => {
  const ride = await Ride.findById(req.params.id).populate("driverId", "name phone location");
  if (!ride) return res.status(404).json({ success: false, message: "Ride not found." });
  res.json({ success: true, data: ride });
};
