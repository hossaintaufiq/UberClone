import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { DRIVER_TOKEN_KEY } from '../constants/auth'

import { Home, MapPin, Car, ClipboardList, Banknote, User, Menu } from 'lucide-react'

const navItems = [
  { path: '/driver/dashboard', label: 'Dashboard', icon: Home },
  { path: '/driver/incoming', label: 'Incoming Rides', icon: MapPin },
  { path: '/driver/trip', label: 'Current Trip', icon: Car },
  { path: '/driver/history', label: 'Ride History', icon: ClipboardList },
  { path: '/driver/payments', label: 'Earnings', icon: Banknote },
  { path: '/driver/profile', label: 'Profile', icon: User },
]

export default function DriverLayout({ title, children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const logout = () => {
    localStorage.removeItem(DRIVER_TOKEN_KEY)
    navigate('/driver/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#edf3f9]">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-[#e8eef4] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#34c759] text-sm font-bold text-white shadow-[0_4px_12px_rgba(52,199,89,0.3)]">T</div>
            <div>
              <p className="text-sm font-bold text-[#1c2731]">Transitely</p>
              <p className="text-[10px] font-medium text-[#8a9aab]">Driver Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={logout} className="rounded-lg border border-[#e2e8f0] px-3 py-1.5 text-xs font-semibold text-[#64748b] transition-all hover:border-[#ff3b30] hover:text-[#ff3b30]">
              Logout
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="grid h-9 w-9 place-items-center rounded-xl border border-[#d9e3ec] text-[#4a5d6f] md:hidden">
              <Menu size={20} />
            </button>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="mx-auto hidden max-w-5xl items-center gap-1 px-4 pb-2 md:flex">
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-all ${
                  active
                    ? 'bg-[#34c759] text-white shadow-[0_4px_12px_rgba(52,199,89,0.25)]'
                    : 'text-[#4a5d6f] hover:bg-[#f0f5fa]'
                }`}
              >
                <span className="text-sm"><item.icon size={16} /></span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Mobile Nav */}
        {menuOpen && (
          <nav className="border-t border-[#e8eef4] px-4 py-3 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const active = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium no-underline transition-all ${
                      active
                        ? 'bg-[#34c759] text-white'
                        : 'bg-[#f0f5fa] text-[#4a5d6f]'
                    }`}
                  >
                    <span><item.icon size={18} /></span>
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}
      </header>

      {/* Page Title */}
      <div className="mx-auto w-full max-w-5xl px-4 pt-5">
        <h1 className="text-xl font-bold text-[#1c2731] lg:text-2xl">{title}</h1>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4">
        {children}
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="sticky bottom-0 z-30 border-t border-[#e8eef4] bg-white/95 backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around py-2">
          {navItems.slice(0, 4).map((item) => {
            const active = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-medium no-underline transition-all ${
                  active ? 'text-[#34c759]' : 'text-[#8a9aab]'
                }`}
              >
                <span className="text-lg"><item.icon size={20} /></span>
                {item.label.split(' ')[0]}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
