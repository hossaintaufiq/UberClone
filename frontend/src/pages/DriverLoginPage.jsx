import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { DRIVER_TOKEN_KEY } from '../constants/auth'
import { apiRequest } from '../services/api'

export default function DriverLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState(new URLSearchParams(location.search).get('identifier') || '')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!identifier || !password) return setMessage('Enter email/phone and password.')
    try {
      setBusy(true)
      setMessage('')
      const data = await apiRequest('/api/auth/driver/login', {
        method: 'POST',
        body: { identifier, password },
      })
      localStorage.setItem(DRIVER_TOKEN_KEY, data.token)
      navigate('/driver/dashboard')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout title="Driver Login" subtitle="Access your operations dashboard.">
      <section className="mx-auto grid max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-[#d7e7f4] bg-white shadow-[0_14px_30px_rgba(14,47,74,0.08)] lg:grid-cols-2">
        <form onSubmit={submit} className="flex flex-col justify-center p-6 md:p-10">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#688092]">Driver Access</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1b2a36]">Sign in as driver</h2>
          <p className="mt-2 text-sm text-[#607282]">Track rides, earnings, and notifications from one panel.</p>
          <div className="mt-6 space-y-4">
            <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="w-full rounded-md border border-[#cfe2f0] bg-[#f3faff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#3aa7e8]" placeholder="Email or phone" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-md border border-[#cfe2f0] bg-[#f3faff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#3aa7e8]" placeholder="Password" />
          </div>
          {message ? <p className="mt-3 text-sm text-[#b04545]">{message}</p> : null}
          <button disabled={busy} className="mt-4 w-full rounded-md bg-[#36a7e6] py-2.5 font-semibold text-white shadow-[0_10px_18px_rgba(54,167,230,0.3)] transition-colors hover:bg-[#2898d9] disabled:opacity-70">{busy ? 'Signing in...' : 'Login'}</button>
          <p className="mt-3 text-sm text-[#607282]">
            No account? <Link className="font-semibold text-[#2f9edf]" to="/driver/register">Register as driver</Link>
          </p>
          <p className="mt-4 text-sm text-[#607282]">
            Admin? <Link className="font-semibold text-[#2f9edf]" to="/admin/login">Go to admin login</Link>
          </p>
        </form>
        <aside className="bg-gradient-to-br from-[#58b9ef] via-[#3aa7e8] to-[#238fcf] p-6 text-white md:p-10">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#ddf4ff]">Transitely</p>
          <h3 className="mt-2 text-3xl font-bold">Drive with live insights</h3>
          <p className="mt-3 text-sm text-[#ebf8ff]">See trips, earnings performance, and support updates in real time.</p>
        </aside>
      </section>
    </Layout>
  )
}
