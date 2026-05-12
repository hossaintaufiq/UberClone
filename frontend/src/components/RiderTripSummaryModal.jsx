import { useEffect, useMemo, useState } from 'react'
import { API_BASE } from '../constants/auth'
import { rideFareBreakdown, rideNeedsPayment, rideTripMinutes, paymentMethodLabel } from '../utils/rideStatus'
import { Layers, MapPinned, Navigation, Star, X } from 'lucide-react'

function driverPhotoSrc(driver) {
  if (!driver || typeof driver === 'string') return null
  const p = driver.profilePhoto
  if (!p || typeof p !== 'string') return null
  if (p.startsWith('http')) return p
  return `${API_BASE}${p}`
}

export default function RiderTripSummaryModal({
  ride,
  onClose,
  onPay,
  onSubmitFeedback,
  paymentBusyRideId,
  feedbackBusyRideId,
  onReorder,
}) {
  const miles = ride?.distanceKm != null ? Number(ride.distanceKm) : NaN
  const distLabel = Number.isFinite(miles) ? `${Math.max(1, Math.round(miles))} km` : '—'

  const { baseFare, discount, total } = useMemo(() => rideFareBreakdown(ride || {}), [ride])
  const tripMin = rideTripMinutes(ride)
  const durLabel = tripMin != null ? `${tripMin} ${tripMin === 1 ? 'minute' : 'minutes'}` : '—'

  const driver =
    ride?.driverId && typeof ride.driverId === 'object' && ride.driverId !== null ? ride.driverId : null
  const driverName = driver?.name || 'Your driver'
  const photo = driverPhotoSrc(driver)

  const needPay = rideNeedsPayment(ride)
  const paidMethod = ride?.paymentPaid ? paymentMethodLabel(ride?.paymentMethod) : null
  const feedbackLocked = (() => {
    const rating = Number(ride?.riderRating)
    const hasRating = Number.isFinite(rating) && rating >= 1 && rating <= 5
    const hasComment = String(ride?.riderFeedback || '').trim().length > 0
    return hasRating || hasComment
  })()

  const [stars, setStars] = useState(() => {
    const raw = Number(ride?.riderRating)
    const seeded = Number.isFinite(raw) && raw >= 1 && raw <= 5 ? raw : 5
    return Math.min(5, Math.max(1, seeded))
  })
  const [comment, setComment] = useState(() => String(ride?.riderFeedback || ''))

  useEffect(() => {
    const raw = Number(ride?.riderRating)
    const seeded = Number.isFinite(raw) && raw >= 1 && raw <= 5 ? raw : 5
    setStars(Math.min(5, Math.max(1, seeded)))
    setComment(String(ride?.riderFeedback || ''))
  }, [ride?._id, ride?.riderRating, ride?.riderFeedback])

  const id = ride?._id || ride?.id
  const busyPay = paymentBusyRideId === String(id)
  const busyFb = feedbackBusyRideId === String(id)

  if (!ride || !id) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-[#0f172a]/45 backdrop-blur-[2px]"
        aria-label="Close trip summary"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[min(92vh,860px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] bg-[#f1f5f9] shadow-2xl sm:rounded-[2rem] sm:ring-1 sm:ring-[#d9e3ec]">
        <div className="flex items-center justify-between border-b border-[#e2e8f0] bg-white px-5 py-4">
          <p className="text-[16px] font-black text-[#1c2731]">Trip summary</p>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-[#f8fafc] text-[#64748b] ring-1 ring-[#e2e8f0] transition-all hover:bg-[#f1f5f9]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-28 pt-4 sm:px-5 sm:pb-8">
          {/* Route card */}
          <div className="rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-[#e8eef4]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[#ccfbf1] ring-2 ring-white">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0d9488]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Pickup</p>
                    <p className="text-[14px] font-bold leading-snug text-[#1c2731]">{ride.pickupAddress}</p>
                  </div>
                </div>
                <div className="ml-4 h-6 border-l-2 border-dashed border-[#e2e8f0]" />
                <div className="flex gap-3">
                  <div className="mt-1 grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-[#f1f5f9] ring-2 ring-white">
                    <MapPinned size={16} className="text-[#1c2731]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Destination</p>
                    <p className="text-[14px] font-bold leading-snug text-[#1c2731]">{ride.dropoffAddress}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 text-right">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Distance</p>
                <p className="text-[15px] font-black text-[#1c2731]">{distLabel}</p>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Payment</p>
                <span className="rounded-full bg-[#dcfce7] px-3 py-1 text-[13px] font-black text-[#166534] ring-1 ring-[#bbf7d0]">
                  ৳{Number(ride.fare || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Driver */}
          <div className="mt-4 flex items-center gap-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-[#e8eef4]">
            {photo ? (
              <img src={photo} alt="" className="h-16 w-16 flex-shrink-0 rounded-full object-cover ring-2 ring-[#e2e8f0]" />
            ) : (
              <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full bg-[#0f766e]/10 text-xl font-black text-[#0f766e] ring-2 ring-[#e2e8f0]">
                {driverName[0]?.toUpperCase() || 'D'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[16px] font-black text-[#1c2731]">{driverName}</p>
              <p className="text-[13px] font-semibold text-[#64748b]">Driver</p>
              {driver?.rating != null ? (
                <p className="mt-1 inline-flex items-center gap-1 text-[12px] font-bold text-amber-600">
                  <Star size={12} fill="currentColor" /> {Number(driver.rating).toFixed(1)} avg.
                </p>
              ) : null}
            </div>
          </div>

          {/* Stats grid */}
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-[#e8eef4]">
            <div className="text-center">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Your rating</p>
              <div className="mt-2 flex justify-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    disabled={feedbackLocked}
                    className="p-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                    aria-label={`${n} stars`}
                  >
                    <Star size={20} className={n <= stars ? 'fill-amber-400 text-amber-400' : 'text-[#cbd5e1]'} />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] font-bold text-[#64748b]">{stars < 1 ? 'Tap stars' : `${stars}/5`}</p>
            </div>
            <div className="border-x border-[#f1f5f9] text-center px-1">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Pay method</p>
              <p className="mt-3 text-[12px] font-bold leading-snug text-[#1c2731]">
                {needPay ? (
                  <span className="text-[#0369a1]">Choose below</span>
                ) : (
                  paidMethod || 'Cash'
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Duration</p>
              <p className="mt-3 text-[13px] font-black text-[#1c2731]">{durLabel}</p>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 rounded-[1.5rem] bg-white px-4 py-4 shadow-sm ring-1 ring-[#e8eef4]">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Quoted base</p>
              <p className="mt-2 text-[15px] font-black text-[#1c2731]">৳{baseFare.toLocaleString()}</p>
            </div>
            <div className="text-center border-x border-[#f1f5f9] px-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">You saved</p>
              <p className="mt-2 text-[15px] font-black text-[#f59e0b]">{discount > 0 ? `৳${discount.toLocaleString()}` : '—'}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Total fare</p>
              <p className="mt-2 text-[15px] font-black text-[#0f766e]">৳{total.toLocaleString()}</p>
            </div>
          </div>

          {/* Pay */}
          {String(ride.status || '').toLowerCase() === 'completed' && needPay ? (
            <div className="mt-4 rounded-[1.5rem] bg-[#ecfdf5] p-5 ring-1 ring-[#a7f3d0]">
              <p className="text-[13px] font-black text-[#065f46]">Pay for this trip</p>
              <p className="mt-1 text-[12px] font-medium text-[#047857]">Cash, bKash, Nagad, or Card — recorded when you confirm.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { key: 'cash', label: 'Cash' },
                  { key: 'bkash', label: 'bKash' },
                  { key: 'nagad', label: 'Nagad' },
                  { key: 'card', label: 'Card' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    disabled={busyPay}
                    onClick={() => onPay(id, key)}
                    className="rounded-full bg-[#0f766e] px-4 py-2.5 text-[12px] font-black uppercase tracking-wide text-white shadow-sm ring-1 ring-[#0f766e]/30 transition-all hover:bg-[#115e59] disabled:opacity-50"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : String(ride.status || '').toLowerCase() === 'completed' && !needPay ? (
            <p className="mt-4 text-center text-[13px] font-bold text-[#16a34a]">Paid · thank you</p>
          ) : null}

          {/* Feedback */}
          <div className="mt-4 rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-[#e8eef4]">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Feedback</p>
            <p className="mt-1 text-[12px] font-medium text-[#64748b]">Help your driver with a star rating and a short note.</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              readOnly={feedbackLocked}
              rows={4}
              maxLength={2000}
              placeholder="How was the ride?"
              className="mt-3 w-full resize-none rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-3 text-[14px] font-medium text-[#1c2731] outline-none ring-[#0f766e]/0 transition-all focus:border-[#99f6e4] focus:ring-4 focus:ring-[#0f766e]/15"
            />
            {feedbackLocked ? (
              <p className="mt-2 text-[12px] font-semibold text-[#16a34a]">Feedback already submitted for this trip.</p>
            ) : null}
            <button
              type="button"
              disabled={feedbackLocked || busyFb || stars < 1}
              onClick={() => onSubmitFeedback(id, stars, comment)}
              className="mt-4 w-full rounded-2xl bg-[#0f766e] py-3.5 text-[14px] font-black text-white shadow-md transition-all hover:bg-[#115e59] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {feedbackLocked ? 'Feedback submitted' : busyFb ? 'Saving…' : 'Submit feedback'}
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-[#e2e8f0] bg-white/95 px-4 py-3 backdrop-blur-md sm:rounded-b-[2rem]">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onReorder}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#0f172a] py-3.5 text-[14px] font-black text-white shadow-lg transition-all hover:bg-[#1e293b] active:scale-[0.99]"
            >
              <Navigation size={18} />
              Re-order ride
            </button>
            <button
              type="button"
              className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-white text-[#0f172a] ring-2 ring-[#e2e8f0] transition-all hover:bg-[#f8fafc]"
              title="Open map"
              onClick={() => {
                const q = encodeURIComponent(`${ride.pickupAddress} to ${ride.dropoffAddress}`)
                window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank', 'noopener,noreferrer')
              }}
            >
              <Layers size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
