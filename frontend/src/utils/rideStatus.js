/** Rider-facing copy for API ride status enums (see backend Ride schema). */
export function riderFacingRideUI(status) {
  const s = String(status || '')
    .trim()
    .toLowerCase()
  const fallback = {
    badge: s ? s.replace(/_/g, ' ') : 'Updating…',
    headline: 'Ride status',
    subtitle: '',
  }
  const map = {
    requested: {
      badge: 'Finding a driver',
      headline: 'Trip request live',
      subtitle:
        'Your booking is active. We notify the nearest online driver; you’ll see an update when someone accepts.',
    },
    accepted: {
      badge: 'Driver assigned',
      headline: 'Driver matched',
      subtitle: 'A driver accepted your ride. Meet them at the pickup location.',
    },
    arrived: {
      badge: 'Driver arrived',
      headline: 'At pickup',
      subtitle: 'Your driver has arrived. Confirm before you start the trip.',
    },
    started: {
      badge: 'Trip started',
      headline: 'On the way',
      subtitle: 'Heading toward your destination.',
    },
    ongoing: {
      badge: 'On trip',
      headline: 'En route',
      subtitle: 'Ride in progress to your drop-off.',
    },
    completed: {
      badge: 'Completed',
      headline: 'Trip finished',
      subtitle: '',
    },
    cancelled: {
      badge: 'Cancelled',
      headline: 'Ride cancelled',
      subtitle: '',
    },
  }
  return map[s] || fallback
}

/** Static explainer: no named driver list until accept — backend assigns nearest eligible driver. */
export const DRIVER_MATCHING_EXPLAINER =
  'Eligible drivers are online, approved, and sharing GPS. We don’t show a list—Transitely offers your trip to the nearest match first. Names appear after a driver accepts.'

export function paymentMethodLabel(method) {
  const m = String(method || 'cash').toLowerCase()
  const map = { cash: 'Cash', bkash: 'bKash', nagad: 'Nagad', card: 'Card' }
  return map[m] || String(method || 'Cash')
}

/** Completed trip with no paid Payment record yet (see GET /api/riders/rides paymentPaid). */
export function rideNeedsPayment(ride) {
  if (!ride || String(ride.status || '').toLowerCase() !== 'completed') return false
  return ride.paymentPaid !== true
}

/** Minutes between trip start and completion, or null if unknown. */
export function rideTripMinutes(ride) {
  if (!ride?.tripStartedAt || !ride?.tripCompletedAt) return null
  const a = new Date(ride.tripStartedAt).getTime()
  const b = new Date(ride.tripCompletedAt).getTime()
  if (!Number.isFinite(a) || !Number.isFinite(b) || b <= a) return null
  return Math.round((b - a) / 60000)
}

/** Subtotal hint (estimated base), promo/cashback savings vs final fare, and total paid. */
export function rideFareBreakdown(ride) {
  const total = Number(ride?.fare ?? 0)
  const base = Number(ride?.estimatedFare ?? 0)
  const discount = base > total ? Math.round((base - total) * 100) / 100 : 0
  return { baseFare: base, discount, total }
}
