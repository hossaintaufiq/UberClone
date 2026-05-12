const AdminConfig = require("../models/AdminConfig");
const User = require("../models/User");

async function getConfig() {
  let config = await AdminConfig.findOne();
  if (!config) {
    config = await AdminConfig.create({ perKmFare: 40, commissionRate: 0.05, promoCodes: [] });
  }
  return config;
}

function haversineKm(aLat, aLng, bLat, bLng) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad((bLat || 0) - (aLat || 0));
  const dLng = toRad((bLng || 0) - (aLng || 0));
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat || 0)) * Math.cos(toRad(bLat || 0)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
}

function rideTypeMultiplier(rideType) {
  const map = {
    single: 1,
    share: 0.8,
    family: 1.2,
    "intercity-reserve": 1.4,
    "intercity-day-trip": 1.5,
    "intercity-inside-city": 1.25,
  };
  return map[rideType] || 1;
}

async function calculateFare({
  distanceKm,
  rideType,
  promoCode,
  pendingPenalty = 0,
  cashbackBalance = 0,
  bookingMode = "full_car",
  vehicleCapacity = 5,
  partySize = 1,
}) {
  const config = await getConfig();
  const normalizedDistance = Math.max(0, Number(distanceKm) || 0);
  const perKm = Number(config.perKmFare);
  const perKmFare = Number.isFinite(perKm) && perKm > 0 ? perKm : 40;
  const minFareRaw = Number(config.minFare);
  const minFare = Number.isFinite(minFareRaw) && minFareRaw > 0 ? minFareRaw : 60;
  const baseByDistance = normalizedDistance * perKmFare * rideTypeMultiplier(rideType);
  const base = Math.max(minFare, baseByDistance);
  const promo = (config.promoCodes || []).find((p) => p.active && p.code === String(promoCode || "").toUpperCase() && (!p.expiresAt || p.expiresAt > new Date()));
  const promoDiscount = promo ? (base * Number(promo.discountPercent || 0)) / 100 : 0;
  const tripTotalAfterPromo = Math.max(0, base - promoDiscount);

  const cap = Math.min(8, Math.max(2, Number(vehicleCapacity) || 5));
  let party = Math.min(cap, Math.max(1, Number(partySize) || 1));
  let riderPortionFactor = 1;
  if (bookingMode === "seat_share") {
    riderPortionFactor = party / cap;
  } else {
    party = cap;
    riderPortionFactor = 1;
  }

  const riderSubtotal = tripTotalAfterPromo * riderPortionFactor;
  const cashbackUse = Math.min(riderSubtotal, Number(cashbackBalance || 0));
  const withCashback = riderSubtotal - cashbackUse + Number(pendingPenalty || 0);
  const minimumPayable = Number.isFinite(riderSubtotal) && riderSubtotal > 0 ? 10 : 0;
  const finalFare = Math.max(minimumPayable, withCashback);
  const commissionAmount = finalFare * Number(config.commissionRate || 0.05);
  const driverEarning = finalFare - commissionAmount;

  return {
    estimatedFare: Number(base.toFixed(2)),
    fare: Number(finalFare.toFixed(2)),
    commissionAmount: Number(commissionAmount.toFixed(2)),
    driverEarning: Number(driverEarning.toFixed(2)),
    tripTotalAfterPromo: Number(tripTotalAfterPromo.toFixed(2)),
    riderPortionFactor,
    vehicleCapacity: cap,
    partySize: party,
    bookingMode,
  };
}

async function findNearestDriver({ pickupLat, pickupLng }) {
  const drivers = await User.find({ role: { $in: ["driver"] }, isActive: true, isOnline: true, approved: true }).select("_id location");
  let winner = null;
  let min = Number.MAX_SAFE_INTEGER;
  drivers.forEach((driver) => {
    if (!driver.location || typeof driver.location.lat !== "number" || typeof driver.location.lng !== "number") return;
    const km = haversineKm(pickupLat, pickupLng, driver.location.lat, driver.location.lng);
    if (km < min) {
      min = km;
      winner = driver;
    }
  });
  return winner;
}

/** Same pool as findNearestDriver — drivers who can receive the request (valid last-known location). */
async function countEligibleDriversAtPickup({ pickupLat, pickupLng }) {
  const drivers = await User.find({ role: { $in: ["driver"] }, isActive: true, isOnline: true, approved: true }).select("_id location");
  let n = 0;
  drivers.forEach((driver) => {
    if (!driver.location || typeof driver.location.lat !== "number" || typeof driver.location.lng !== "number") return;
    n += 1;
  });
  return n;
}

async function listEligibleDriversAtPickup({ pickupLat, pickupLng, limit = 30 }) {
  const drivers = await User.find({ role: "driver", isActive: true, isOnline: true, approved: true })
    .select("_id name phone rating profilePhoto location")
    .lean();
  const rows = [];
  drivers.forEach((driver) => {
    const hasGps = Boolean(driver.location && typeof driver.location.lat === "number" && typeof driver.location.lng === "number");
    const distanceKm = hasGps ? haversineKm(pickupLat, pickupLng, driver.location.lat, driver.location.lng) : null;
    rows.push({
      _id: driver._id,
      name: driver.name || "Driver",
      phone: driver.phone || "",
      rating: Number(driver.rating || 0),
      profilePhoto: driver.profilePhoto || "",
      distanceKm: distanceKm == null ? null : Number(distanceKm.toFixed(2)),
      hasGps,
      location: hasGps ? driver.location : null,
    });
  });
  rows.sort((a, b) => {
    if (a.distanceKm == null && b.distanceKm == null) return Number(b.rating || 0) - Number(a.rating || 0);
    if (a.distanceKm == null) return 1;
    if (b.distanceKm == null) return -1;
    return a.distanceKm - b.distanceKm;
  });
  return rows.slice(0, Math.max(1, Number(limit) || 30));
}

module.exports = { getConfig, haversineKm, calculateFare, findNearestDriver, countEligibleDriversAtPickup, listEligibleDriversAtPickup };
