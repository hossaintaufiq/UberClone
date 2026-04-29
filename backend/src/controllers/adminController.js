const Complaint = require("../models/Complaint");
const Payment = require("../models/Payment");
const Ride = require("../models/Ride");
const User = require("../models/User");

exports.getDashboard = async (req, res) => {
  const [riders, drivers, rides, complaints] = await Promise.all([
    User.countDocuments({ role: "rider" }),
    User.countDocuments({ role: "driver" }),
    Ride.countDocuments({}),
    Complaint.countDocuments({}),
  ]);
  res.json({ success: true, data: { riders, drivers, rides, complaints } });
};

exports.getRiders = async (_, res) => res.json({ success: true, data: await User.find({ role: "rider" }).select("-passwordHash -otp") });
exports.getDrivers = async (_, res) => res.json({ success: true, data: await User.find({ role: "driver" }).select("-passwordHash -otp") });
exports.getRiderDetail = async (req, res) => res.json({ success: true, data: await User.findOne({ _id: req.params.id, role: "rider" }).select("-passwordHash -otp") });
exports.getDriverDetail = async (req, res) => res.json({ success: true, data: await User.findOne({ _id: req.params.id, role: "driver" }).select("-passwordHash -otp") });

exports.updateRiderStatus = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(req.body.is_active) });
  res.json({ success: true, message: "Rider status updated" });
};

exports.updateDriverStatus = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(req.body.is_active) });
  res.json({ success: true, message: "Driver status updated" });
};

exports.updateDriverRideAccess = async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { isActive: Boolean(req.body.can_take_rides) });
  res.json({ success: true, message: "Driver ride access updated" });
};

exports.verifyDriverDocs = async (req, res) => {
  const user = await User.findById(req.params.id);
  user.documents = (user.documents || []).map((d) => ({ ...d.toObject(), verified: true }));
  await user.save();
  res.json({ success: true, message: "Driver documents verified" });
};

exports.getRides = async (_, res) => res.json({ success: true, data: await Ride.find({}).sort({ createdAt: -1 }) });
exports.getComplaints = async (_, res) => res.json({ success: true, data: await Complaint.find({}).sort({ createdAt: -1 }) });

exports.updateComplaint = async (req, res) => {
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status || "in_review", adminNote: req.body.admin_note || "" },
    { new: true }
  );
  res.json({ success: true, message: "Complaint updated", data: complaint });
};

exports.getRevenue = async (_, res) => {
  const payments = await Payment.find({ status: "paid" });
  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  res.json({ success: true, data: { total_revenue: total, total_payments: payments.length } });
};
