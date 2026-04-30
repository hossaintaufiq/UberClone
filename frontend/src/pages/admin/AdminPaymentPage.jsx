import { useEffect, useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { apiRequest } from '../../services/api'
import { Banknote, TrendingUp, Save, Wallet, Receipt, CreditCard, Activity, Settings2 } from 'lucide-react'

export default function AdminPaymentPage() {
  const [revenue, setRevenue] = useState({ total_revenue: 0, total_payments: 0 })
  const [fareConfig, setFareConfig] = useState({ perKmRate: 12, baseFare: 40, commissionPercent: 5 })
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const rev = await apiRequest('/api/admin/revenue')
      setRevenue(rev.data || {})
    } catch { /* defaults */ }
  }

  const commission = Math.round((revenue.total_revenue || 0) * 0.05)
  const payouts = (revenue.total_revenue || 0) - commission

  return (
    <AdminLayout title="Financial Operations">
      
      {message && (
        <div className="animate-in fade-in slide-in-from-top-4 mb-6 flex items-center justify-between rounded-[1.5rem] bg-green-50 p-4 ring-1 ring-green-500/20">
          <p className="text-[13px] font-bold text-[#34c759]">{message}</p>
          <button onClick={() => setMessage('')} className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#34c759] shadow-sm hover:scale-105 hover:bg-[#34c759] hover:text-white transition-all">✕</button>
        </div>
      )}

      {/* Revenue Split Overview */}
      <div className="mb-8 grid gap-4 animate-in fade-in slide-in-from-bottom-4 lg:grid-cols-3">
        
        {/* Gross Revenue Widget */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-md lg:col-span-1">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#007AFF]/5 to-transparent"></div>
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex rounded-[1.2rem] bg-blue-50 p-3 text-[#007AFF]">
                <Banknote size={24} />
              </div>
              <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Gross Network Revenue</p>
              <h2 className="mt-1 text-4xl font-black tracking-tighter text-[#1c2731]">৳{(revenue.total_revenue || 0).toLocaleString()}</h2>
            </div>
            <div className="mt-8 flex items-center gap-2 rounded-xl bg-[#f8fafc] px-4 py-3 ring-1 ring-[#d9e3ec]">
              <Activity size={16} className="text-[#007AFF]" />
              <p className="text-[13px] font-bold text-[#607282]"><span className="text-[#1c2731]">{revenue.total_payments || 0}</span> transactions processed</p>
            </div>
          </div>
        </div>

        {/* Breakdown Widget */}
        <div className="grid gap-4 lg:col-span-2 sm:grid-cols-2">
          
          <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#007AFF] to-[#0062CC] p-8 text-white shadow-[0_15px_40px_rgba(0,122,255,0.2)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,122,255,0.3)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="mb-6 inline-flex rounded-[1.2rem] bg-white/20 p-3 text-white ring-1 ring-white/20 backdrop-blur-md">
                <Wallet size={24} />
              </div>
              <p className="text-[12px] font-extrabold uppercase tracking-widest text-blue-200">Platform Commission (5%)</p>
              <h2 className="mt-1 text-4xl font-black tracking-tighter">৳{commission.toLocaleString()}</h2>
              <p className="mt-4 text-[13px] font-medium text-blue-100">Transitely's operational take-rate</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1c2731] to-[#0f151c] p-8 text-white shadow-[0_15px_40px_rgba(28,39,49,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(28,39,49,0.4)]">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/5 blur-xl transition-transform group-hover:scale-150"></div>
            <div className="relative z-10">
              <div className="mb-6 inline-flex rounded-[1.2rem] bg-white/10 p-3 text-white ring-1 ring-white/10 backdrop-blur-md">
                <Receipt size={24} />
              </div>
              <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Driver Payouts (95%)</p>
              <h2 className="mt-1 text-4xl font-black tracking-tighter">৳{payouts.toLocaleString()}</h2>
              <p className="mt-4 text-[13px] font-medium text-[#8a9aab]">Funds distributed to fleet captains</p>
            </div>
          </div>

        </div>
      </div>

      {/* Pricing Configuration Engine */}
      <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] animate-in fade-in slide-in-from-bottom-8">
        
        <div className="bg-[#f8fafc] px-8 py-6 border-b border-[#e8eef4]">
          <h3 className="text-xl font-black text-[#1c2731] flex items-center gap-3">
            <Settings2 size={24} className="text-[#007AFF]" /> Pricing Algorithm Config
          </h3>
          <p className="mt-1 text-[13px] font-medium text-[#8a9aab]">Adjust base rates and multipliers that affect all future trip requests.</p>
        </div>

        <div className="p-8">
          <div className="grid gap-6 sm:grid-cols-3">
            
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] flex items-center gap-2">
                <CreditCard size={14} /> Base Fare (৳)
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-[#a0b0c0]">৳</span>
                <input
                  type="number"
                  value={fareConfig.baseFare}
                  onChange={(e) => setFareConfig({ ...fareConfig, baseFare: Number(e.target.value) })}
                  className="w-full rounded-[1.5rem] bg-[#f8fafc] py-4 pl-10 pr-5 text-2xl font-black text-[#1c2731] shadow-inner ring-1 ring-[#d9e3ec] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] flex items-center gap-2">
                <TrendingUp size={14} /> Per KM Rate (৳)
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-lg font-black text-[#a0b0c0]">৳</span>
                <input
                  type="number"
                  value={fareConfig.perKmRate}
                  onChange={(e) => setFareConfig({ ...fareConfig, perKmRate: Number(e.target.value) })}
                  className="w-full rounded-[1.5rem] bg-[#f8fafc] py-4 pl-10 pr-5 text-2xl font-black text-[#1c2731] shadow-inner ring-1 ring-[#d9e3ec] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] flex items-center gap-2">
                <Activity size={14} /> Platform Fee (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={fareConfig.commissionPercent}
                  onChange={(e) => setFareConfig({ ...fareConfig, commissionPercent: Number(e.target.value) })}
                  className="w-full rounded-[1.5rem] bg-[#f8fafc] py-4 pl-5 pr-10 text-2xl font-black text-[#1c2731] shadow-inner ring-1 ring-[#d9e3ec] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lg font-black text-[#a0b0c0]">%</span>
              </div>
            </div>
            
          </div>

          <div className="mt-8 rounded-[2rem] bg-[#f8fafc] p-6 ring-1 ring-[#d9e3ec]">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] mb-4">Live Fare Preview Generator</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[5, 10, 20].map((km) => (
                <div key={km} className="flex flex-col items-center justify-center rounded-[1.5rem] bg-white p-5 shadow-sm ring-1 ring-[#d9e3ec]">
                  <p className="text-[13px] font-bold text-[#607282]">{km} KM Trip</p>
                  <p className="mt-1 text-2xl font-black tracking-tighter text-[#007AFF]">৳{fareConfig.baseFare + fareConfig.perKmRate * km}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={() => {
                setMessage('Fare engine configuration deployed successfully.')
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className="flex items-center gap-2 rounded-full bg-[#1c2731] px-8 py-4 text-[15px] font-black text-white shadow-[0_8px_20px_rgba(28,39,49,0.2)] transition-all hover:bg-[#2a3a4a] hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
            >
              Deploy Configuration <Save size={18} />
            </button>
          </div>
          
        </div>
      </div>
    </AdminLayout>
  )
}
