const Ride = require("../models/Ride");
const Notification = require("../models/Notification");
const User = require("../models/User");

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash -otp");
  res.json({ success: true, data: user });
};

exports.updateProfile = async (req, res) => {
  const payload = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
  };
  if (req.file) payload.profilePhoto = `/uploads/profiles/${req.file.filename}`;
  const user = await User.findByIdAndUpdate(req.user.id, payload, { new: true }).select("-passwordHash -otp");
  res.json({ success: true, message: "Profile updated", data: user });
};

exports.toggleOnline = async (req, res) => {
  const driver = await User.findById(req.user.id);
  if (!driver.approved) return res.status(403).json({ success: false, message: "Driver approval pending from admin." });
  driver.isOnline = !driver.isOnline;
  await driver.save();
  res.json({ success: true, message: "Online status updated", is_online: driver.isOnline });
};

exports.updateLocation = async (req, res) => {
  const { lat, lng } = req.body;
  await User.findByIdAndUpdate(req.user.id, {
    location: { lat, lng, updatedAt: new Date() },
  });
  res.json({ success: true, message: "Location updated" });
};

exports.getRides = async (req, res) => {
  const rides = await Ride.find({ driverId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: rides });
};

exports.getRideRequests = async (_, res) => {
  const rides = await Ride.find({ status: "requested", $or: [{ driverId: { $exists: false } }, { driverId: null }] }).sort({ createdAt: -1 }).limit(20);
  res.json({ success: true, data: rides });
};

exports.getEarnings = async (req, res) => {
  const rides = await Ride.find({ driverId: req.user.id, status: "completed" });
  const total = rides.reduce((sum, ride) => sum + Number(ride.fare || 0), 0);
  const now = Date.now();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const daily = rides.filter((r) => r.createdAt >= dayAgo).reduce((sum, r) => sum + Number(r.driverEarning || r.fare || 0), 0);
  const weekly = rides.filter((r) => r.createdAt >= weekAgo).reduce((sum, r) => sum + Number(r.driverEarning || r.fare || 0), 0);
  res.json({ success: true, data: { total_earnings: total, completed_rides: rides.length, daily_earnings: daily, weekly_earnings: weekly } });
};

exports.uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "Document is required." });
  const user = await User.findById(req.user.id);
  user.documents.push({
    name: req.file.originalname,
    url: `/uploads/documents/${req.file.filename}`,
  });
  await user.save();
  res.status(201).json({ success: true, message: "Document uploaded." });
};

exports.getDocuments = async (req, res) => {
  const user = await User.findById(req.user.id).select("documents");
  res.json({ success: true, data: user.documents || [] });
};

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: notifications });
};

exports.updateFcmToken = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { fcmToken: req.body.fcm_token || "" });
  res.json({ success: true, message: "FCM token updated" });
};
