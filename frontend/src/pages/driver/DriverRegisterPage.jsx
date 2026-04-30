import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { CheckCircle2, Circle, ArrowLeft, Car, ShieldCheck, FileText, Camera, Navigation, UserCircle, Phone } from 'lucide-react'

export default function DriverRegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', nid: '', licensePic: null, profilePhoto: null })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (key, value) => setForm({ ...form, [key]: value })

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone || !form.password) return setMessage('Complete all required fields.')
    try {
      setBusy(true)
      setMessage('')
      await apiRequest('/api/auth/driver/register', {
        method: 'POST',
        body: { name: form.name, email: form.email, phone: form.phone, password: form.password },
      })
      navigate('/driver/login')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setBusy(false)
    }
  }

  const steps = [
    { id: 1, title: 'Identity', icon: UserCircle },
    { id: 2, title: 'Documents', icon: FileText },
    { id: 3, title: 'Verification', icon: ShieldCheck },
  ]

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#edf3f9] selection:bg-[#007AFF]/20 selection:text-[#007AFF] px-4 py-12 sm:px-8">
      
      <div className="relative w-full max-w-[640px]">
        
        {/* Floating Return Button */}
        <Link to="/" className="group absolute -top-16 left-0 flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-[#607282] shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:bg-[#007AFF] hover:text-white">
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Return to Home
        </Link>

        <div className="overflow-hidden rounded-[3rem] bg-white shadow-[0_20px_80px_rgba(14,47,74,0.08)] ring-1 ring-[#d9e3ec]">
          
          {/* Header Area */}
          <div className="relative overflow-hidden bg-[#1c2731] px-10 pb-16 pt-12">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-[#007AFF] opacity-30 blur-[80px]"></div>
            
            <div className="relative z-10 text-center">
              <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-[1.2rem] bg-gradient-to-tr from-[#007AFF] to-[#0062CC] text-white shadow-[0_8px_20px_rgba(0,122,255,0.4)] ring-4 ring-white/10">
                <Car size={32} />
              </div>
              <h1 className="text-3xl font-black text-white">Join the Transitely Fleet</h1>
              <p className="mt-2 text-[15px] font-medium text-[#a0b0c0]">Register as a captain and start earning on your own schedule.</p>
            </div>
          </div>

          <div className="relative z-20 -mt-10 px-8 pb-10 sm:px-12">
            
            {/* Dynamic Step Progress */}
            <div className="mb-10 flex justify-between rounded-[2rem] bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-[#d9e3ec]">
              {steps.map((s, index) => {
                const isActive = step === s.id
                const isPassed = step > s.id
                return (
                  <div key={s.id} className="relative flex flex-1 flex-col items-center gap-2">
                    <div className={`grid h-10 w-10 place-items-center rounded-full text-white transition-all ${
                      isActive ? 'bg-[#007AFF] shadow-[0_4px_12px_rgba(0,122,255,0.4)] ring-4 ring-blue-50' :
                      isPassed ? 'bg-[#34c759]' : 'bg-[#e8eef4] text-[#a0b0c0]'
                    }`}>
                      {isPassed ? <CheckCircle2 size={20} /> : <s.icon size={18} />}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'text-[#007AFF]' : isPassed ? 'text-[#34c759]' : 'text-[#a0b0c0]'}`}>{s.title}</span>
                    
                    {index < steps.length - 1 && (
                      <div className={`absolute left-[60%] top-5 -z-10 h-1 w-[80%] -translate-y-1/2 rounded-full ${isPassed ? 'bg-[#34c759]' : 'bg-[#e8eef4]'}`}></div>
                    )}
                  </div>
                )
              })}
            </div>

            <form onSubmit={submit}>
              
              {/* STEP 1: IDENTITY */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Full Legal Name *</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0b0c0]"><UserCircle size={20} /></div>
                        <input value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full rounded-[1.2rem] bg-[#f8fafc] py-4 pl-12 pr-5 text-[15px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" placeholder="e.g. John Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Mobile Number *</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0b0c0]"><Phone size={20} /></div>
                        <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full rounded-[1.2rem] bg-[#f8fafc] py-4 pl-12 pr-5 text-[15px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" placeholder="01XXXXXXXXX" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Email Address</label>
                      <input value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full rounded-[1.2rem] bg-[#f8fafc] px-5 py-4 text-[15px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" placeholder="captain@example.com (Optional)" />
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Secure Password *</label>
                      <input value={form.password} onChange={(e) => update('password', e.target.value)} type="password" className="w-full rounded-[1.2rem] bg-[#f8fafc] px-5 py-4 text-[15px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" placeholder="Create a strong password" />
                    </div>
                  </div>

                  <button type="button" onClick={() => { if (form.name && form.phone && form.password) setStep(2); else setMessage('Fill required fields to continue.') }} className="mt-8 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-[#1c2731] py-4 text-[15px] font-black text-white shadow-[0_8px_20px_rgba(28,39,49,0.2)] transition-all hover:shadow-lg active:scale-95">
                    Proceed to Documents <ArrowLeft size={18} className="rotate-180" />
                  </button>
                </div>
              )}

              {/* STEP 2: DOCUMENTS */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  
                  <div>
                    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">National ID (NID) Number</label>
                    <input value={form.nid} onChange={(e) => update('nid', e.target.value)} className="w-full rounded-[1.2rem] bg-[#f8fafc] px-5 py-4 text-[15px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" placeholder="Enter 10 or 17 digit NID" />
                  </div>

                  <div className="space-y-4">
                    <label className="block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Required Uploads</label>
                    
                    <div className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border-2 border-dashed border-[#d9e3ec] bg-[#f8fafc] p-6 text-center transition-all hover:border-[#007AFF] hover:bg-blue-50">
                      <input type="file" accept="image/*" onChange={(e) => update('profilePhoto', e.target.files[0])} className="absolute inset-0 z-10 w-full cursor-pointer opacity-0" />
                      <div className="pointer-events-none flex flex-col items-center">
                        <div className={`mb-3 grid h-12 w-12 place-items-center rounded-full transition-colors ${form.profilePhoto ? 'bg-[#34c759] text-white' : 'bg-white text-[#007AFF] shadow-sm ring-1 ring-[#d9e3ec]'}`}>
                          {form.profilePhoto ? <CheckCircle2 size={24} /> : <Camera size={24} />}
                        </div>
                        <p className={`text-[15px] font-bold ${form.profilePhoto ? 'text-[#34c759]' : 'text-[#1c2731]'}`}>{form.profilePhoto ? 'Profile Photo Uploaded' : 'Upload Profile Photo'}</p>
                        <p className="mt-1 text-[12px] font-medium text-[#8a9aab]">Clear front-facing photo required</p>
                      </div>
                    </div>

                    <div className="group relative cursor-pointer overflow-hidden rounded-[1.5rem] border-2 border-dashed border-[#d9e3ec] bg-[#f8fafc] p-6 text-center transition-all hover:border-[#007AFF] hover:bg-blue-50">
                      <input type="file" accept="image/*" onChange={(e) => update('licensePic', e.target.files[0])} className="absolute inset-0 z-10 w-full cursor-pointer opacity-0" />
                      <div className="pointer-events-none flex flex-col items-center">
                        <div className={`mb-3 grid h-12 w-12 place-items-center rounded-full transition-colors ${form.licensePic ? 'bg-[#34c759] text-white' : 'bg-white text-[#007AFF] shadow-sm ring-1 ring-[#d9e3ec]'}`}>
                          {form.licensePic ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                        </div>
                        <p className={`text-[15px] font-bold ${form.licensePic ? 'text-[#34c759]' : 'text-[#1c2731]'}`}>{form.licensePic ? 'Driving License Uploaded' : 'Upload Driving License'}</p>
                        <p className="mt-1 text-[12px] font-medium text-[#8a9aab]">Clear photo of the front of your license</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex gap-3">
                    <button type="button" onClick={() => setStep(1)} className="flex items-center justify-center rounded-[1.5rem] bg-[#f8fafc] px-6 py-4 text-[14px] font-bold text-[#607282] ring-1 ring-[#d9e3ec] transition-colors hover:bg-white hover:text-[#1c2731]">
                      <ArrowLeft size={18} />
                    </button>
                    <button type="button" onClick={() => setStep(3)} className="flex flex-1 items-center justify-center gap-2 rounded-[1.5rem] bg-[#1c2731] py-4 text-[15px] font-black text-white shadow-[0_8px_20px_rgba(28,39,49,0.2)] transition-all hover:shadow-lg active:scale-95">
                      Verify Details <ArrowLeft size={18} className="rotate-180" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: VERIFICATION */}
              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  
                  <div className="rounded-[1.5rem] bg-[#f8fafc] p-6 ring-1 ring-[#d9e3ec]">
                    <div className="mb-4 flex items-center gap-2 text-[#34c759]">
                      <ShieldCheck size={20} />
                      <h3 className="text-[14px] font-black uppercase tracking-wider">Final Verification</h3>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        ['Full Name', form.name],
                        ['Mobile', form.phone],
                        ['Email', form.email || '—'],
                        ['NID No.', form.nid || '—'],
                      ].map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between border-b border-[#e8eef4] pb-2 last:border-0 last:pb-0">
                          <span className="text-[13px] font-semibold text-[#8a9aab]">{k}</span>
                          <span className="text-[14px] font-black text-[#1c2731]">{v}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex gap-2">
                      <div className={`flex flex-1 items-center justify-center gap-2 rounded-xl p-3 text-[12px] font-bold ${form.profilePhoto ? 'bg-green-50 text-[#34c759] ring-1 ring-green-200' : 'bg-red-50 text-[#ff3b30] ring-1 ring-red-200'}`}>
                        {form.profilePhoto ? <CheckCircle2 size={16}/> : <Circle size={16}/>} Profile Photo
                      </div>
                      <div className={`flex flex-1 items-center justify-center gap-2 rounded-xl p-3 text-[12px] font-bold ${form.licensePic ? 'bg-green-50 text-[#34c759] ring-1 ring-green-200' : 'bg-red-50 text-[#ff3b30] ring-1 ring-red-200'}`}>
                        {form.licensePic ? <CheckCircle2 size={16}/> : <Circle size={16}/>} License Copy
                      </div>
                    </div>
                  </div>

                  {message && (
                    <div className="animate-in fade-in rounded-[1rem] bg-red-50 p-4 ring-1 ring-red-500/20">
                      <p className="text-[13px] font-bold text-[#ff3b30]">{message}</p>
                    </div>
                  )}

                  <div className="mt-8 flex gap-3">
                    <button type="button" onClick={() => setStep(2)} className="flex items-center justify-center rounded-[1.5rem] bg-[#f8fafc] px-6 py-4 text-[14px] font-bold text-[#607282] ring-1 ring-[#d9e3ec] transition-colors hover:bg-white hover:text-[#1c2731]">
                      <ArrowLeft size={18} />
                    </button>
                    <button disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-[#007AFF] to-[#0062CC] py-4 text-[16px] font-black text-white shadow-[0_8px_25px_rgba(0,122,255,0.35)] transition-all hover:shadow-[0_15px_35px_rgba(0,122,255,0.45)] active:scale-95 disabled:opacity-60">
                      {busy ? 'Processing...' : 'Submit Registration'} <Navigation size={18} />
                    </button>
                  </div>
                </div>
              )}

            </form>

            <div className="mt-10 text-center">
              <p className="text-[14px] font-medium text-[#607282]">
                Already part of the fleet?{' '}
                <Link className="font-bold text-[#007AFF] transition-colors hover:text-[#0062CC]" to="/driver/login">
                  Sign in here
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </main>
  )
}
