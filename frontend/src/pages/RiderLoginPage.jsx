import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { TOKEN_KEY } from '../constants/auth'
import { apiRequest } from '../services/api'

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
      })
      localStorage.setItem(TOKEN_KEY, data.token)
      navigate('/rider/app')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout title="Rider Login" subtitle="Welcome back to Transitely rider portal.">
      <section className="grid min-h-[calc(100vh-270px)] grid-cols-1 overflow-hidden rounded-3xl border border-[#d9e3ec] bg-white shadow-[0_14px_30px_rgba(14,47,74,0.08)] lg:grid-cols-2">
        <form onSubmit={submit} className="flex flex-col justify-center p-6 md:p-10">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#688092]">Secure Rider Access</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1b2a36]">Sign in to your account</h2>
          <p className="mt-2 text-sm text-[#607282]">Manage rides, payments, notifications, and live trip status in one place.</p>
          <div className="mt-6 space-y-4">
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#1092ce]" placeholder="Email or phone" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#1092ce]" placeholder="Password" />
          </div>
          {message ? <p className="mt-3 text-sm text-[#b04545]">{message}</p> : null}
          <button disabled={busy} className="mt-4 w-full rounded-md bg-[#1092ce] py-2.5 font-semibold text-white shadow-[0_10px_18px_rgba(16,146,206,0.28)] transition-colors hover:bg-[#0d80b4] disabled:opacity-70">{busy ? 'Signing in...' : 'Login'}</button>
          <p className="mt-4 text-sm text-[#607282]">No account? <Link className="font-semibold text-[#0f7db4]" to="/rider/register">Register</Link></p>
        </form>

        <aside className="relative overflow-hidden bg-gradient-to-br from-[#0f7db4] via-[#0f6fa0] to-[#0a567c] p-6 text-white md:p-10">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#bde7ff]">Safe Mobility</p>
          <h3 className="mt-2 text-3xl font-bold">Your rides are protected end-to-end</h3>
          <p className="mt-3 max-w-md text-sm text-[#e2f4ff]">
            Live tracking, verified drivers, SOS escalation, and secure trip records keep every journey reliable.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-[#e8f7ff]">
            <li>Real-time trip monitoring</li>
            <li>Driver verification and audit trail</li>
            <li>24/7 support operations</li>
          </ul>
          <svg viewBox="0 0 420 260" className="mt-8 w-full max-w-[420px]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="120" width="360" height="110" rx="24" fill="#0B4E70" />
            <rect x="58" y="86" width="285" height="80" rx="20" fill="#0E6FA0" />
            <circle cx="115" cy="212" r="22" fill="#A2E0FF" />
            <circle cx="300" cy="212" r="22" fill="#A2E0FF" />
            <rect x="170" y="64" width="68" height="28" rx="8" fill="#BCEAFF" />
            <path d="M95 165H322" stroke="#D8F3FF" strokeWidth="6" strokeLinecap="round" />
            <path d="M155 42C169 28 184 22 208 22C232 22 247 28 261 42" stroke="#D8F3FF" strokeWidth="8" strokeLinecap="round" />
            <circle cx="208" cy="42" r="12" fill="#D8F3FF" />
          </svg>
        </aside>
      </section>
    </Layout>
  )
}
