const Complaint = require("../models/Complaint");
const AdminConfig = require("../models/AdminConfig");
const Payment = require("../models/Payment");
const Ride = require("../models/Ride");
const User = require("../models/User");

exports.getDashboard = async (req, res) => {
  const [riders, drivers, rides, complaints] = await Promise.all([
    User.countDocuments({ role: { $in: ["user", "rider"] } }),
    User.countDocuments({ role: "driver" }),
    Ride.countDocuments({}),
    Complaint.countDocuments({}),
  ]);
  res.json({ success: true, data: { riders, drivers, rides, complaints } });
};

exports.getRiders = async (_, res) => res.json({ success: true, data: await User.find({ role: { $in: ["user", "rider"] } }).select("-passwordHash -otp") });
exports.getDrivers = async (_, res) => res.json({ success: true, data: await User.find({ role: "driver" }).select("-passwordHash -otp") });
exports.getRiderDetail = async (req, res) => res.json({ success: true, data: await User.findOne({ _id: req.params.id, role: { $in: ["user", "rider"] } }).select("-passwordHash -otp") });
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
  if (!user) return res.status(404).json({ success: false, message: "Driver not found." });
  user.documents = (user.documents || []).map((d) => ({ ...d.toObject(), verified: true }));
  user.approved = true;
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
  const now = Date.now();
  const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const daily = payments.filter((p) => p.createdAt >= dayAgo).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const weekly = payments.filter((p) => p.createdAt >= weekAgo).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const monthly = payments.filter((p) => p.createdAt >= monthAgo).reduce((sum, p) => sum + Number(p.amount || 0), 0);
  res.json({ success: true, data: { total_revenue: total, total_payments: payments.length, daily, weekly, monthly, profit: total * 0.05, loss: 0 } });
};

exports.getConfig = async (_, res) => {
  let config = await AdminConfig.findOne();
  if (!config) config = await AdminConfig.create({ perKmFare: 40, commissionRate: 0.05, promoCodes: [] });
  res.json({ success: true, data: config });
};

exports.updateConfig = async (req, res) => {
  let config = await AdminConfig.findOne();
  if (!config) config = await AdminConfig.create({ perKmFare: 40, commissionRate: 0.05, promoCodes: [] });
  if (req.body.per_km_fare !== undefined) config.perKmFare = Number(req.body.per_km_fare);
  if (req.body.commission_rate !== undefined) config.commissionRate = Number(req.body.commission_rate);
  await config.save();
  res.json({ success: true, message: "System config updated.", data: config });
};

exports.createPromoCode = async (req, res) => {
  const code = String(req.body.code || "").trim().toUpperCase();
  if (!code) return res.status(400).json({ success: false, message: "Promo code is required." });
  let config = await AdminConfig.findOne();
  if (!config) config = await AdminConfig.create({ perKmFare: 40, commissionRate: 0.05, promoCodes: [] });
  config.promoCodes.push({
    code,
    discountPercent: Number(req.body.discount_percent || 0),
    active: true,
    expiresAt: req.body.expires_at ? new Date(req.body.expires_at) : undefined,
  });
  await config.save();
  res.status(201).json({ success: true, message: "Promo code created.", data: config.promoCodes });
};

exports.togglePromoCode = async (req, res) => {
  const code = String(req.params.code || "").trim().toUpperCase();
  const config = await AdminConfig.findOne();
  if (!config) return res.status(404).json({ success: false, message: "Config not found." });
  const promo = config.promoCodes.find((p) => p.code === code);
  if (!promo) return res.status(404).json({ success: false, message: "Promo code not found." });
  promo.active = !promo.active;
  await config.save();
  res.json({ success: true, message: "Promo code updated.", data: promo });
};
