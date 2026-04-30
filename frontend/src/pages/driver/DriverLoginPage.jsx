import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { DRIVER_TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'
import { Banknote, BarChart3, ShieldCheck, Star, ArrowLeft, Navigation, Car } from 'lucide-react'

export default function DriverLoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!identifier || !password) return setMessage('Enter your email/phone and password.')
    try {
      setBusy(true)
      setMessage('')
      const data = await apiRequest('/api/auth/driver/login', {
        method: 'POST',
        body: { identifier, password },
      })
      localStorage.setItem(DRIVER_TOKEN_KEY, data.token)
      navigate('/driver/dashboard')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf3f9] selection:bg-[#007AFF]/20 selection:text-[#007AFF] p-4 sm:p-8">
      <div className="relative w-full max-w-7xl overflow-hidden rounded-[3rem] bg-white shadow-[0_20px_80px_rgba(14,47,74,0.08)] ring-1 ring-[#d9e3ec] lg:flex lg:h-[800px]">
        
        {/* Left Side: Animated Brand Area */}
        <aside className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#1c2731] p-12 lg:flex lg:w-[45%]">
          {/* Immersive Animated Background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#007AFF]/30 blur-[100px]"></div>
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#007AFF]/10 blur-[100px]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#007AFF] to-[#0062CC] text-xl font-black text-white shadow-[0_8px_20px_rgba(0,122,255,0.4)] ring-1 ring-white/20">T</div>
              <span className="text-xl font-black tracking-tight text-white">Transitely</span>
            </div>
          </div>

          <div className="relative z-10 mt-20 flex-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-200 ring-1 ring-white/20 backdrop-blur-md">
              <Car size={14} /> Fleet Command
            </div>
            <h1 className="text-[3.5rem] font-black leading-[1.05] tracking-tighter text-white">
              Drive Smart,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#007AFF]">Earn More.</span>
            </h1>
            <p className="mt-6 max-w-md text-[17px] font-medium leading-relaxed text-[#a0b0c0]">
              Join thousands of drivers earning a reliable income with flexible hours, powerful tools, and full backend support.
            </p>

            <div className="mt-12 space-y-4">
              {[
                { icon: <Banknote size={20} className="text-[#007AFF]" />, title: 'Competitive Rates', desc: 'Industry-leading per-km payouts.' },
                { icon: <BarChart3 size={20} className="text-[#007AFF]" />, title: 'Financial Dashboard', desc: 'Track your daily and weekly earnings.' },
                { icon: <ShieldCheck size={20} className="text-[#007AFF]" />, title: 'Full Insurance', desc: 'Coverage that protects you on the road.' }
              ].map((f, i) => (
                <div key={i} className="group flex items-start gap-4 rounded-[1.5rem] bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/10 hover:ring-white/20">
                  <div className="rounded-xl bg-white/10 p-3 ring-1 ring-white/20">{f.icon}</div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white group-hover:text-blue-100">{f.title}</h3>
                    <p className="mt-1 text-[13px] font-medium text-[#8a9aab]">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Login Form */}
        <div className="flex w-full flex-col justify-center bg-white p-8 sm:p-12 lg:w-[55%] lg:p-20">
          
          <Link to="/" className="group absolute right-8 top-8 flex items-center gap-2 rounded-full bg-[#f8fafc] px-4 py-2 text-[13px] font-bold text-[#607282] ring-1 ring-[#d9e3ec] transition-all hover:bg-[#007AFF] hover:text-white hover:shadow-sm">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Home
          </Link>

          <div className="mx-auto w-full max-w-md">
            
            <div className="lg:hidden mb-12 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#007AFF] to-[#0062CC] text-xl font-black text-white shadow-md">T</div>
              <span className="text-2xl font-black tracking-tight text-[#1c2731]">Transitely</span>
            </div>

            <div className="mb-10 text-left">
              <h2 className="text-[2.5rem] font-black tracking-tighter text-[#1c2731]">Driver Access</h2>
              <p className="mt-2 text-[15px] font-medium text-[#607282]">Sign in to access your fleet dashboard.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              
              <div className="space-y-5">
                <div>
                  <label className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">
                    <span>Email or Phone Number</span>
                  </label>
                  <input 
                    value={identifier} 
                    onChange={(e) => setIdentifier(e.target.value)} 
                    className="w-full rounded-[1.2rem] bg-[#f8fafc] px-5 py-4 text-[15px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all placeholder:font-medium placeholder:text-[#a0b0c0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" 
                    placeholder="e.g. driver@example.com" 
                  />
                </div>
                
                <div>
                  <label className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">
                    <span>Password</span>
                    <a href="#" className="text-[#007AFF] hover:underline">Reset?</a>
                  </label>
                  <input 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    type="password" 
                    className="w-full rounded-[1.2rem] bg-[#f8fafc] px-5 py-4 text-[15px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all placeholder:text-[#a0b0c0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              {message && (
                <div className="animate-in fade-in rounded-[1rem] bg-red-50 p-4 ring-1 ring-red-500/20">
                  <p className="text-[13px] font-bold text-[#ff3b30]">{message}</p>
                </div>
              )}

              <button 
                disabled={busy} 
                className="group mt-4 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-[#007AFF] to-[#0062CC] py-5 text-[16px] font-black text-white shadow-[0_8px_25px_rgba(0,122,255,0.35)] transition-all hover:shadow-[0_15px_35px_rgba(0,122,255,0.45)] active:scale-95 disabled:opacity-60 disabled:hover:shadow-[0_8px_25px_rgba(0,122,255,0.35)]"
              >
                {busy ? 'Connecting...' : 'Login to Dashboard'} <Navigation size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[15px] font-medium text-[#607282]">
                Want to join the fleet?{' '}
                <Link className="font-bold text-[#007AFF] transition-colors hover:text-[#0062CC]" to="/driver/register">
                  Apply Now
                </Link>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  )
}
