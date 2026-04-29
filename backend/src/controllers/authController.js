const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { generateOTP, generateToken } = require("../utils/jwt");

const expiresInMinutes = Number(process.env.OTP_EXPIRES_MINUTES || 10);

const saveUserWithOtp = async ({ role, name, email, phone, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const otp = generateOTP();
  return User.create({
    role,
    name,
    email,
    phone,
    passwordHash,
    otp,
    otpExpiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
  });
};

const login = async (res, role, identifier, password) => {
  const normalized = String(identifier || "").trim();
  const query = { role, isActive: true };

  if (normalized.includes("@")) {
    query.email = normalized.toLowerCase();
  } else {
    query.phone = normalized;
  }

  const user = await User.findOne(query);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }
  return res.json({
    success: true,
    message: "Login successful",
    token: generateToken({ id: String(user._id), role: user.role }),
    user: { id: user._id, name: user.name, phone: user.phone, email: user.email, role: user.role },
  });
};

exports.riderRegister = async (req, res) => {
  try {
    const user = await saveUserWithOtp({ role: "rider", ...req.body });
    res.status(201).json({ success: true, message: "Rider registered", otp: user.otp });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.driverRegister = async (req, res) => {
  try {
    const user = await saveUserWithOtp({ role: "driver", ...req.body });
    res.status(201).json({ success: true, message: "Driver registered", otp: user.otp });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.riderLogin = async (req, res) =>
  login(res, "rider", req.body.identifier || req.body.phone || req.body.email, req.body.password);
exports.driverLogin = async (req, res) =>
  login(res, "driver", req.body.identifier || req.body.phone || req.body.email, req.body.password);

exports.adminLogin = async (req, res) => {
  const user = await User.findOne({ phone: req.body.phone, role: { $in: ["super_admin", "moderator", "support"] } });
  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: "Invalid credentials." });
  }
  return res.json({
    success: true,
    token: generateToken({ id: String(user._id), role: user.role }),
    user: { id: user._id, name: user.name, role: user.role },
  });
};

exports.riderVerifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ role: "rider", phone });
  if (!user || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  }
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();
  return res.json({ success: true, message: "OTP verified successfully." });
};

exports.driverVerifyOTP = async (req, res) => {
  const { phone, otp } = req.body;
  const user = await User.findOne({ role: "driver", phone });
  if (!user || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  }
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();
  return res.json({ success: true, message: "OTP verified successfully." });
};

exports.riderForgotPassword = async (req, res) => {
  const user = await User.findOne({ role: "rider", phone: req.body.phone });
  if (!user) return res.status(404).json({ success: false, message: "Rider not found." });
  user.otp = generateOTP();
  user.otpExpiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  await user.save();
  return res.json({ success: true, message: "OTP generated.", otp: user.otp });
};

exports.riderResetPassword = async (req, res) => {
  const { phone, otp, new_password } = req.body;
  const user = await User.findOne({ role: "rider", phone });
  if (!user || user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ success: false, message: "Invalid or expired OTP." });
  }
  user.passwordHash = await bcrypt.hash(new_password, 10);
  user.otp = undefined;
  user.otpExpiresAt = undefined;
  await user.save();
  return res.json({ success: true, message: "Password reset successful." });
};
