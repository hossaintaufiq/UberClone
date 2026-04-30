import { useState } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from '../components/SiteFooter'
import { Car, CarFront, BarChart3, Map, MessageCircle, Banknote, ShieldCheck, Ticket, ChevronRight } from 'lucide-react'

const portals = [
  {
    title: 'User Portal',
    description: 'Book rides, track trips, chat with drivers, and manage payments securely.',
    links: [
      { label: 'Login', path: '/rider/login', primary: true },
      { label: 'Register', path: '/rider/register', primary: false },
    ],
  },
  {
    title: 'Driver Portal',
    description: 'Manage your rides, track earnings, upload documents, and go online.',
    links: [
      { label: 'Login', path: '/driver/login', primary: true },
      { label: 'Register', path: '/driver/register', primary: false },
    ],
  },
  {
    title: 'Admin Portal',
    description: 'Fleet management, rider/driver oversight, analytics, and revenue tracking.',
    links: [
      { label: 'Open Dashboard', path: '/admin/dashboard', primary: true },
    ],
  },
]

const features = [
  { icon: <Map size={28} />, title: 'Live Tracking', desc: 'Real-time GPS tracking for every trip' },
  { icon: <MessageCircle size={28} />, title: 'In-App Chat', desc: 'Chat with your driver or rider instantly' },
  { icon: <Banknote size={28} />, title: 'Fair Pricing', desc: 'Transparent per-km fare with promo support' },
  { icon: <ShieldCheck size={28} />, title: 'Safety First', desc: 'Verified drivers, SOS support, trip audit' },
  { icon: <BarChart3 size={28} />, title: 'Smart Analytics', desc: 'Revenue tracking, sector-wise insights' },
  { icon: <Ticket size={28} />, title: 'Promo Codes', desc: 'Create and manage discount promotions' },
]

const stats = [
  { label: 'Daily Trips', value: '84,200+' },
  { label: 'Active Drivers', value: '12,480' },
  { label: 'Service Zones', value: '146' },
  { label: 'Response Time', value: '<3 min' },
]

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#edf3f9] via-[#ffffff] to-[#e8f4fd] text-[#1c2731] font-sans selection:bg-[#007AFF] selection:text-white">
      {/* Header */}
      <header className="sticky top-4 z-50 px-4">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 rounded-full border border-white/60 bg-white/70 px-5 py-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:px-8 sm:py-4 transition-all duration-300 hover:bg-white/80 fade-up">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-[#0062CC] to-[#007AFF] text-lg font-bold text-white shadow-[0_4px_20px_rgba(0,122,255,0.4)]">T</div>
            <p className="text-xl font-extrabold tracking-tight text-[#1c2731]">Transitely</p>
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            <Link to="/rider/login" className="text-[15px] font-semibold text-[#607282] no-underline transition-all hover:text-[#007AFF] hover:-translate-y-0.5">User Login</Link>
            <Link to="/driver/login" className="text-[15px] font-semibold text-[#607282] no-underline transition-all hover:text-[#007AFF] hover:-translate-y-0.5">Driver Login</Link>
            <Link to="/admin/dashboard" className="glass-btn rounded-full bg-gradient-to-r from-[#007AFF] to-[#0062CC] px-7 py-3 text-[15px] font-bold text-white no-underline shadow-[0_8px_20px_rgba(0,122,255,0.25)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(0,122,255,0.4)] active:scale-95">Admin Portal</Link>
          </nav>

          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/50 bg-white/50 text-[#1c2731] shadow-sm backdrop-blur-md transition-active active:scale-95 md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="mx-auto mt-3 w-full max-w-7xl overflow-hidden rounded-[2rem] border border-white/60 bg-white/90 p-3 shadow-2xl backdrop-blur-2xl md:hidden animate-in slide-in-from-top-4 fade-in duration-300">
            <nav className="grid gap-2">
              <Link to="/rider/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-2xl bg-white/50 px-5 py-4 text-[15px] font-bold text-[#1c2731] no-underline backdrop-blur-md transition-active active:scale-95">User Login <ChevronRight className="ml-auto h-4 w-4 text-[#8a9aab]"/></Link>
              <Link to="/driver/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 rounded-2xl bg-white/50 px-5 py-4 text-[15px] font-bold text-[#1c2731] no-underline backdrop-blur-md transition-active active:scale-95">Driver Login <ChevronRight className="ml-auto h-4 w-4 text-[#8a9aab]"/></Link>
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#007AFF] to-[#0062CC] px-5 py-4 text-[15px] font-bold text-white no-underline shadow-[0_8px_20px_rgba(0,122,255,0.25)] transition-active active:scale-95">Admin Portal</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-5 md:py-32 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#007AFF]/10 blur-[100px] float-soft"></div>
        
        <div className="mb-6 inline-flex animate-fade-in-up rounded-full border border-blue-100 bg-blue-50/50 px-5 py-2 text-[13px] font-extrabold tracking-[0.15em] text-[#007AFF] shadow-sm backdrop-blur-md">
          SMART MOBILITY PLATFORM
        </div>
        <h1 className="mx-auto max-w-[800px] text-5xl font-extrabold leading-[1.1] tracking-tight text-[#1c2731] sm:text-6xl md:text-7xl lg:leading-[1.05]">
          Moving the Future of <span className="bg-gradient-to-r from-[#007AFF] to-[#00c6ff] bg-clip-text text-transparent drop-shadow-sm">Dhaka</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[600px] text-lg leading-relaxed text-[#607282] sm:text-xl">
          Experience the next generation of smart urban mobility. Book rides, manage fleets, and track everything in real-time.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/rider/register" className="glass-btn group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#007AFF] to-[#0062CC] px-9 py-4.5 text-[15px] font-bold text-white no-underline shadow-[0_8px_25px_rgba(0,122,255,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,122,255,0.4)] active:scale-95 sm:w-auto">
            Get Started <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/driver/register" className="flex w-full items-center justify-center rounded-full border-2 border-transparent bg-white px-9 py-4.5 text-[15px] font-bold text-[#1c2731] no-underline shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95 sm:w-auto">
            Become a Driver
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-5">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="interactive-card group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-500 hover:bg-white/80">
              <div className="absolute inset-0 bg-gradient-to-br from-[#007AFF]/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
              <p className="text-4xl font-black tracking-tight text-[#1c2731] transition-transform duration-500 group-hover:scale-105 group-hover:text-[#007AFF] sm:text-5xl">{s.value}</p>
              <p className="mt-3 text-[13px] font-bold uppercase tracking-[0.1em] text-[#8a9aab]">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portal Cards */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-5">
        <div className="mb-16 text-center">
          <p className="mb-4 text-[13px] font-extrabold uppercase tracking-[0.15em] text-[#007AFF]">Choose Your Portal</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1c2731] sm:text-5xl">Three Portals, One Platform</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {portals.map((p) => (
            <article key={p.title} className="interactive-card group flex flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-500 hover:bg-white/90">
              <div className="flex-1 p-8 sm:p-10">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#007AFF] shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:bg-[#007AFF] group-hover:text-white">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight text-[#1c2731]">{p.title}</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-[#607282]">{p.description}</p>
              </div>
              <div className="flex flex-col gap-3 bg-[#f8fafc]/50 p-6 backdrop-blur-md sm:flex-row sm:p-8">
                {p.links.map((l) => (
                  <Link
                    key={l.path}
                    to={l.path}
                    className={`flex-1 rounded-2xl py-3.5 text-center text-[15px] font-bold no-underline transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
                      l.primary 
                        ? 'bg-gradient-to-r from-[#1c2731] to-[#2c3e50] text-white shadow-lg hover:shadow-xl group-hover:from-[#007AFF] group-hover:to-[#0062CC]' 
                        : 'border border-[#d9e3ec] bg-white text-[#1c2731] shadow-sm hover:border-[#b0c4d9] hover:bg-gray-50'
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-5">
        <div className="mb-16 text-center">
          <p className="mb-4 text-[13px] font-extrabold uppercase tracking-[0.15em] text-[#007AFF]">Platform Features</p>
          <h2 className="text-4xl font-extrabold tracking-tight text-[#1c2731] sm:text-5xl">Everything You Need</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <article key={f.title} className="interactive-card group relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl transition-all duration-500 hover:bg-white">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-[#007AFF]/5 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"></div>
              <div className="mb-6 inline-flex rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4 text-[#007AFF] shadow-sm transition-transform duration-500 group-hover:scale-110 group-hover:shadow-md">{f.icon}</div>
              <h3 className="text-xl font-extrabold tracking-tight text-[#1c2731]">{f.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#607282]">{f.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-5">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-[#007AFF] via-[#0062CC] to-[#004bb5] p-12 text-center text-white shadow-[0_24px_60px_rgba(0,122,255,0.3)] md:p-24">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/20 blur-[80px]"></div>
          <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/20 blur-[80px]"></div>
          
          <h2 className="relative z-10 text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">Ready to Get Started?</h2>
          <p className="relative z-10 mx-auto mt-6 max-w-2xl text-lg text-blue-100/90 sm:text-xl">
            Join thousands of riders and drivers powering Dhaka's smartest transit network.
          </p>
          <div className="relative z-10 mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/rider/register" className="flex w-full items-center justify-center rounded-full bg-white px-10 py-4.5 text-[15px] font-bold text-[#007AFF] no-underline shadow-[0_8px_25px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.2)] active:scale-95 sm:w-auto">Sign Up as User</Link>
            <Link to="/driver/register" className="flex w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-10 py-4.5 text-[15px] font-bold text-white no-underline backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/20 hover:shadow-lg active:scale-95 sm:w-auto">Join as Driver</Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

