const jwt = require("jsonwebtoken");

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

module.exports = { generateToken, generateOTP };
