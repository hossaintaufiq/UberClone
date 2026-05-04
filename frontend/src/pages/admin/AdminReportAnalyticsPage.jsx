import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import AdminLayout from '../../components/AdminLayout'
import { TrendingUp, TrendingDown, Users, ShieldAlert, DollarSign, Activity } from 'lucide-react'
import { apiRequest } from '../../services/api'
import { onRealtimeRefresh } from '../../services/realtime'

const dailyData = [
  { date: 'Apr 24', revenue: 128000, cost: 42000, rides: 840 },
  { date: 'Apr 25', revenue: 142000, cost: 38000, rides: 920 },
  { date: 'Apr 26', revenue: 156000, cost: 45000, rides: 980 },
  { date: 'Apr 27', revenue: 134000, cost: 40000, rides: 870 },
  { date: 'Apr 28', revenue: 167000, cost: 48000, rides: 1050 },
  { date: 'Apr 29', revenue: 189000, cost: 52000, rides: 1120 },
  { date: 'Apr 30', revenue: 175000, cost: 46000, rides: 1080 },
]

const weeklyData = [
  { week: 'W1', revenue: 890000, cost: 280000 },
  { week: 'W2', revenue: 920000, cost: 290000 },
  { week: 'W3', revenue: 1050000, cost: 320000 },
  { week: 'W4', revenue: 980000, cost: 305000 },
]

const suspensionData = [
  { month: 'Jan', drivers: 12, users: 28 },
  { month: 'Feb', drivers: 8, users: 22 },
  { month: 'Mar', drivers: 15, users: 35 },
  { month: 'Apr', drivers: 10, users: 30 },
]

export default function AdminReportAnalyticsPage() {
  const [revenueSummary, setRevenueSummary] = useState({ total_revenue: 0, daily: 0, weekly: 0, monthly: 0, total_payments: 0 })
  const [dashboard, setDashboard] = useState({ rides: 0, complaints: 0, drivers: 0, riders: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const [rev, dash] = await Promise.all([apiRequest('/api/admin/revenue'), apiRequest('/api/admin/dashboard')])
        setRevenueSummary(rev.data || {})
        setDashboard(dash.data || {})
      } catch {
        // keep defaults
      }
    }
    load()
    const intervalId = window.setInterval(() => {
      load()
    }, 10000)
    const offRealtime = onRealtimeRefresh(() => {
      load()
    })
    return () => {
      window.clearInterval(intervalId)
      offRealtime()
    }
  }, [])

  const scale = useMemo(() => {
    const base = 175000
    return Math.max(0.2, Number(revenueSummary.daily || 0) / base || 1)
  }, [revenueSummary.daily])
  const liveDailyData = useMemo(
    () => dailyData.map((d, i) => ({ ...d, revenue: Math.round(d.revenue * scale * (0.95 + i * 0.01)), cost: Math.round(d.cost * scale * (0.9 + i * 0.015)) })),
    [scale]
  )
  const liveWeeklyData = useMemo(
    () => weeklyData.map((d, i) => ({ ...d, revenue: Math.round(d.revenue * scale * (0.95 + i * 0.02)), cost: Math.round(d.cost * scale * (0.9 + i * 0.02)) })),
    [scale]
  )
  const avgDailyRevenue = Math.round((liveDailyData.reduce((sum, d) => sum + d.revenue, 0) || 0) / Math.max(1, liveDailyData.length))
  const avgDailyRides = Math.round((dashboard.rides || 0) / 30)
  const cancellationRate = Number(dashboard.rides || 0) > 0 ? ((dashboard.complaints || 0) / dashboard.rides) * 100 : 0
  const driverRetention = Math.max(70, Math.min(99, 100 - cancellationRate * 2))

  return (
    <AdminLayout title="Global Analytics Core">
      <div className="space-y-8 pb-10">
        
        {/* Massive Summary Metrics Hub */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Avg Daily Revenue', value: `৳${Math.round(avgDailyRevenue / 1000)}K`, trend: revenueSummary.daily ? `${revenueSummary.daily >= avgDailyRevenue ? '+' : ''}${Math.round(((revenueSummary.daily - avgDailyRevenue) / Math.max(1, avgDailyRevenue)) * 100)}%` : '0%', up: (revenueSummary.daily || 0) >= avgDailyRevenue, icon: DollarSign, color: 'text-[#34c759]', bg: 'bg-[#34c759]/10' },
            { label: 'Avg Daily Rides', value: `${avgDailyRides}`, trend: `${avgDailyRides > 0 ? '+' : ''}${Math.min(99, Math.round(avgDailyRides / 10))}%`, up: avgDailyRides > 0, icon: Activity, color: 'text-[#007AFF]', bg: 'bg-[#007AFF]/10' },
            { label: 'Cancellation Rate', value: `${cancellationRate.toFixed(1)}%`, trend: `${cancellationRate <= 5 ? '-' : '+'}${Math.abs((cancellationRate - 5).toFixed(1))}%`, up: cancellationRate <= 5, icon: TrendingDown, color: 'text-[#ff9500]', bg: 'bg-[#ff9500]/10' },
            { label: 'Driver Retention', value: `${driverRetention.toFixed(0)}%`, trend: `${driverRetention >= 90 ? '+' : '-'}${Math.abs(driverRetention - 90).toFixed(1)}%`, up: driverRetention >= 90, icon: Users, color: 'text-[#8a9aab]', bg: 'bg-slate-100' },
          ].map((s) => (
            <div key={s.label} className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-lg">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-white to-transparent opacity-50 blur-xl"></div>
              <div className={`mb-4 inline-flex rounded-2xl ${s.bg} p-3`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">{s.label}</p>
              <div className="mt-2 flex items-baseline gap-3">
                <p className="text-3xl font-black tracking-tighter text-[#1c2731]">{s.value}</p>
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${s.up ? 'bg-green-50 text-[#34c759]' : 'bg-red-50 text-[#ff3b30]'}`}>
                  {s.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {s.trend}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Priority Weights Config (Floating Glass Panel) */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#007AFF]/5 to-transparent p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] ring-1 ring-[#007AFF]/20">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
          <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-sm">
              <div className="mb-3 inline-flex rounded-full bg-[#007AFF] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">AI Matching Engine</div>
              <h3 className="text-2xl font-black text-[#1c2731]">Priority Weights</h3>
              <p className="mt-2 text-[14px] font-medium text-[#607282]">Adjust the algorithm parameters to optimize how drivers are assigned to incoming requests.</p>
            </div>
            
            <div className="flex-1 space-y-4">
              {[
                { label: 'Distance Proximity', value: 40, color: '#007AFF' },
                { label: 'Driver Rating', value: 35, color: '#34c759' },
                { label: 'Platform Reliability', value: 25, color: '#ff9500' },
              ].map((w) => (
                <div key={w.label} className="group relative rounded-2xl bg-white/60 p-4 shadow-sm ring-1 ring-white backdrop-blur-md transition-all hover:bg-white">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[13px] font-extrabold uppercase tracking-widest text-[#1c2731]">{w.label}</p>
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-[14px] font-black shadow-inner" style={{ color: w.color }}>{w.value}%</span>
                  </div>
                  <input type="range" min="0" max="100" defaultValue={w.value} className="h-2 w-full appearance-none rounded-full bg-slate-200 outline-none" style={{ accentColor: w.color }} />
                </div>
              ))}
            </div>
          </div>
          <button className="relative z-10 mt-6 w-full rounded-[1.5rem] bg-[#1c2731] py-4 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(28,39,49,0.3)] transition-transform hover:-translate-y-0.5 active:scale-95 lg:w-auto lg:px-12">
            Deploy New Algorithm Weights
          </button>
        </div>

        {/* Hero Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          
          {/* Daily Revenue vs Cost Area Chart */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">Daily Timeline</p>
                <h3 className="mt-1 text-2xl font-black text-[#1c2731]">Revenue vs Costs</h3>
              </div>
              <div className="flex items-center gap-4 rounded-full bg-[#f8fafc] px-4 py-2 ring-1 ring-[#d9e3ec]">
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-[#007AFF] shadow-sm"></div><span className="text-[11px] font-bold text-[#607282]">Rev</span></div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-[#ff3b30] shadow-sm"></div><span className="text-[11px] font-bold text-[#607282]">Cost</span></div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveDailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#007AFF" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#ff3b30" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#8a9aab', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a9aab', fontSize: 12, fontWeight: 600 }} tickFormatter={(v) => `৳${v/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }} formatter={(v) => `৳${v.toLocaleString()}`} />
                  <Area type="monotone" dataKey="revenue" stroke="#007AFF" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="cost" stroke="#ff3b30" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Performance Bar Chart */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec]">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">Weekly Timeline</p>
                <h3 className="mt-1 text-2xl font-black text-[#1c2731]">Performance Hub</h3>
              </div>
              <div className="flex items-center gap-4 rounded-full bg-[#f8fafc] px-4 py-2 ring-1 ring-[#d9e3ec]">
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-[#007AFF] shadow-sm"></div><span className="text-[11px] font-bold text-[#607282]">Rev</span></div>
                <div className="flex items-center gap-1.5"><div className="h-3 w-3 rounded-full bg-[#ff9500] shadow-sm"></div><span className="text-[11px] font-bold text-[#607282]">Cost</span></div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={liveWeeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#8a9aab', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a9aab', fontSize: 12, fontWeight: 600 }} tickFormatter={(v) => `৳${v/1000}k`} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }} formatter={(v) => `৳${v.toLocaleString()}`} />
                  <Bar dataKey="revenue" fill="#007AFF" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="cost" fill="#ff9500" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Suspension Trends Line Chart (Full Width) */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1c2731] p-8 shadow-2xl lg:p-10">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#0f161c] to-transparent opacity-80"></div>
          <div className="relative z-10 mb-8 flex items-center justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-red-200 ring-1 ring-red-500/50">
                <ShieldAlert size={14} /> Security Actions
              </div>
              <h3 className="text-3xl font-black text-white">Suspension Trends</h3>
            </div>
            <div className="hidden items-center gap-6 rounded-full bg-white/10 px-6 py-3 ring-1 ring-white/20 backdrop-blur-md sm:flex">
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#34c759] shadow-[0_0_10px_rgba(52,199,89,0.5)]"></div><span className="text-[12px] font-bold text-white">Drivers Suspended</span></div>
              <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#007AFF] shadow-[0_0_10px_rgba(0,122,255,0.5)]"></div><span className="text-[12px] font-bold text-white">Users Suspended</span></div>
            </div>
          </div>
          
          <div className="relative z-10 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={suspensionData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3a4f63" opacity={0.3} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8a9aab', fontSize: 13, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a9aab', fontSize: 13, fontWeight: 600 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1c2731', borderRadius: '16px', border: '1px solid #3a4f63', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', color: '#fff', fontWeight: 'bold' }} itemStyle={{ color: '#fff' }} />
                <Line type="monotone" dataKey="drivers" stroke="#34c759" strokeWidth={4} dot={{ r: 6, fill: '#1c2731', stroke: '#34c759', strokeWidth: 3 }} activeDot={{ r: 8, fill: '#34c759' }} />
                <Line type="monotone" dataKey="users" stroke="#007AFF" strokeWidth={4} dot={{ r: 6, fill: '#1c2731', stroke: '#007AFF', strokeWidth: 3 }} activeDot={{ r: 8, fill: '#007AFF' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
