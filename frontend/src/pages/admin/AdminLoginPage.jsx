import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ADMIN_TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'
import { ArrowLeft, ShieldCheck, Activity, Cpu, Network, Lock, Navigation } from 'lucide-react'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!phone || !password) return setMessage('Enter your phone and password.')
    try {
      setBusy(true)
      setMessage('')
      const data = await apiRequest('/api/auth/admin/login', {
        method: 'POST',
        body: { phone, password },
      })
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      navigate('/admin/dashboard')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1015] selection:bg-[#007AFF]/30 selection:text-white p-4 sm:p-8">
      
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute left-1/4 top-1/4 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#007AFF]/10 blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 h-[600px] w-[600px] translate-x-1/2 translate-y-1/2 rounded-full bg-[#5856d6]/10 blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl overflow-hidden rounded-[3rem] bg-[#141d26] shadow-[0_20px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/10 lg:flex lg:h-[800px]">
        
        {/* Left Side: System Metrics Area */}
        <aside className="relative hidden w-full flex-col justify-between overflow-hidden bg-[#0f151c] p-12 lg:flex lg:w-[45%]">
          
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#007AFF] text-xl font-black text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)] ring-1 ring-white/20">T</div>
              <span className="text-xl font-black tracking-tight text-white">Transitely Admin</span>
            </div>
          </div>

          <div className="relative z-10 mt-20 flex-1">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#007AFF]/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#4da3ff] ring-1 ring-[#007AFF]/50">
              <Activity size={14} className="animate-pulse" /> Platform Operations
            </div>
            <h1 className="text-[3.5rem] font-black leading-[1.05] tracking-tighter text-white">
              Mission<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4da3ff] to-[#007AFF]">Control.</span>
            </h1>
            <p className="mt-6 max-w-md text-[17px] font-medium leading-relaxed text-[#8a9aab]">
              Secure portal for monitoring platform vitals, managing fleet resources, and overseeing the national transit network.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-4">
              {[
                { icon: <Network size={20} className="text-[#007AFF]" />, val: '99.9%', label: 'Uptime SLA' },
                { icon: <Cpu size={20} className="text-[#34c759]" />, val: '< 30ms', label: 'API Latency' },
                { icon: <Activity size={20} className="text-[#ff9500]" />, val: '84K+', label: 'Daily Trips' },
                { icon: <ShieldCheck size={20} className="text-[#5856d6]" />, val: 'A+', label: 'Security Grade' }
              ].map((f, i) => (
                <div key={i} className="group flex flex-col gap-3 rounded-[1.5rem] bg-white/5 p-5 ring-1 ring-white/10 backdrop-blur-md transition-all hover:bg-white/10">
                  <div className="inline-flex rounded-xl bg-white/5 p-3 ring-1 ring-white/10">{f.icon}</div>
                  <div>
                    <h3 className="text-2xl font-black text-white">{f.val}</h3>
                    <p className="mt-1 text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">{f.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Login Form */}
        <div className="relative flex w-full flex-col justify-center bg-[#141d26] p-8 sm:p-12 lg:w-[55%] lg:p-20">
          
          <Link to="/" className="group absolute right-8 top-8 flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-[13px] font-bold text-[#8a9aab] ring-1 ring-white/10 transition-all hover:bg-white/10 hover:text-white">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Public Site
          </Link>

          <div className="mx-auto w-full max-w-md">
            
            <div className="lg:hidden mb-12 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#007AFF] text-xl font-black text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)]">T</div>
              <span className="text-2xl font-black tracking-tight text-white">Transitely Admin</span>
            </div>

            <div className="mb-10 text-left">
              <div className="mb-6 inline-flex rounded-2xl bg-white/5 p-4 text-white ring-1 ring-white/10">
                <Lock size={32} />
              </div>
              <h2 className="text-[2.5rem] font-black tracking-tighter text-white">Restricted Access</h2>
              <p className="mt-2 text-[15px] font-medium text-[#8a9aab]">Enter credentials to authenticate session.</p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">
                    Admin ID (Phone Number)
                  </label>
                  <input 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    className="w-full rounded-[1.2rem] bg-white/5 px-5 py-4 text-[15px] font-bold text-white shadow-sm ring-1 ring-white/10 transition-all placeholder:font-medium placeholder:text-[#607282] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#007AFF]" 
                    placeholder="Enter assigned number" 
                  />
                </div>
                
                <div>
                  <label className="mb-2 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">
                    <span>Clearance Key (Password)</span>
                  </label>
                  <input 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    type="password" 
                    className="w-full rounded-[1.2rem] bg-white/5 px-5 py-4 text-[15px] font-bold text-white shadow-sm ring-1 ring-white/10 transition-all placeholder:font-medium placeholder:text-[#607282] focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#007AFF]" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              {message && (
                <div className="animate-in fade-in rounded-[1rem] bg-red-500/10 p-4 ring-1 ring-red-500/30">
                  <p className="text-[13px] font-bold text-[#ff453a]">{message}</p>
                </div>
              )}

              <button 
                disabled={busy} 
                className="group mt-8 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-[#007AFF] py-5 text-[16px] font-black text-white shadow-[0_8px_25px_rgba(0,122,255,0.4)] transition-all hover:bg-[#0062CC] hover:shadow-[0_15px_35px_rgba(0,122,255,0.5)] active:scale-95 disabled:opacity-50"
              >
                {busy ? 'Verifying...' : 'Initialize Session'} <Navigation size={18} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
            
          </div>
        </div>
      </div>
    </main>
  )
}
