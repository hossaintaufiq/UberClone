const Ride = require("../models/Ride");
const Payment = require("../models/Payment");
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
  const user = await User.findByIdAndUpdate(req.user.id, payload, { returnDocument: "after" }).select("-passwordHash -otp");
  res.json({ success: true, message: "Profile updated", data: user });
};

exports.updateFcmToken = async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { fcmToken: req.body.fcm_token || "" });
  res.json({ success: true, message: "FCM token updated" });
};

exports.getRides = async (req, res) => {
  const rides = await Ride.find({ riderId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: rides });
};

exports.getPayments = async (req, res) => {
  const payments = await Payment.find({ riderId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: payments });
};

exports.getNotifications = async (req, res) => {
  const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: notifications });
};
