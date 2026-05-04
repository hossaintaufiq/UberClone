import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverLayout from '../../components/DriverLayout'
import { DRIVER_TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'
import { onRealtimeRefresh } from '../../services/realtime'
import ConfirmToast from '../../components/ConfirmToast'
import { MapPin, Star, AlertTriangle, Navigation, Clock, User, Check, X } from 'lucide-react'

export default function DriverIncomingRequestPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [confirmToast, setConfirmToast] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [busyId, setBusyId] = useState('')

  const loadRequests = async () => {
    try {
      const data = await apiRequest('/api/drivers/ride-requests', { tokenKey: DRIVER_TOKEN_KEY })
      setRequests(data.data || [])
    } catch {
      setRequests([])
    }
  }

  useEffect(() => {
    if (!localStorage.getItem(DRIVER_TOKEN_KEY)) navigate('/driver/login')
    loadRequests()
    const intervalId = window.setInterval(() => {
      loadRequests()
    }, 10000)
    const offRealtime = onRealtimeRefresh(() => {
      loadRequests()
    })
    return () => {
      window.clearInterval(intervalId)
      offRealtime()
    }
  }, [navigate])

  const acceptRide = async (id) => {
    try {
      setErrorMessage('')
      setBusyId(String(id))
      await apiRequest(`/api/rides/${id}/accept`, { method: 'PATCH', tokenKey: DRIVER_TOKEN_KEY })
      setConfirmToast('Ride request confirmed. Proceed to active trip.')
      await loadRequests()
      navigate('/driver/trip', { state: { rideId: id } })
    } catch (error) {
      setErrorMessage(error.message || 'Could not accept this ride.')
    } finally {
      setBusyId('')
    }
  }

  const rejectRide = async (id) => {
    try {
      setErrorMessage('')
      setBusyId(String(id))
      await apiRequest(`/api/rides/${id}/reject`, { method: 'PATCH', tokenKey: DRIVER_TOKEN_KEY })
      await loadRequests()
    } catch (error) {
      setErrorMessage(error.message || 'Could not reject this ride.')
    } finally {
      setBusyId('')
    }
  }

  return (
    <DriverLayout title="Ride Radar">
      <ConfirmToast open={Boolean(confirmToast)} message={confirmToast} onClose={() => setConfirmToast('')} />
      {errorMessage ? (
        <div className="mb-5 rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-bold text-[#ff3b30] ring-1 ring-red-200">
          {errorMessage}
        </div>
      ) : null}
      {requests.length === 0 ? (
        <div className="relative flex h-[500px] flex-col items-center justify-center overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#edf3f9] to-[#ffffff] text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/60">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-64 w-64 animate-ping rounded-full bg-[#007AFF]/5"></div>
            <div className="absolute h-96 w-96 animate-ping rounded-full bg-[#007AFF]/5" style={{ animationDelay: '1s' }}></div>
          </div>
          <div className="relative z-10 grid h-24 w-24 place-items-center rounded-full bg-white shadow-xl ring-1 ring-[#d9e3ec]">
            <MapPin size={40} className="text-[#007AFF] animate-bounce" strokeWidth={1.5} />
          </div>
          <h2 className="relative z-10 mt-8 text-3xl font-black tracking-tight text-[#1c2731]">Scanning Area...</h2>
          <p className="relative z-10 mt-3 max-w-sm text-[15px] font-medium text-[#607282]">You are online. Keep this screen open to receive nearby ride requests instantly.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {requests.map((req) => (
            <article key={req._id || req.id} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-[0_8px_30px_rgba(0,122,255,0.08)] ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,122,255,0.15)] sm:p-8">
              
              {/* Header section */}
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#1c2731] to-[#3a4f63] text-xl font-black text-white shadow-md">
                      {(req.riderName || 'R')[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 flex items-center gap-0.5 rounded-full bg-[#ff9500] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                      <Star size={10} fill="currentColor" /> {req.rating}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#1c2731]">{req.riderName || 'Rider'}</h3>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#8a9aab]">
                      <Clock size={12} /> {req.time || 'New'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">Est. Fare</p>
                  <p className="text-3xl font-black tracking-tighter text-[#34c759]">৳{Number(req.fare || 0)}</p>
                </div>
              </div>

              {/* Route section */}
              <div className="relative mb-8 rounded-[1.5rem] bg-[#f8fafc] p-5 ring-1 ring-inset ring-[#d9e3ec]">
                <div className="absolute left-9 top-9 h-12 w-[2px] bg-gradient-to-b from-emerald-300 to-rose-300"></div>
                <div className="space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 ring-4 ring-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#34c759]"></span>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab]">Pickup</p>
                      <p className="text-[15px] font-bold text-[#1c2731]">{req.pickup || req.pickupAddress || 'Pickup'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-rose-100 ring-4 ring-white">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#ff3b30]"></span>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab]">Dropoff</p>
                      <p className="text-[15px] font-bold text-[#1c2731]">{req.dropoff || req.dropoffAddress || 'Dropoff'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => rejectRide(req._id || req.id)}
                    disabled={busyId === String(req._id || req.id)}
                    className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[1.5rem] bg-[#fff5f5] text-[#ff3b30] shadow-sm ring-1 ring-[#ffd4d4] transition-all hover:bg-[#ff3b30] hover:text-white hover:shadow-md active:scale-95"
                    aria-label="Reject Ride"
                  >
                    <X size={24} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => acceptRide(req._id || req.id)}
                    disabled={busyId === String(req._id || req.id)}
                    className="flex h-16 flex-1 items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-[#007AFF] to-[#0062CC] text-lg font-black text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)] transition-all hover:shadow-[0_12px_25px_rgba(0,122,255,0.4)] active:scale-95"
                  >
                    {busyId === String(req._id || req.id) ? 'Please wait...' : 'Accept'} <span className="rounded-md bg-white/20 px-2 py-0.5 text-sm">{req.distance || `${Number(req.distanceKm || 0).toFixed(1)} km`}</span>
                  </button>
                </div>
                <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#ff9500]">
                  <AlertTriangle size={14} /> Rejecting deducts ৳30 from your balance
                </p>
              </div>
              
            </article>
          ))}
        </div>
      )}
    </DriverLayout>
  )
}
