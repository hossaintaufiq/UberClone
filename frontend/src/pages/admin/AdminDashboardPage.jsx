import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import AdminLayout from '../../components/AdminLayout'
import { Users, Car, Map, AlertTriangle, Banknote, Landmark, Ticket, BarChart3, TrendingUp, Navigation, ArrowRight } from 'lucide-react'
import { apiRequest } from '../../services/api'

const COLORS = ['#007AFF', '#34c759', '#ff9500', '#ff3b30', '#5856d6', '#af52de']

const mockRevenue = [
  { day: 'Sat', revenue: 128000 },
  { day: 'Sun', revenue: 142000 },
  { day: 'Mon', revenue: 156000 },
  { day: 'Tue', revenue: 134000 },
  { day: 'Wed', revenue: 167000 },
  { day: 'Thu', revenue: 189000 },
  { day: 'Fri', revenue: 175000 },
]

const mockSectors = [
  { name: 'Dhaka North', value: 38 },
  { name: 'Dhaka South', value: 26 },
  { name: 'Chattogram', value: 18 },
  { name: 'Sylhet', value: 10 },
  { name: 'Others', value: 8 },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({ riders: 0, drivers: 0, rides: 0, complaints: 0 })
  const [revenue, setRevenue] = useState({ total_revenue: 0, total_payments: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const [dash, rev] = await Promise.all([
          apiRequest('/api/admin/dashboard'),
          apiRequest('/api/admin/revenue'),
        ])
        setStats(dash.data || {})
        setRevenue(rev.data || {})
      } catch { /* use defaults */ }
    }
    load()
  }, [])

  const cards = [
    { label: 'Total Users', value: stats.riders, icon: <Users size={24} />, bg: 'from-blue-50 to-white', color: 'text-[#007AFF]', iconBg: 'bg-[#007AFF]/10' },
    { label: 'Total Drivers', value: stats.drivers, icon: <Car size={24} />, bg: 'from-green-50 to-white', color: 'text-[#34c759]', iconBg: 'bg-[#34c759]/10' },
    { label: 'Total Rides', value: stats.rides, icon: <Map size={24} />, bg: 'from-orange-50 to-white', color: 'text-[#ff9500]', iconBg: 'bg-[#ff9500]/10' },
    { label: 'Complaints', value: stats.complaints, icon: <AlertTriangle size={24} />, bg: 'from-red-50 to-white', color: 'text-[#ff3b30]', iconBg: 'bg-[#ff3b30]/10' },
  ]

  const totalRev = revenue.total_revenue || 0
  const commision = Math.round(totalRev * 0.05)

  return (
    <AdminLayout title="System Dashboard">
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
        
        {/* Welcome & Revenue Overview */}
        <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
          
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#1c2731] p-8 shadow-[0_15px_40px_rgba(28,39,49,0.2)] sm:p-10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#007AFF]/30 blur-[80px]"></div>
            
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-200 ring-1 ring-white/20 backdrop-blur-md">
                  <TrendingUp size={14} /> Live Metrics
                </div>
                <h2 className="text-3xl font-black text-white sm:text-4xl">System Control Center</h2>
                <p className="mt-2 text-[15px] font-medium text-[#a0b0c0]">Monitor real-time network performance, revenue streams, and active users across the platform.</p>
              </div>
              
              <div className="mt-8 flex flex-col gap-6 sm:flex-row">
                <div className="rounded-[1.5rem] bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-md sm:flex-1">
                  <p className="text-[12px] font-extrabold uppercase tracking-widest text-blue-200">Gross Revenue (BDT)</p>
                  <p className="mt-1 text-3xl font-black text-white">৳{totalRev.toLocaleString()}</p>
                </div>
                <div className="rounded-[1.5rem] bg-gradient-to-tr from-[#007AFF] to-[#0062CC] p-5 shadow-lg sm:flex-1">
                  <p className="text-[12px] font-extrabold uppercase tracking-widest text-blue-200">Net Commission (5%)</p>
                  <p className="mt-1 text-3xl font-black text-white">৳{commision.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {cards.map((c) => (
              <div key={c.label} className={`group relative overflow-hidden rounded-[2rem] bg-gradient-to-b ${c.bg} p-6 shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-md`}>
                <div className={`mb-3 inline-flex rounded-[1.2rem] ${c.iconBg} p-3 ${c.color} transition-transform group-hover:scale-110`}>
                  {c.icon}
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tighter text-[#1c2731]">{c.value}</p>
                  <p className="mt-0.5 text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">{c.label}</p>
                </div>
              </div>
            ))}
          </div>
          
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec]">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-xl font-black text-[#1c2731]">Revenue Trajectory</h3>
                <p className="mt-1 text-[13px] font-medium text-[#8a9aab]">Platform earnings over the last 7 days</p>
              </div>
              <div className="flex gap-2 rounded-full bg-[#f8fafc] p-1 ring-1 ring-[#d9e3ec]">
                {['Daily', 'Weekly', 'Monthly'].map((p) => (
                  <button key={p} className={`rounded-full px-4 py-2 text-[12px] font-bold transition-all ${p === 'Weekly' ? 'bg-[#007AFF] text-white shadow-sm' : 'text-[#607282] hover:text-[#1c2731]'}`}>{p}</button>
                ))}
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockRevenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8eef4" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8a9aab', fontSize: 12, fontWeight: 700 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a9aab', fontSize: 12, fontWeight: 700 }} tickFormatter={(val) => `৳${val/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #d9e3ec', boxShadow: '0 8px 20px rgba(0,0,0,0.08)', padding: '12px' }}
                    itemStyle={{ color: '#007AFF', fontWeight: 900 }}
                    formatter={(v) => [`৳${v.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="url(#colorRev)" radius={[12, 12, 12, 12]} barSize={40} />
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#007AFF" stopOpacity={1} />
                      <stop offset="100%" stopColor="#0062CC" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec]">
            <h3 className="text-xl font-black text-[#1c2731]">Ride Density</h3>
            <p className="mt-1 text-[13px] font-medium text-[#8a9aab]">Active requests by sector</p>
            
            <div className="relative mt-6 h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={mockSectors} 
                    dataKey="value" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60}
                    outerRadius={85} 
                    paddingAngle={5}
                    stroke="none"
                  >
                    {mockSectors.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1rem', border: '1px solid #d9e3ec', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}
                    itemStyle={{ fontWeight: 900 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-[#1c2731]">100%</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a9aab]">Network</span>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {mockSectors.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5 rounded-full bg-[#f8fafc] px-3 py-1 ring-1 ring-[#d9e3ec]">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-[11px] font-bold text-[#607282]">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* Quick Operations Strip */}
        <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#1c2731]">Quick Operations</h3>
              <p className="mt-1 text-[13px] font-medium text-[#8a9aab]">Fast access to management tools</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { label: 'Manage Users', path: '/admin/riders', icon: Users, color: 'text-[#007AFF]', bg: 'bg-[#007AFF]/10', hover: 'hover:bg-[#007AFF] hover:text-white hover:ring-[#007AFF]' },
              { label: 'Fleet Management', path: '/admin/drivers', icon: Car, color: 'text-[#34c759]', bg: 'bg-[#34c759]/10', hover: 'hover:bg-[#34c759] hover:text-white hover:ring-[#34c759]' },
              { label: 'Promotions', path: '/admin/promocodes', icon: Ticket, color: 'text-[#ff9500]', bg: 'bg-[#ff9500]/10', hover: 'hover:bg-[#ff9500] hover:text-white hover:ring-[#ff9500]' },
              { label: 'Live Analytics', path: '/admin/analytics', icon: BarChart3, color: 'text-[#5856d6]', bg: 'bg-[#5856d6]/10', hover: 'hover:bg-[#5856d6] hover:text-white hover:ring-[#5856d6]' },
            ].map((a) => (
              <Link key={a.label} to={a.path} className={`group flex flex-col items-center justify-center gap-3 rounded-[1.5rem] p-6 text-center ring-1 ring-[#d9e3ec] transition-all ${a.bg} ${a.color} ${a.hover}`}>
                <a.icon size={28} className="transition-transform group-hover:scale-110" />
                <span className="text-[13px] font-bold text-[#1c2731] transition-colors group-hover:text-white">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}
