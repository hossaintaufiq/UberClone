import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverLayout from '../../components/DriverLayout'
import { DRIVER_TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'
import { ClipboardList, Car, Star, MapPin, Map as MapIcon, ArrowRight, Navigation, CheckCircle2 } from 'lucide-react'

export default function DriverRideHistoryPage() {
  const navigate = useNavigate()
  const [rides, setRides] = useState([])

  useEffect(() => {
    if (!localStorage.getItem(DRIVER_TOKEN_KEY)) { navigate('/driver/login'); return }
    loadRides()

    const intervalId = window.setInterval(() => {
      loadRides()
    }, 10000)

    return () => window.clearInterval(intervalId)
  }, [navigate])

  const loadRides = async () => {
    try {
      const data = await apiRequest('/api/drivers/rides', { tokenKey: DRIVER_TOKEN_KEY })
      setRides(data.data || [])
    } catch { setRides([]) }
  }

  const statusColors = {
    completed: 'bg-green-50 text-[#34c759] ring-[#34c759]/30',
    cancelled: 'bg-red-50 text-[#ff3b30] ring-[#ff3b30]/30',
    started: 'bg-blue-50 text-[#007AFF] ring-[#007AFF]/30',
    accepted: 'bg-orange-50 text-[#ff9500] ring-[#ff9500]/30',
  }

  // Summary Metrics
  const completedRides = rides.filter(r => r.status === 'completed').length
  const totalEarnings = rides.filter(r => r.status === 'completed').reduce((sum, r) => sum + Number(r.fare || 0), 0)

  return (
    <DriverLayout title="Ride History & Ledger">
      
      {/* Header Summary */}
      <div className="mb-8 grid gap-4 animate-in fade-in slide-in-from-bottom-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="mb-4 inline-flex rounded-2xl bg-blue-50 p-3 text-[#007AFF]">
            <ClipboardList size={24} />
          </div>
          <p className="text-3xl font-black text-[#1c2731]">{rides.length}</p>
          <p className="mt-1 text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Total Trips Logged</p>
        </div>
        
        <div className="overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="mb-4 inline-flex rounded-2xl bg-green-50 p-3 text-[#34c759]">
            <CheckCircle2 size={24} />
          </div>
          <p className="text-3xl font-black text-[#1c2731]">{completedRides}</p>
          <p className="mt-1 text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Successfully Completed</p>
        </div>

        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#007AFF] to-[#0062CC] p-6 shadow-[0_15px_40px_rgba(0,122,255,0.2)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,122,255,0.3)] sm:col-span-2 lg:col-span-1">
          <div className="mb-4 inline-flex rounded-2xl bg-white/20 p-3 text-white ring-1 ring-white/20 backdrop-blur-md">
            <Star size={24} />
          </div>
          <p className="text-3xl font-black text-white">৳{totalEarnings.toLocaleString()}</p>
          <p className="mt-1 text-[12px] font-extrabold uppercase tracking-widest text-blue-200">Historical Gross Earnings</p>
        </div>
      </div>

      {rides.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-[#d9e3ec] bg-white py-24 text-center shadow-sm">
          <div className="mb-6 grid h-24 w-24 place-items-center rounded-[2rem] bg-[#f8fafc] text-[#a0b0c0] ring-1 ring-[#d9e3ec]">
            <Navigation size={40} />
          </div>
          <h3 className="text-2xl font-black text-[#1c2731]">No Ride History</h3>
          <p className="mt-2 text-[15px] font-medium text-[#607282]">Your completed and cancelled trips will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8">
          {rides.map((ride) => (
            <article key={ride._id} className="group relative overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,122,255,0.08)] sm:p-8">
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#f8fafc] to-transparent opacity-50"></div>
              
              <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-wider ring-1 ${statusColors[ride.status] || 'bg-slate-100 text-[#607282] ring-[#d9e3ec]'}`}>
                      {ride.status}
                    </span>
                    <span className="text-[13px] font-bold text-[#8a9aab]">{new Date(ride.createdAt).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-blue-50 text-[#007AFF] ring-1 ring-blue-100">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Pickup</p>
                        <p className="text-[15px] font-bold text-[#1c2731]">{ride.pickupAddress || 'Unknown'}</p>
                      </div>
                    </div>
                    
                    <div className="hidden text-[#d9e3ec] sm:block"><ArrowRight size={20} /></div>
                    
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-50 text-[#ff3b30] ring-1 ring-red-100">
                        <MapIcon size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Dropoff</p>
                        <p className="text-[15px] font-bold text-[#1c2731]">{ride.dropoffAddress || 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-start justify-between border-t border-[#e8eef4] pt-6 lg:items-end lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Trip Fare</p>
                    <p className="mt-1 text-3xl font-black tracking-tighter text-[#1c2731]">৳{Number(ride.fare || 0).toLocaleString()}</p>
                  </div>
                  
                  {ride.riderRating && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-2 ring-1 ring-orange-200">
                      <Star size={14} fill="currentColor" className="text-[#ff9500]" />
                      <span className="text-[12px] font-bold text-[#ff9500]">Rated {ride.riderRating}/5</span>
                    </div>
                  )}
                </div>
              </div>

            </article>
          ))}
        </div>
      )}
    </DriverLayout>
  )
}
