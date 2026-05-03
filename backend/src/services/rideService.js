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
  const base = Number(distanceKm || 0) * Number(config.perKmFare || 40) * rideTypeMultiplier(rideType);
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
  const finalFare = Math.max(0, riderSubtotal - cashbackUse + Number(pendingPenalty || 0));
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

module.exports = { getConfig, haversineKm, calculateFare, findNearestDriver };
