/** Mirrors backend defaults for on-screen estimates (promo/cashback not included). */

const RIDE_TYPE_MULT = {
  single: 1,
  share: 0.8,
  family: 1.2,
  'intercity-reserve': 1.4,
  'intercity-day-trip': 1.5,
  'intercity-inside-city': 1.25,
}

function toRad(v) {
  return (v * Math.PI) / 180
}

export function haversineKm(aLat, aLng, bLat, bLng) {
  const R = 6371
  const dLat = toRad((bLat || 0) - (aLat || 0))
  const dLng = toRad((bLng || 0) - (aLng || 0))
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat || 0)) * Math.cos(toRad(bLat || 0)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c
}

export function previewRidePricing({
  pickupLat,
  pickupLng,
  dropoffLat,
  dropoffLng,
  rideType,
  perKmFare = 40,
  bookingMode,
  vehicleCapacity,
  partySize,
}) {
  const km = haversineKm(pickupLat, pickupLng, dropoffLat, dropoffLng)
  const mult = RIDE_TYPE_MULT[rideType] ?? 1
  const baseTrip = km * perKmFare * mult

  const cap = Math.min(8, Math.max(2, Number(vehicleCapacity) || 5))
  let party = Math.min(cap, Math.max(1, Number(partySize) || 1))
  let shareFactor = 1
  if (bookingMode === 'seat_share') {
    shareFactor = party / cap
  } else {
    party = cap
    shareFactor = 1
  }

  const approxYouPay = baseTrip * shareFactor

  return {
    distanceKm: km,
    approxFullTrip: baseTrip,
    approxYouPay,
    vehicleCapacity: cap,
    partySize: party,
    shareFactor,
  }
}
