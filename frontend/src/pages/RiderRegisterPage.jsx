import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'
import { Lock, AlertTriangle, ShieldCheck, Star, ArrowLeft, ChevronRight } from 'lucide-react'

export default function RiderRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password) return setMessage('Complete all registration fields.')
    try {
      setBusy(true)
      setMessage('')
      await apiRequest('/api/auth/rider/register', {
        method: 'POST',
        body: { full_name: form.name, name: form.name, email: form.email, phone: form.phone, password: form.password },
      })
      navigate(`/rider/login?identifier=${encodeURIComponent(form.email)}`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex h-screen items-center justify-center overflow-y-auto bg-gradient-to-br from-[#edf3f9] via-white to-[#e8f4fd] p-4 font-sans selection:bg-[#007AFF] selection:text-white">
      <div className="grid h-full w-full max-w-[1000px] overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 shadow-[0_24px_60px_rgba(14,47,74,0.08)] backdrop-blur-2xl lg:grid-cols-5">
        <form onSubmit={submit} className="flex h-full flex-col justify-start overflow-y-auto p-8 sm:p-10 lg:col-span-3">
          <Link to="/" className="mb-8 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/50 px-4 py-2 text-[13px] font-bold text-[#607282] no-underline shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:bg-white hover:text-[#1c2731] hover:shadow-md active:scale-95">
            <ArrowLeft size={14} /> Back to Home
          </Link>
          
          <div className="mb-8 flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#0062CC] to-[#007AFF] text-xl font-bold text-white shadow-[0_8px_20px_rgba(0,122,255,0.35)]">T</div>
            <div>
              <p className="text-xl font-extrabold tracking-tight text-[#1c2731]">Transitely</p>
              <p className="text-[13px] font-bold text-[#007AFF]">User Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#8a9aab]">User Onboarding</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#1c2731]">Create your account</h2>
            <p className="mt-3 text-[15px] leading-relaxed text-[#607282]">Register to book rides, track trips, and manage payments securely.</p>
          </div>

          <div className="space-y-4">
            <div className="group">
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab] transition-colors group-focus-within:text-[#007AFF]">Full Name</label>
              <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full rounded-2xl border-2 border-transparent bg-white/50 px-5 py-3.5 text-[15px] text-[#1c2731] placeholder-[#a0b0c0] shadow-sm ring-1 ring-[#d9e3ec] backdrop-blur-md transition-all focus:border-[#007AFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10" placeholder="e.g. John Doe" />
            </div>
            <div className="group">
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab] transition-colors group-focus-within:text-[#007AFF]">Email Address</label>
              <input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full rounded-2xl border-2 border-transparent bg-white/50 px-5 py-3.5 text-[15px] text-[#1c2731] placeholder-[#a0b0c0] shadow-sm ring-1 ring-[#d9e3ec] backdrop-blur-md transition-all focus:border-[#007AFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10" placeholder="rider@example.com" />
            </div>
            <div className="group">
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab] transition-colors group-focus-within:text-[#007AFF]">Phone Number</label>
              <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full rounded-2xl border-2 border-transparent bg-white/50 px-5 py-3.5 text-[15px] text-[#1c2731] placeholder-[#a0b0c0] shadow-sm ring-1 ring-[#d9e3ec] backdrop-blur-md transition-all focus:border-[#007AFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10" placeholder="01XXXXXXXXX" />
            </div>
            <div className="group">
              <label className="mb-1.5 block text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab] transition-colors group-focus-within:text-[#007AFF]">Password</label>
              <input value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} type="password" className="w-full rounded-2xl border-2 border-transparent bg-white/50 px-5 py-3.5 text-[15px] text-[#1c2731] placeholder-[#a0b0c0] shadow-sm ring-1 ring-[#d9e3ec] backdrop-blur-md transition-all focus:border-[#007AFF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#007AFF]/10" placeholder="Create a secure password" />
            </div>
          </div>

          {message && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#ff3b30]/10 p-4 text-[14px] text-[#ff3b30]">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="font-medium">{message}</p>
            </div>
          )}

          <button disabled={busy} className="mt-8 group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#007AFF] to-[#0062CC] py-4 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(0,122,255,0.25)] transition-all hover:shadow-[0_12px_25px_rgba(0,122,255,0.35)] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none">
            {busy ? 'Creating Account...' : 'Create Account'}
            {!busy && <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
          </button>

          <p className="mt-8 text-center text-[14px] font-medium text-[#607282]">
            Already have an account? <Link className="font-bold text-[#007AFF] no-underline transition-colors hover:text-[#0062CC]" to="/rider/login">Sign in here</Link>
          </p>
        </form>

        <aside className="relative hidden h-full flex-col justify-start overflow-hidden bg-gradient-to-br from-[#007AFF] via-[#0062CC] to-[#004bb5] p-8 text-white lg:col-span-2 lg:flex xl:p-10">
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/20 blur-[60px]"></div>
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/20 blur-[60px]"></div>
          
          <div className="relative z-10 mt-6">
            <div className="mb-6 inline-flex rounded-2xl bg-white/10 p-4 shadow-inner backdrop-blur-md">
              <ShieldCheck size={32} className="text-blue-100" />
            </div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-blue-200/80">Verified Safety</p>
            <h3 className="mt-3 text-3xl font-black leading-[1.15] tracking-tight">Ride with confidence<br/>from day one.</h3>
            <p className="mt-5 text-[15px] leading-relaxed text-blue-100/90">
              Transitely safeguards every trip with verified driver profiles, intelligent routing, and secure support channels.
            </p>
            
            <div className="mt-8 space-y-3">
              {[
                { icon: <Lock size={16} className="text-blue-100" />, text: 'Identity verification' },
                { icon: <AlertTriangle size={16} className="text-blue-100" />, text: 'SOS & emergency support' },
                { icon: <ShieldCheck size={16} className="text-blue-100" />, text: 'Encrypted trip records' },
                { icon: <Star size={16} className="text-blue-100" />, text: '5% cashback on repeat drivers' }
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3.5 text-[13px] font-medium shadow-sm backdrop-blur-md transition-transform hover:-translate-y-1">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">{f.icon}</div>
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
