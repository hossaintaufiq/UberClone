import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { ADMIN_TOKEN_KEY } from '../constants/auth'
import { apiRequest } from '../services/api'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    if (!phone || !password) return setMessage('Enter phone and password.')
    try {
      setBusy(true)
      setMessage('')
      const data = await apiRequest('/api/auth/admin/login', {
        method: 'POST',
        body: { phone, password },
      })
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      navigate('/admin/dashboard')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout title="Admin Login" subtitle="Access the administrative command center.">
      <section className="mx-auto grid max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-[#d7e7f4] bg-white shadow-[0_14px_30px_rgba(14,47,74,0.08)] lg:grid-cols-2">
        <form onSubmit={submit} className="flex flex-col justify-center p-6 md:p-10">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#688092]">Admin Access</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1b2a36]">Sign in as admin</h2>
          <p className="mt-2 text-sm text-[#607282]">Use your admin phone and password to continue.</p>
          <div className="mt-6 space-y-4">
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full rounded-md border border-[#cfe2f0] bg-[#f3faff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#3aa7e8]" placeholder="Admin phone" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="w-full rounded-md border border-[#cfe2f0] bg-[#f3faff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#3aa7e8]" placeholder="Password" />
          </div>
          {message ? <p className="mt-3 text-sm text-[#b04545]">{message}</p> : null}
          <button disabled={busy} className="mt-4 w-full rounded-md bg-[#36a7e6] py-2.5 font-semibold text-white shadow-[0_10px_18px_rgba(54,167,230,0.3)] transition-colors hover:bg-[#2898d9] disabled:opacity-70">{busy ? 'Signing in...' : 'Login'}</button>
          <p className="mt-4 text-sm text-[#607282]">
            Driver? <Link className="font-semibold text-[#2f9edf]" to="/driver/login">Go to driver login</Link>
          </p>
        </form>
        <aside className="bg-gradient-to-br from-[#58b9ef] via-[#3aa7e8] to-[#238fcf] p-6 text-white md:p-10">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#ddf4ff]">Transitely</p>
          <h3 className="mt-2 text-3xl font-bold">Operations in one place</h3>
          <p className="mt-3 text-sm text-[#ebf8ff]">Live monitoring for riders, drivers, rides, complaints, and revenue.</p>
        </aside>
      </section>
    </Layout>
  )
}
