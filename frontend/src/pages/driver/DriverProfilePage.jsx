import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverLayout from '../../components/DriverLayout'
import { DRIVER_TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'
import { Pencil, FileText, CheckCircle2, Clock, Frown, ThumbsDown, AlertTriangle, Wrench, Smartphone, Car, Navigation, ShieldCheck, Mail, Phone, Camera, Save, X, Smile, Meh, Angry } from 'lucide-react'

export default function DriverProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({})
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  useEffect(() => {
    if (!localStorage.getItem(DRIVER_TOKEN_KEY)) { navigate('/driver/login'); return }
    loadProfile()
  }, [navigate])

  const loadProfile = async () => {
    try {
      const data = await apiRequest('/api/drivers/profile', { tokenKey: DRIVER_TOKEN_KEY })
      setProfile(data.data || {})
      setForm({ name: data.data?.name || '', email: data.data?.email || '', phone: data.data?.phone || '' })
    } catch { /* defaults */ }
  }

  const saveProfile = async () => {
    try {
      await apiRequest('/api/drivers/profile', { method: 'PUT', body: form, tokenKey: DRIVER_TOKEN_KEY })
      setEditing(false)
      loadProfile()
    } catch { /* ignore */ }
  }

  return (
    <DriverLayout title="Captain Profile">
      <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 lg:grid-cols-[1fr_400px]">
        
        {/* Main Info */}
        <div className="space-y-6">
          
          {/* Identity Card */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec]">
            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-blue-50/50 to-transparent"></div>
            
            <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="grid h-24 w-24 place-items-center rounded-[2rem] bg-gradient-to-tr from-[#007AFF] to-[#0062CC] text-4xl font-black text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)] ring-4 ring-white">
                    {(profile.name || 'D')[0].toUpperCase()}
                  </div>
                  <button className="absolute -bottom-2 -right-2 grid h-8 w-8 place-items-center rounded-full bg-white text-[#007AFF] shadow-md ring-1 ring-[#d9e3ec] transition-transform hover:scale-110">
                    <Camera size={14} />
                  </button>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-[#1c2731]">{profile.name || 'Captain'}</h2>
                  <p className="flex items-center gap-2 text-[14px] font-bold text-[#607282]">
                    <ShieldCheck size={16} className="text-[#34c759]" /> 
                    {profile.role || 'Verified Driver'}
                  </p>
                  <p className="mt-1 text-[12px] font-medium text-[#8a9aab]">Fleet Member since {profile.createdAt ? new Date(profile.createdAt).getFullYear() : '—'}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-start sm:items-end">
                <span className={`rounded-full px-4 py-1.5 text-[12px] font-black uppercase tracking-wider ${profile.isActive !== false ? 'bg-green-50 text-[#34c759] ring-1 ring-green-200' : 'bg-red-50 text-[#ff3b30] ring-1 ring-red-200'}`}>
                  {profile.isActive !== false ? 'Account Active' : 'Suspended'}
                </span>
                <span className={`mt-2 rounded-full px-4 py-1.5 text-[12px] font-black uppercase tracking-wider ${profile.isOnline ? 'bg-blue-50 text-[#007AFF] ring-1 ring-blue-200' : 'bg-slate-100 text-[#607282] ring-1 ring-[#d9e3ec]'}`}>
                  {profile.isOnline ? 'Currently Online' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-8 rounded-[1.5rem] bg-[#f8fafc] p-6 ring-1 ring-[#d9e3ec]">
              {editing ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Full Name</label>
                      <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-[1.2rem] bg-white px-4 py-3 text-[14px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] focus:outline-none focus:ring-2 focus:ring-[#007AFF]" />
                    </div>
                    <div>
                      <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Email Address</label>
                      <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-[1.2rem] bg-white px-4 py-3 text-[14px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] focus:outline-none focus:ring-2 focus:ring-[#007AFF]" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Phone Number</label>
                    <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-[1.2rem] bg-white px-4 py-3 text-[14px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] focus:outline-none focus:ring-2 focus:ring-[#007AFF]" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setEditing(false)} className="flex flex-1 items-center justify-center gap-2 rounded-[1.2rem] bg-white py-3 text-[13px] font-bold text-[#607282] shadow-sm ring-1 ring-[#d9e3ec] hover:bg-[#f8fafc]"><X size={16} /> Cancel</button>
                    <button onClick={saveProfile} className="flex flex-1 items-center justify-center gap-2 rounded-[1.2rem] bg-[#007AFF] py-3 text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)] hover:shadow-lg"><Save size={16} /> Save Changes</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-4 rounded-[1.2rem] bg-white p-4 ring-1 ring-[#d9e3ec]">
                      <div className="text-[#007AFF]"><Phone size={20} /></div>
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Phone</p>
                        <p className="text-[15px] font-bold text-[#1c2731]">{profile.phone || '—'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-[1.2rem] bg-white p-4 ring-1 ring-[#d9e3ec]">
                      <div className="text-[#007AFF]"><Mail size={20} /></div>
                      <div>
                        <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Email</p>
                        <p className="text-[15px] font-bold text-[#1c2731]">{profile.email || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setEditing(true)} className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-white py-3.5 text-[14px] font-bold text-[#007AFF] shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:bg-[#e8f4fd] hover:ring-[#007AFF]/30">
                    <Pencil size={16} /> Edit Profile Details
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Compliance & Documents */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-[#1c2731]">Compliance Documents</h3>
              <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-[11px] font-bold text-[#607282] ring-1 ring-[#d9e3ec]">Required for fleet</span>
            </div>
            
            {(profile.documents || []).length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {profile.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between rounded-[1.5rem] bg-[#f8fafc] p-5 ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#007AFF] shadow-sm ring-1 ring-[#d9e3ec]">
                        <FileText size={18} />
                      </div>
                      <span className="text-[14px] font-bold text-[#1c2731]">{doc.name}</span>
                    </div>
                    <span className={`grid h-8 w-8 place-items-center rounded-full ${doc.verified ? 'bg-green-50 text-[#34c759]' : 'bg-orange-50 text-[#ff9500]'}`}>
                      {doc.verified ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[#d9e3ec] bg-[#f8fafc] py-12 text-center">
                <div className="mb-4 grid h-16 w-16 place-items-center rounded-[1.5rem] bg-white text-[#a0b0c0] shadow-sm ring-1 ring-[#d9e3ec]">
                  <ShieldCheck size={28} />
                </div>
                <h4 className="text-lg font-black text-[#1c2731]">No Documents Found</h4>
                <p className="mt-1 text-[14px] font-medium text-[#8a9aab]">Please upload your NID and Driving License to verify your account.</p>
                <button className="mt-6 rounded-full bg-[#1c2731] px-6 py-2.5 text-[13px] font-bold text-white shadow-md hover:bg-[#2a3a4a]">Upload Documents</button>
              </div>
            )}
          </div>
        </div>

        {/* Side Widgets */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          
          {/* Quick Mood Widget */}
          <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#007AFF] to-[#0062CC] p-8 text-white shadow-[0_15px_40px_rgba(0,122,255,0.2)]">
            <h3 className="text-xl font-black">Driver Status</h3>
            <p className="text-[13px] font-medium text-blue-100">How are you feeling today?</p>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { label: 'Great', icon: Smile },
                { label: 'Okay', icon: Meh },
                { label: 'Stressed', icon: Angry }
              ].map((m) => (
                <button key={m.label} className="group flex flex-col items-center gap-2 rounded-[1.2rem] bg-white/10 p-3 ring-1 ring-white/20 transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
                  <m.icon size={24} className="text-white group-hover:text-blue-100" />
                  <span className="text-[11px] font-bold tracking-wide">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SOS / Issue Reporter */}
          <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec]">
            <h3 className="text-xl font-black text-[#1c2731]">Support & Reports</h3>
            <p className="mt-1 text-[13px] font-medium text-[#8a9aab]">Log an issue with dispatch.</p>
            
            <div className="mt-6 space-y-3">
              {[
                { label: 'Passenger Dispute', icon: <ThumbsDown size={18} />, color: 'text-[#ff9500]', bg: 'bg-[#ff9500]/10' },
                { label: 'Route/Traffic Issue', icon: <AlertTriangle size={18} />, color: 'text-[#ff3b30]', bg: 'bg-[#ff3b30]/10' },
                { label: 'Vehicle Breakdown', icon: <Wrench size={18} />, color: 'text-[#5856d6]', bg: 'bg-[#5856d6]/10' },
                { label: 'App Glitch', icon: <Smartphone size={18} />, color: 'text-[#007AFF]', bg: 'bg-[#007AFF]/10' }
              ].map((issue) => (
                <button key={issue.label} className="group flex w-full items-center gap-4 rounded-[1.5rem] bg-[#f8fafc] p-4 ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-0.5 hover:shadow-md hover:bg-white">
                  <div className={`grid h-10 w-10 place-items-center rounded-xl ${issue.bg} ${issue.color} transition-transform group-hover:scale-110`}>
                    {issue.icon}
                  </div>
                  <span className="text-[14px] font-bold text-[#1c2731]">{issue.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DriverLayout>
  )
}
