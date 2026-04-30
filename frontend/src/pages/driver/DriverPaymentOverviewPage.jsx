import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverLayout from '../../components/DriverLayout'
import { DRIVER_TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'
import { Car, Banknote, Building2, AlertTriangle, Star, CheckCircle2, Lightbulb, Wallet, ArrowRight } from 'lucide-react'

export default function DriverPaymentOverviewPage() {
  const navigate = useNavigate()
  const [earnings, setEarnings] = useState({ total_earnings: 0, completed_rides: 0 })

  useEffect(() => {
    if (!localStorage.getItem(DRIVER_TOKEN_KEY)) { navigate('/driver/login'); return }
    loadEarnings()
  }, [navigate])

  const loadEarnings = async () => {
    try {
      const data = await apiRequest('/api/drivers/earnings', { tokenKey: DRIVER_TOKEN_KEY })
      setEarnings(data.data || {})
    } catch { /* defaults */ }
  }

  const gross = earnings.total_earnings || 0
  const uberCut = Math.round(gross * 0.05)
  const net = gross - uberCut

  return (
    <DriverLayout title="Financial Overview">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* Massive Highlight Cards */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#34c759] to-[#248a3d] p-8 text-white shadow-[0_12px_40px_rgba(52,199,89,0.3)] transition-all hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(52,199,89,0.4)]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-[40px]"></div>
            <div className="relative z-10">
              <div className="mb-6 inline-flex rounded-2xl bg-white/20 p-3 backdrop-blur-md">
                <Banknote size={24} className="text-white" />
              </div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.15em] text-green-100">Gross Earnings</p>
              <p className="mt-2 text-4xl font-black tracking-tighter sm:text-5xl">৳{gross.toLocaleString()}</p>
              <div className="mt-4 flex items-center gap-2 rounded-full bg-black/10 px-3 py-1.5 w-fit">
                <Car size={14} className="text-green-100" />
                <p className="text-[12px] font-bold text-green-100">{earnings.completed_rides} rides completed</p>
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#ff9500] to-[#cc7700] p-8 text-white shadow-[0_12px_40px_rgba(255,149,0,0.3)] transition-all hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(255,149,0,0.4)]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-[40px]"></div>
            <div className="relative z-10">
              <div className="mb-6 inline-flex rounded-2xl bg-white/20 p-3 backdrop-blur-md">
                <Building2 size={24} className="text-white" />
              </div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.15em] text-orange-100">Platform Fee (5%)</p>
              <p className="mt-2 text-4xl font-black tracking-tighter sm:text-5xl">৳{uberCut.toLocaleString()}</p>
              <div className="mt-4 flex items-center gap-2 rounded-full bg-black/10 px-3 py-1.5 w-fit">
                <AlertTriangle size={14} className="text-orange-100" />
                <p className="text-[12px] font-bold text-orange-100">Daily platform commission</p>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#007AFF] to-[#005bb5] p-8 text-white shadow-[0_12px_40px_rgba(0,122,255,0.3)] transition-all hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,122,255,0.4)]">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-[40px]"></div>
            <div className="relative z-10">
              <div className="mb-6 inline-flex rounded-2xl bg-white/20 p-3 backdrop-blur-md">
                <Wallet size={24} className="text-white" />
              </div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.15em] text-blue-100">Net Payout</p>
              <p className="mt-2 text-4xl font-black tracking-tighter sm:text-5xl">৳{net.toLocaleString()}</p>
              <div className="mt-4 flex items-center gap-2 rounded-full bg-black/10 px-3 py-1.5 w-fit">
                <CheckCircle2 size={14} className="text-blue-100" />
                <p className="text-[12px] font-bold text-blue-100">Your total take-home</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="overflow-hidden rounded-[2.5rem] bg-white/70 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/60 backdrop-blur-xl sm:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black tracking-tight text-[#1c2731]">Earnings Breakdown</h3>
              <p className="mt-1 text-[14px] font-medium text-[#607282]">Detailed view of your daily transactions and fees.</p>
            </div>
            <div className="hidden rounded-full bg-[#f8fafc] px-4 py-2 ring-1 ring-[#d9e3ec] sm:block">
              <span className="text-[12px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab]">Today</span>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { label: 'Total Rides Completed', value: earnings.completed_rides || 0, icon: <Car size={20} className="text-[#007AFF]" />, bg: 'bg-blue-50' },
              { label: 'Gross Ride Earnings', value: `৳${gross.toLocaleString()}`, icon: <Banknote size={20} className="text-[#34c759]" />, bg: 'bg-green-50' },
              { label: 'Uber Commission (5%)', value: `−৳${uberCut.toLocaleString()}`, icon: <Building2 size={20} className="text-[#ff3b30]" />, color: 'text-[#ff3b30]', bg: 'bg-red-50' },
              { label: 'Ride Rejection Penalties', value: '−৳0', icon: <AlertTriangle size={20} className="text-[#ff9500]" />, color: 'text-[#ff9500]', bg: 'bg-orange-50' },
              { label: 'Loyalty Bonus (After 1 Year)', value: '+৳0', icon: <Star size={20} className="text-[#8a9aab]" />, color: 'text-[#8a9aab]', bg: 'bg-slate-50' },
            ].map((row, idx) => (
              <div key={idx} className="group flex items-center justify-between rounded-2xl bg-white/50 p-4 ring-1 ring-[#d9e3ec] transition-all hover:bg-white hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className={`grid h-12 w-12 place-items-center rounded-xl ${row.bg} transition-transform group-hover:scale-110`}>
                    {row.icon}
                  </div>
                  <span className="text-[15px] font-bold text-[#1c2731]">{row.label}</span>
                </div>
                <span className={`text-[16px] font-black tracking-tight ${row.color || 'text-[#1c2731]'}`}>{row.value}</span>
              </div>
            ))}
            
            {/* Grand Total Row */}
            <div className="mt-6 flex items-center justify-between rounded-[1.5rem] bg-[#1c2731] p-6 text-white shadow-lg ring-4 ring-[#1c2731]/10">
              <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/10">
                  <CheckCircle2 size={24} className="text-[#34c759]" />
                </div>
                <div>
                  <span className="text-[12px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">Total Payout</span>
                  <p className="text-xl font-black">Net Take-Home</p>
                </div>
              </div>
              <span className="text-4xl font-black tracking-tighter text-[#34c759]">৳{net.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#e8f4fd] to-blue-50 p-6 shadow-sm ring-1 ring-blue-100 transition-all hover:shadow-md sm:p-8">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/40 to-transparent"></div>
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-[#007AFF] text-white shadow-lg shadow-[#007AFF]/20">
              <Lightbulb size={28} />
            </div>
            <div>
              <p className="text-[12px] font-extrabold uppercase tracking-[0.15em] text-[#007AFF]">Driver Tip</p>
              <p className="mt-1 text-[15px] font-bold leading-relaxed text-[#1c2731]">
                Complete at least <span className="text-[#007AFF]">5 rides daily</span> and earn a minimum of <span className="text-[#007AFF]">৳3,000</span> to hit your daily targets. Maintain this for 1 year to unlock a permanent 5% pay increase!
              </p>
            </div>
            <button className="ml-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-white text-[#007AFF] shadow-sm ring-1 ring-[#d9e3ec] transition-transform hover:scale-105 active:scale-95">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

      </div>
    </DriverLayout>
  )
}
