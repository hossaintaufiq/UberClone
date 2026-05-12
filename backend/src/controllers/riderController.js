const Ride = require("../models/Ride");
const Payment = require("../models/Payment");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { listEligibleDriversAtPickup, haversineKm } = require("../services/rideService");

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
  const rides = await Ride.find({ riderId: req.user.id }).sort({ createdAt: -1 }).lean();
  const ids = rides.map((r) => r._id);
  const paidRows = await Payment.find({
    riderId: req.user.id,
    rideId: { $in: ids },
    status: "paid",
  })
    .select("rideId method amount")
    .lean();
  const payByRide = new Map(paidRows.map((p) => [String(p.rideId), p]));
  rides.forEach((r) => {
    const p = payByRide.get(String(r._id));
    r.paymentPaid = Boolean(p);
    r.paymentMethod = p?.method || null;
    r.paymentAmount = p?.amount != null ? Number(p.amount) : null;
  });
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

exports.getDriverChoices = async (req, res) => {
  try {
    const pickupLat = Number(req.query.pickup_lat);
    const pickupLng = Number(req.query.pickup_lng);

    let activeDrivers = [];
    if (Number.isFinite(pickupLat) && Number.isFinite(pickupLng)) {
      activeDrivers = await listEligibleDriversAtPickup({ pickupLat, pickupLng, limit: 40 });
    } else {
      const rows = await User.find({ role: "driver", isActive: true, isOnline: true, approved: true })
        .select("_id name phone rating profilePhoto location")
        .sort({ rating: -1, updatedAt: -1 })
        .limit(40)
        .lean();
      activeDrivers = rows.map((d) => ({
        _id: d._id,
        name: d.name || "Driver",
        phone: d.phone || "",
        rating: Number(d.rating || 0),
        profilePhoto: d.profilePhoto || "",
        distanceKm: null,
        location: d.location || null,
      }));
    }

    const completed = await Ride.find({ riderId: req.user.id, status: "completed", driverId: { $ne: null } })
      .select("driverId createdAt pickupLat pickupLng")
      .sort({ createdAt: -1 })
      .limit(300)
      .lean();
    const byDriver = new Map();
    completed.forEach((ride) => {
      const id = String(ride.driverId || "");
      if (!id || byDriver.has(id)) return;
      byDriver.set(id, {
        latestTripAt: ride.createdAt,
        latestPickupLat: Number(ride.pickupLat),
        latestPickupLng: Number(ride.pickupLng),
      });
    });
    const pastIds = [...byDriver.keys()];
    const pastUsers = pastIds.length
      ? await User.find({ _id: { $in: pastIds }, isOnline: true, isActive: true, approved: true })
          .select("_id name phone rating profilePhoto isOnline isActive approved location")
          .lean()
      : [];
    const pastDrivers = pastUsers
      .map((u) => {
        const ref = byDriver.get(String(u._id));
        let distanceKm = null;
        if (Number.isFinite(pickupLat) && Number.isFinite(pickupLng) && u?.location && typeof u.location.lat === "number" && typeof u.location.lng === "number") {
          distanceKm = Number(haversineKm(pickupLat, pickupLng, u.location.lat, u.location.lng).toFixed(2));
        }
        return {
          _id: u._id,
          name: u.name || "Driver",
          phone: u.phone || "",
          rating: Number(u.rating || 0),
          profilePhoto: u.profilePhoto || "",
          activeNow: true,
          distanceKm,
          latestTripAt: ref?.latestTripAt || null,
        };
      })
      .sort((a, b) => new Date(b.latestTripAt || 0).getTime() - new Date(a.latestTripAt || 0).getTime());

    res.json({ success: true, data: { activeDrivers, pastDrivers } });
  } catch (e) {
    console.error("getDriverChoices", e);
    res.status(500).json({ success: false, message: e.message || "Could not load driver list." });
  }
};
