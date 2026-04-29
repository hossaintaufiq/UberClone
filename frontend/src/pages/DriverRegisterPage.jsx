import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { apiRequest } from '../services/api'

export default function DriverRegisterPage() {
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
      await apiRequest('/api/auth/driver/register', {
        method: 'POST',
        body: { name: form.name, email: form.email, phone: form.phone, password: form.password },
      })
      navigate(`/driver/login?identifier=${encodeURIComponent(form.email)}`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Layout title="Driver Register" subtitle="Create your driver account and start onboarding.">
      <section className="mx-auto grid max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-[#d7e7f4] bg-white shadow-[0_14px_30px_rgba(14,47,74,0.08)] lg:grid-cols-2">
        <form onSubmit={submit} className="flex flex-col justify-center p-6 md:p-10">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#688092]">Driver Onboarding</p>
          <h2 className="mt-2 text-3xl font-bold text-[#1b2a36]">Create your driver account</h2>
          <p className="mt-2 text-sm text-[#607282]">After registration, upload your documents and wait for admin approval.</p>
          <div className="mt-6 space-y-4">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-md border border-[#cfe2f0] bg-[#f3faff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#3aa7e8]" placeholder="Full name" />
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-md border border-[#cfe2f0] bg-[#f3faff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#3aa7e8]" placeholder="Email" />
            <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-md border border-[#cfe2f0] bg-[#f3faff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#3aa7e8]" placeholder="Phone" />
            <input value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} type="password" className="w-full rounded-md border border-[#cfe2f0] bg-[#f3faff] px-3 py-2.5 text-[#1f2e3a] outline-none focus:border-[#3aa7e8]" placeholder="Password" />
          </div>
          {message ? <p className="mt-3 text-sm text-[#b04545]">{message}</p> : null}
          <button disabled={busy} className="mt-4 w-full rounded-md bg-[#36a7e6] py-2.5 font-semibold text-white shadow-[0_10px_18px_rgba(54,167,230,0.3)] transition-colors hover:bg-[#2898d9] disabled:opacity-70">{busy ? 'Creating account...' : 'Register as Driver'}</button>
          <p className="mt-4 text-sm text-[#607282]">Already registered? <Link className="font-semibold text-[#2f9edf]" to="/driver/login">Sign in</Link></p>
        </form>
        <aside className="bg-gradient-to-br from-[#58b9ef] via-[#3aa7e8] to-[#238fcf] p-6 text-white md:p-10">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-[#ddf4ff]">Transitely Driver Program</p>
          <h3 className="mt-2 text-3xl font-bold">Join the verified driver network</h3>
          <ul className="mt-4 space-y-2 text-sm text-[#ebf8ff]">
            <li>Upload NID, driving license, and profile photo</li>
            <li>Get approval from admin team</li>
            <li>Go online and start earning</li>
          </ul>
        </aside>
      </section>
    </Layout>
  )
}
