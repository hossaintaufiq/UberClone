import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { LayoutDashboard, Users, Car, Map, Wallet, Ticket, BarChart3, LogOut, Menu } from 'lucide-react'

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/riders', label: 'Manage Users', icon: Users },
  { path: '/admin/drivers', label: 'Manage Drivers', icon: Car },
  { path: '/admin/rides', label: 'Ride Monitor', icon: Map },
  { path: '/admin/payments', label: 'Payments & Fare', icon: Wallet },
  { path: '/admin/promocodes', label: 'Promo Codes', icon: Ticket },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function AdminLayout({ title, children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const logout = () => {
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-[#edf3f9]">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-[#d9e3ec] bg-white shadow-[4px_0_24px_rgba(14,47,74,0.06)] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 border-b border-[#e8eef4] px-5 py-5">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#007AFF] text-lg font-bold text-white shadow-[0_4px_12px_rgba(0,122,255,0.3)]">T</div>
          <div>
            <p className="text-base font-bold text-[#1c2731]">Transitely</p>
            <p className="text-[11px] font-medium text-[#8a9aab]">Admin Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#8a9aab]">Navigation</p>
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-all ${
                  active
                    ? 'bg-[#007AFF] text-white shadow-[0_4px_12px_rgba(0,122,255,0.25)]'
                    : 'text-[#4a5d6f] hover:bg-[#f0f5fa] hover:text-[#1c2731]'
                }`}
              >
                <span className="text-base"><item.icon size={18} /></span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[#e8eef4] p-4">
          <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] px-4 py-2.5 text-sm font-semibold text-[#64748b] transition-all hover:border-[#ff3b30] hover:bg-[#fff5f5] hover:text-[#ff3b30]">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#e8eef4] bg-white/90 px-4 py-3 backdrop-blur-md lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-[#d9e3ec] text-[#4a5d6f] lg:hidden">
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-bold text-[#1c2731] lg:text-xl">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full bg-[#f0f5fa] px-3 py-1.5 text-xs font-medium text-[#4a5d6f] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#34c759]"></span>
              System Online
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#007AFF] text-sm font-bold text-white">A</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
