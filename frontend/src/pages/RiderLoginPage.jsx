import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { TOKEN_KEY } from '../constants/auth'
import { apiRequest } from '../services/api'
import { Map, CheckCircle2, Phone, Banknote, ArrowLeft, Navigation, ShieldCheck } from 'lucide-react'

export default function RiderLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState(new URLSearchParams(location.search).get('identifier') || '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!identifier || !password) return setMessage('Enter your email/phone and password.')
    try {
      setBusy(true)
      setMessage('')
      const data = await apiRequest('/api/auth/rider/login', {
        method: 'POST',
        body: { identifier, password },
        skipAuth: true,
      })
      localStorage.setItem(TOKEN_KEY, data.token)
      navigate('/rider/app')
    } catch (error) {
      if (error.status === 401) {
        setMessage('Invalid email/phone or password. Please try again.')
      } else {
        setMessage(error.message)
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex h-screen items-center justify-center overflow-y-auto bg-[#edf3f9] selection:bg-[#007AFF]/20 selection:text-[#007AFF] p-4 sm:p-8">
      <div className="fade-up relative h-full w-full max-w-7xl overflow-hidden rounded-[3rem] bg-white shadow-[0_20px_80px_rgba(14,47,74,0.08)] ring-1 ring-[#d9e3ec] lg:flex">
        
        {/* Left Side: Animated Brand Area */}
        <aside className="relative hidden h-full w-full flex-col overflow-hidden bg-[#1c2731] p-8 lg:flex lg:w-[45%] xl:p-10">
          {/* Immersive Animated Background */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#007AFF]/20 blur-[100px]"></div>
          <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-[#34c759]/10 blur-[100px]"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="pulse-glow grid h-12 w-12 place-items-center rounded-2xl bg-[#007AFF] text-xl font-black text-white shadow-[0_8px_20px_rgba(0,122,255,0.4)] ring-1 ring-white/20">T</div>
              <span className="text-xl font-black tracking-tight text-white">Transitely</span>
            </div>
          </div>

          <div className="relative z-10 mt-8 flex-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-blue-200 ring-1 ring-white/20 backdrop-blur-md">
              <ShieldCheck size={14} /> Global Access Network
            </div>
            <h1 className="text-[3rem] font-black leading-[1.05] tracking-tighter text-white xl:text-[3.5rem]">
              Your World,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-[#007AFF]">Moving Seamlessly.</span>
            </h1>
            <p className="mt-4 max-w-md text-[16px] font-medium leading-relaxed text-[#a0b0c0]">
              Access the most reliable network of verified drivers. Real-time tracking, upfront pricing, and absolute security.
            </p>

            <div className="mt-8 space-y-3">
              {[
                { icon: <Map size={20} className="text-[#007AFF]" />, title: 'Real-time GPS Tracking', desc: 'Share your trip live with loved ones.' },
                { icon: <CheckCircle2 size={20} className="text-[#34c759]" />, title: 'Verified Captains', desc: 'Every driver passes strict background checks.' },
                { icon: <Banknote size={20} className="text-[#ff9500]" />, title: 'Upfront Pricing', desc: 'No hidden fees. Pay exactly what you see.' }
              ].map((f, i) => (
                <div key={i} className="interactive-card group flex items-start gap-3 rounded-[1.3rem] bg-white/5 p-3.5 ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/10 hover:ring-white/20">
                  <div className="rounded-xl bg-white/10 p-2.5 ring-1 ring-white/20">{f.icon}</div>
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
        <div className="relative flex w-full flex-col justify-center bg-white p-8 pt-20 sm:p-12 sm:pt-24 lg:w-[55%] lg:p-20 lg:pt-20">
          
          <Link to="/" className="group absolute left-8 top-8 inline-flex w-fit items-center gap-2 rounded-full bg-[#f8fafc] px-4 py-2 text-[13px] font-bold text-[#607282] ring-1 ring-[#d9e3ec] transition-all hover:bg-white hover:text-[#1c2731] hover:shadow-sm sm:left-12 lg:left-auto lg:right-8">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Return
          </Link>

          <div className="mx-auto w-full max-w-md">
            
            <div className="lg:hidden mb-12 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#007AFF] to-[#0062CC] text-xl font-black text-white shadow-md">T</div>
              <span className="text-2xl font-black tracking-tight text-[#1c2731]">Transitely</span>
            </div>

            <div className="mb-10 text-left">
              <h2 className="text-[2.5rem] font-black tracking-tighter text-[#1c2731]">Welcome Back</h2>
              <p className="mt-2 text-[15px] font-medium text-[#607282]">Sign in to request your next ride.</p>
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
                    placeholder="e.g. rider@example.com" 
                  />
                </div>
                
                <div>
                  <label className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">
                    <span>Password</span>
                    <a href="#" className="text-[#007AFF] hover:underline">Forgot?</a>
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
                className="glass-btn group mt-4 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-[#007AFF] to-[#0062CC] py-5 text-[16px] font-black text-white shadow-[0_8px_25px_rgba(0,122,255,0.35)] transition-all hover:shadow-[0_15px_35px_rgba(0,122,255,0.45)] active:scale-95 disabled:opacity-60 disabled:hover:shadow-[0_8px_25px_rgba(0,122,255,0.35)]"
              >
                {busy ? 'Authenticating...' : 'Sign In Securely'} <Navigation size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-12 text-center">
              <p className="text-[15px] font-medium text-[#607282]">
                New to Transitely?{' '}
                <Link className="font-bold text-[#007AFF] transition-colors hover:text-[#0062CC]" to="/rider/register">
                  Create an account
                </Link>
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </main>
  )
}
