import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { apiRequest } from '../services/api'

export default function RiderRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const goBack = () => {
    navigate('/')
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password) return setMessage('Complete all registration fields.')
    try {
      setBusy(true)
      setMessage('')
      await apiRequest('/api/auth/user/register', {
        method: 'POST',
        body: { full_name: form.name, name: form.name, email: form.email, phone: form.phone, password: form.password },
      })
      navigate(`/user/login?identifier=${encodeURIComponent(form.email)}`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout title="User Register" subtitle="Create user account with your profile details.">
      <section className="grid min-h-[calc(100vh-270px)] grid-cols-1 overflow-hidden rounded-3xl border border-[#d9e3ec] bg-white shadow-[0_14px_30px_rgba(14,47,74,0.08)] lg:grid-cols-2">
        <form onSubmit={submit} className="flex flex-col justify-center p-6 md:p-10">
          <button type="button" onClick={goBack} className="mb-4 inline-flex w-fit items-center gap-1 rounded-md border border-[#c9dae8] bg-[#f7fbff] px-3 py-1.5 text-xs font-semibold text-[#446278] transition-colors hover:border-[#9cc9e5] hover:text-[#2d5b78]">
            ← Back
          </button>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#688092]">User Onboarding</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1b2a36]">Create your user account</h2>
          <p className="mt-2 text-sm text-[#607282]">Register in seconds to book rides, track trips, and manage payments securely.</p>
          <div className="mt-6 space-y-4">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#1092ce]" placeholder="Full name" />
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#1092ce]" placeholder="Email" />
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#1092ce]" placeholder="Phone" />
            <input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} type="password" className="w-full rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#1092ce]" placeholder="Password" />
          </div>
          {message ? <p className="mt-3 text-sm text-[#b04545]">{message}</p> : null}
          <button disabled={busy} className="mt-4 w-full rounded-md bg-[#1092ce] py-2.5 font-semibold text-white shadow-[0_10px_18px_rgba(16,146,206,0.28)] transition-colors hover:bg-[#0d80b4] disabled:opacity-70">{busy ? 'Creating account...' : 'Register'}</button>
          <p className="mt-4 text-sm text-[#607282]">Already have an account? <Link className="font-semibold text-[#0f7db4]" to="/user/login">Sign in</Link></p>
        </form>

        <aside className="relative overflow-hidden bg-gradient-to-br from-[#0f7db4] via-[#0f6fa0] to-[#0a567c] p-6 text-white md:p-10">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#bde7ff]">Verified Safety Layers</p>
          <h3 className="mt-2 text-3xl font-bold">Ride with confidence from day one</h3>
          <p className="mt-3 max-w-md text-sm text-[#e2f4ff]">
            Transitely safeguards every trip with verified driver profiles, route intelligence, and secure support channels.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-[#e8f7ff]">
            <li>Identity checks before activation</li>
            <li>SOS and emergency callback support</li>
            <li>Encrypted trip and payment records</li>
          </ul>
          <svg viewBox="0 0 420 260" className="mt-8 w-full max-w-[420px]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="38" y="32" width="344" height="206" rx="30" fill="#0B4E70" />
            <circle cx="210" cy="90" r="36" fill="#A9E5FF" />
            <path d="M150 184C150 150 176 130 210 130C244 130 270 150 270 184V194H150V184Z" fill="#A9E5FF" />
            <rect x="76" y="52" width="52" height="16" rx="8" fill="#D8F3FF" />
            <rect x="292" y="52" width="52" height="16" rx="8" fill="#D8F3FF" />
            <path d="M210 20L222 44H248L227 59L235 84L210 68L185 84L193 59L172 44H198L210 20Z" fill="#D8F3FF" />
          </svg>
        </aside>
      </section>
    </Layout>
  )
}
