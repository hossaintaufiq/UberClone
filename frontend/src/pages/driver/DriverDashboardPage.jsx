import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverLayout from '../../components/DriverLayout'
import { DRIVER_TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'
import { onRealtimeRefresh } from '../../services/realtime'

export default function DriverDashboardPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({})
  const [earnings, setEarnings] = useState({ total_earnings: 0, completed_rides: 0 })
  const [isOnline, setIsOnline] = useState(false)
  const [mood, setMood] = useState('')

  useEffect(() => {
    if (!localStorage.getItem(DRIVER_TOKEN_KEY)) { navigate('/driver/login'); return }
    loadData()

    const intervalId = window.setInterval(() => {
      loadData()
    }, 10000)
    const offRealtime = onRealtimeRefresh(() => {
      loadData()
    })

    return () => {
      window.clearInterval(intervalId)
      offRealtime()
    }
  }, [navigate])

  const loadData = async () => {
    try {
      const [p, e] = await Promise.all([
        apiRequest('/api/drivers/profile', { tokenKey: DRIVER_TOKEN_KEY }),
        apiRequest('/api/drivers/earnings', { tokenKey: DRIVER_TOKEN_KEY }),
      ])
      setProfile(p.data || {})
      setEarnings(e.data || {})
      setIsOnline(p.data?.isOnline || false)
    } catch { /* defaults */ }
  }

  const toggleOnline = async () => {
    try {
      const res = await apiRequest('/api/drivers/go-online', { method: 'PATCH', tokenKey: DRIVER_TOKEN_KEY })
      setIsOnline(res.is_online)
    } catch { /* ignore */ }
  }

  const dailyTarget = { minRides: 5, maxRides: 20, minEarnings: 3000, maxEarnings: 15000 }
  const rideProgress = Math.min((earnings.completed_rides / dailyTarget.minRides) * 100, 100)
  const earningsProgress = Math.min((earnings.total_earnings / dailyTarget.minEarnings) * 100, 100)

  const moods = ['Happy', 'Neutral', 'Stressed', 'Angry', 'Sick']

  return (
    <DriverLayout title="Dashboard">
      {/* Online Toggle */}
      <div className="mb-6 flex items-center justify-between rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-8">
        <div>
          <p className="text-2xl font-extrabold tracking-tight text-[#1c2731]">Welcome, <span className="bg-gradient-to-r from-[#007AFF] to-[#00c6ff] bg-clip-text text-transparent">{profile.name || 'Driver'}</span></p>
          <div className="mt-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              {isOnline && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-75"></span>}
              <span className={`relative inline-flex h-3 w-3 rounded-full ${isOnline ? 'bg-[#34c759]' : 'bg-[#8a9aab]'}`}></span>
            </span>
            <p className="text-[15px] font-medium text-[#607282]">{isOnline ? 'You are online — accepting rides' : 'You are currently offline'}</p>
          </div>
        </div>
        <button
          onClick={toggleOnline}
          className={`group relative overflow-hidden rounded-full px-8 py-3.5 text-[15px] font-bold text-white shadow-md transition-all active:scale-95 ${
            isOnline
              ? 'bg-gradient-to-r from-[#ff3b30] to-[#ff453a] hover:shadow-[0_8px_20px_rgba(255,59,48,0.3)]'
              : 'bg-gradient-to-r from-[#34c759] to-[#30d158] hover:shadow-[0_8px_20px_rgba(52,199,89,0.3)]'
          }`}
        >
          <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100"></div>
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/90">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab]">Rides Today</p>
          <p className="mt-2 text-3xl font-black text-[#1c2731]">{earnings.completed_rides || 0}</p>
          <p className="mt-1 text-[13px] font-medium text-[#607282]">Target: {dailyTarget.minRides}–{dailyTarget.maxRides}</p>
        </div>
        <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/90">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab]">Earnings Today</p>
          <p className="mt-2 text-3xl font-black text-[#34c759]">৳{(earnings.total_earnings || 0).toLocaleString()}</p>
          <p className="mt-1 text-[13px] font-medium text-[#607282]">Target: ৳{dailyTarget.minEarnings.toLocaleString()}</p>
        </div>
        <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-white/90">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab]">Transitely Cut (5%)</p>
          <p className="mt-2 text-3xl font-black text-[#ff9500]">৳{Math.round((earnings.total_earnings || 0) * 0.05).toLocaleString()}</p>
          <p className="mt-1 text-[13px] font-medium text-[#607282]">Daily platform fee</p>
        </div>
        <div className="group relative overflow-hidden rounded-3xl border border-white/60 bg-[#007AFF]/5 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md transition-all hover:-translate-y-1 hover:bg-[#007AFF]/10">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#007AFF]/80">Net Earnings</p>
          <p className="mt-2 text-3xl font-black text-[#007AFF]">৳{Math.round((earnings.total_earnings || 0) * 0.95).toLocaleString()}</p>
          <p className="mt-1 text-[13px] font-medium text-[#007AFF]/70">After 5% deduction</p>
        </div>
      </div>

      {/* Daily Target Progress */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-8">
          <p className="mb-4 text-[12px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">Ride Target Progress</p>
          <div className="mb-3 flex items-end justify-between">
            <span className="text-[15px] font-medium text-[#607282]"><strong className="text-xl text-[#1c2731]">{earnings.completed_rides || 0}</strong> / {dailyTarget.minRides} rides</span>
            <span className="text-lg font-black text-[#34c759]">{Math.round(rideProgress)}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-[#f0f5fa] shadow-inner ring-1 ring-inset ring-black/5">
            <div className="h-full rounded-full bg-gradient-to-r from-[#34c759] to-[#30d158] transition-all duration-1000 ease-out" style={{ width: `${rideProgress}%` }} />
          </div>
        </div>
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-8">
          <p className="mb-4 text-[12px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">Earnings Target Progress</p>
          <div className="mb-3 flex items-end justify-between">
            <span className="text-[15px] font-medium text-[#607282]"><strong className="text-xl text-[#1c2731]">৳{(earnings.total_earnings || 0).toLocaleString()}</strong> / ৳{dailyTarget.minEarnings.toLocaleString()}</span>
            <span className="text-lg font-black text-[#007AFF]">{Math.round(earningsProgress)}%</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-[#f0f5fa] shadow-inner ring-1 ring-inset ring-black/5">
            <div className="h-full rounded-full bg-gradient-to-r from-[#007AFF] to-[#00c6ff] transition-all duration-1000 ease-out" style={{ width: `${earningsProgress}%` }} />
          </div>
        </div>
      </div>

      {/* Mood Feedback & Loyalty */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-8">
          <p className="mb-4 text-[12px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">Quick Mood Feedback</p>
          <p className="mb-4 text-[15px] font-medium text-[#607282]">How are you feeling today?</p>
          <div className="flex flex-wrap gap-3">
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`rounded-full px-5 py-2.5 text-[14px] font-bold transition-all active:scale-95 ${
                  mood === m 
                  ? 'bg-gradient-to-r from-[#34c759] to-[#30d158] text-white shadow-[0_4px_12px_rgba(52,199,89,0.3)] ring-2 ring-[#34c759]/30 ring-offset-2 ring-offset-white/50' 
                  : 'bg-white text-[#607282] shadow-sm ring-1 ring-[#d9e3ec] hover:bg-[#f0f5fa] hover:text-[#1c2731]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          {mood && (
            <div className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#34c759]/10 px-4 py-2 text-[14px] font-medium text-[#34c759]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#34c759] text-white">✓</span>
              Mood recorded: {mood}
            </div>
          )}
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#007AFF] via-[#0062CC] to-[#004bb5] p-6 text-white shadow-[0_12px_40px_rgba(0,122,255,0.25)] sm:p-8">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/20 blur-[40px]"></div>
          <div className="relative z-10">
            <p className="text-[12px] font-extrabold uppercase tracking-[0.15em] text-blue-200">Loyalty Program</p>
            <p className="mt-2 text-2xl font-black tracking-tight">1-Year Loyalty Bonus</p>
            <p className="mt-3 text-[15px] leading-relaxed text-blue-100">Complete 1 year of continuous service to unlock a permanent 5% pay raise and exclusive partner benefits!</p>
            <div className="mt-6 flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/10 p-5 shadow-inner backdrop-blur-md">
              <p className="text-[13px] font-medium text-blue-200">Joined: <span className="text-white">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</span></p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-[15px] font-bold">Status: Active Driver</p>
                <div className="h-2 w-2 rounded-full bg-[#34c759] shadow-[0_0_8px_rgba(52,199,89,0.8)]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DriverLayout>
  )
}
