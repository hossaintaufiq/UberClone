import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverLayout from '../../components/DriverLayout'
import { DRIVER_TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'

function formatWhen(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return '—'
  }
}

export default function DriverFeedbackPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem(DRIVER_TOKEN_KEY)) {
      navigate('/driver/login')
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const res = await apiRequest('/api/drivers/rider-feedback', { tokenKey: DRIVER_TOKEN_KEY })
        if (!cancelled) setItems(res.data || [])
      } catch {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  return (
    <DriverLayout title="Rider feedback">
      <p className="mb-6 max-w-xl text-[15px] leading-relaxed text-[#607282]">
        Star ratings and written comments from riders on completed trips. New entries appear here as soon as a rider submits them.
      </p>

      {loading ? (
        <div className="rounded-[2rem] bg-white/80 py-16 text-center text-[15px] font-bold text-[#8a9aab] ring-1 ring-[#d9e3ec]">Loading…</div>
      ) : items.length === 0 ? (
        <div className="rounded-[2rem] border-2 border-dashed border-[#d9e3ec] bg-white/50 py-20 text-center text-[15px] font-bold text-[#8a9aab]">
          No rider feedback yet. Completed trips with ratings or comments will show up here.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((ride) => {
            const rider = ride.riderId && typeof ride.riderId === 'object' ? ride.riderId : null
            const name = rider?.name || 'Rider'
            const stars = Number(ride.riderRating) || 0
            const text = String(ride.riderFeedback || '').trim()
            return (
              <article
                key={ride._id}
                className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#d9e3ec] sm:p-8"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[18px] font-black text-[#1c2731]">{name}</p>
                    <p className="mt-1 text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">
                      {formatWhen(ride.tripCompletedAt || ride.updatedAt)}
                    </p>
                    {stars >= 1 && stars <= 5 ? (
                      <p className="mt-3 text-[14px] font-bold text-amber-600">Rating: {stars}/5</p>
                    ) : null}
                  </div>
                  <div className="text-right text-[12px] font-bold text-[#64748b] sm:max-w-[45%]">
                    <p className="line-clamp-2">{ride.pickupAddress}</p>
                    <p className="mt-1 line-clamp-2">→ {ride.dropoffAddress}</p>
                  </div>
                </div>
                {text ? (
                  <div className="mt-5 rounded-2xl bg-[#f8fafc] p-4 ring-1 ring-[#e2e8f0]">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#94a3b8]">Comment</p>
                    <p className="mt-2 text-[15px] font-medium leading-relaxed text-[#1c2731]">{text}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-[13px] font-medium text-[#94a3b8]">No written comment for this trip.</p>
                )}
              </article>
            )
          })}
        </div>
      )}
    </DriverLayout>
  )
}
