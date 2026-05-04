import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiRequest } from '../../services/api'
import { onRealtimeRefresh } from '../../services/realtime'
import { Activity, MapPin, Navigation, Compass, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'

export default function AdminRideMonitorPage() {
  const [rides, setRides] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadRides()
    const intervalId = window.setInterval(() => {
      loadRides()
    }, 10000)
    const offRealtime = onRealtimeRefresh(() => {
      loadRides()
    })
    return () => {
      window.clearInterval(intervalId)
      offRealtime()
    }
  }, [])

  const loadRides = async () => {
    try {
      const data = await apiRequest('/api/admin/rides')
      setRides(data.data || [])
    } catch { setRides([]) }
  }

  const filtered = filter === 'all' ? rides : rides.filter((r) => r.status === filter)

  const statusConfig = {
    requested: { bg: 'bg-orange-50', text: 'text-[#ff9500]', ring: 'ring-orange-200', icon: Clock },
    accepted: { bg: 'bg-blue-50', text: 'text-[#007AFF]', ring: 'ring-blue-200', icon: Navigation },
    arrived: { bg: 'bg-purple-50', text: 'text-[#5856d6]', ring: 'ring-purple-200', icon: MapPin },
    started: { bg: 'bg-green-50', text: 'text-[#34c759]', ring: 'ring-green-200', icon: Activity },
    completed: { bg: 'bg-slate-100', text: 'text-[#607282]', ring: 'ring-[#d9e3ec]', icon: CheckCircle2 },
    cancelled: { bg: 'bg-red-50', text: 'text-[#ff3b30]', ring: 'ring-red-200', icon: AlertTriangle },
  }

  const statusCounts = rides.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {})

  return (
    <AdminLayout title="Global Ride Monitor">
      
      {/* Header Panel */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1c2731] px-8 py-10 shadow-[0_15px_40px_rgba(28,39,49,0.2)] sm:px-12 mb-8 animate-in fade-in slide-in-from-bottom-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#007AFF]/30 blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#4da3ff] ring-1 ring-blue-400/30 backdrop-blur-md">
              <Activity size={14} className="animate-pulse" /> Live Tracking
            </div>
            <h2 className="text-3xl font-black text-white">Network Activity</h2>
            <p className="mt-2 text-[15px] font-medium text-[#8a9aab]">Monitor all passenger requests, active trips, and completed journeys in real-time.</p>
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="mb-8 overflow-x-auto scrollbar-hide animate-in fade-in slide-in-from-bottom-6">
        <div className="flex gap-3">
          {[
            { key: 'all', label: 'All Operations', count: rides.length },
            { key: 'requested', label: 'Requested' },
            { key: 'accepted', label: 'Accepted' },
            { key: 'started', label: 'In Progress' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex shrink-0 items-center gap-2 rounded-[1.5rem] px-6 py-3.5 text-[13px] font-bold transition-all ${
                filter === f.key
                  ? 'bg-gradient-to-r from-[#007AFF] to-[#0062CC] text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)] ring-1 ring-[#0062CC]'
                  : 'bg-white text-[#607282] shadow-sm ring-1 ring-[#d9e3ec] hover:-translate-y-1 hover:shadow-md hover:text-[#1c2731]'
              }`}
            >
              {f.label}
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${filter === f.key ? 'bg-white/20 text-white' : 'bg-[#f0f5fa] text-[#8a9aab]'}`}>
                {f.count !== undefined ? f.count : (statusCounts[f.key] || 0)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Display */}
      {filtered.length === 0 ? (
        <div className="flex h-[400px] flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-[#d9e3ec] bg-white text-center shadow-sm">
          <Compass size={48} className="mb-4 text-[#a0b0c0]" />
          <h3 className="text-xl font-black text-[#1c2731]">No Activity Found</h3>
          <p className="mt-1 text-[15px] font-medium text-[#607282]">There are currently no rides matching this status.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-8">
          {filtered.map((ride) => {
            const sc = statusConfig[ride.status] || statusConfig.completed
            const StatusIcon = sc.icon
            
            return (
              <div key={ride._id} className="group overflow-hidden rounded-[2.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,122,255,0.08)] sm:p-8">
                
                <div className="mb-6 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${sc.bg} ${sc.text} ring-1 ${sc.ring}`}>
                    <StatusIcon size={12} /> {ride.status}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#8a9aab] ring-1 ring-[#d9e3ec] rounded-md px-2 py-1">
                    {(ride._id || '').slice(-8).toUpperCase()}
                  </span>
                </div>

                <div className="mb-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-blue-50 text-[#007AFF]">
                      <span className="h-2 w-2 rounded-full bg-[#007AFF]"></span>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Origin</p>
                      <p className="text-[14px] font-bold text-[#1c2731] leading-tight mt-0.5">{ride.pickupAddress || '—'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-red-50 text-[#ff3b30]">
                      <span className="h-2 w-2 rounded-full bg-[#ff3b30]"></span>
                    </div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Destination</p>
                      <p className="text-[14px] font-bold text-[#1c2731] leading-tight mt-0.5">{ride.dropoffAddress || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#e8eef4] pt-5">
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Fare</p>
                    <p className="text-xl font-black text-[#1c2731] mt-0.5">৳{Number(ride.fare || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a9aab]"><Calendar size={10} className="inline mr-1" />Logged</p>
                    <p className="text-[12px] font-bold text-[#607282] mt-0.5">{new Date(ride.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </AdminLayout>
  )
}
