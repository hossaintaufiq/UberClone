import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { ADMIN_TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'
import { Car, FileText, CheckCircle2, Clock, Search, ShieldAlert, Check, X, ShieldCheck, Mail, Phone, Calendar } from 'lucide-react'

export default function AdminManageDriverPage() {
  const navigate = useNavigate()
  const [drivers, setDrivers] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!localStorage.getItem(ADMIN_TOKEN_KEY)) { navigate('/admin/login'); return }
    loadDrivers()
  }, [navigate])

  const loadDrivers = async () => {
    try {
      const data = await apiRequest('/api/admin/drivers', { tokenKey: ADMIN_TOKEN_KEY })
      setDrivers(data.data || [])
    } catch { setDrivers([]) }
  }

  const updateStatus = async (id, isActive) => {
    try {
      await apiRequest(`/api/admin/drivers/${id}/status`, {
        method: 'PATCH',
        body: { is_active: isActive },
        tokenKey: ADMIN_TOKEN_KEY,
      })
      setMessage(`Driver ${isActive ? 'activated' : 'suspended'} successfully.`)
      loadDrivers()
      if (selected && selected._id === id) setSelected(prev => ({ ...prev, isActive }))
    } catch (err) { setMessage(err.message) }
  }

  const verifyDocs = async (id) => {
    try {
      await apiRequest(`/api/admin/drivers/${id}/verify-docs`, {
        method: 'PATCH',
        tokenKey: ADMIN_TOKEN_KEY,
      })
      setMessage('Driver documents verified.')
      loadDrivers()
      if (selected && selected._id === id) {
        setSelected(prev => ({ 
          ...prev, 
          documents: (prev.documents || []).map(d => ({ ...d, verified: true })) 
        }))
      }
    } catch (err) { setMessage(err.message) }
  }

  const filtered = drivers.filter((d) =>
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.phone || '').includes(search)
  )

  return (
    <AdminLayout title="Fleet Management">
      
      {message && (
        <div className="animate-in fade-in slide-in-from-top-4 mb-6 flex items-center justify-between rounded-[1.5rem] bg-green-50 p-4 ring-1 ring-green-500/20">
          <p className="text-[13px] font-bold text-[#34c759]">{message}</p>
          <button onClick={() => setMessage('')} className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#34c759] shadow-sm hover:scale-105 hover:bg-[#34c759] hover:text-white transition-all">✕</button>
        </div>
      )}

      {/* Control Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-bottom-2">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0b0c0]"><Search size={18} /></div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[1.5rem] bg-white py-3.5 pl-12 pr-4 text-[14px] font-bold text-[#1c2731] shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-[#d9e3ec] transition-all placeholder:font-medium placeholder:text-[#a0b0c0] focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            placeholder="Search by name or phone number..."
          />
        </div>
        <div className="inline-flex rounded-full bg-[#1c2731] px-5 py-2 text-[12px] font-bold text-white shadow-md">
          {filtered.length} Active Profiles
        </div>
      </div>

      <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 lg:grid-cols-[1fr_420px]">
        
        {/* Drivers List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-[#d9e3ec] bg-white py-20 text-center">
              <Car size={40} className="text-[#a0b0c0] mb-4" />
              <h3 className="text-xl font-black text-[#1c2731]">No drivers found</h3>
              <p className="mt-1 text-[13px] font-medium text-[#8a9aab]">Try adjusting your search terms.</p>
            </div>
          ) : filtered.map((driver) => {
            const isSelected = selected?._id === driver._id
            return (
              <article
                key={driver._id}
                onClick={() => setSelected(driver)}
                className={`group cursor-pointer overflow-hidden rounded-[2rem] bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(0,122,255,0.08)] sm:p-6 ${
                  isSelected ? 'shadow-[0_12px_30px_rgba(0,122,255,0.15)] ring-2 ring-[#007AFF] ring-offset-2' : 'shadow-sm ring-1 ring-[#d9e3ec]'
                }`}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  
                  <div className="flex items-center gap-4">
                    <div className={`grid h-14 w-14 place-items-center rounded-[1.2rem] text-xl font-black text-white shadow-md transition-colors ${
                      isSelected ? 'bg-gradient-to-tr from-[#007AFF] to-[#0062CC]' : 'bg-[#1c2731] group-hover:bg-[#007AFF]'
                    }`}>
                      {(driver.name || 'D')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-lg font-black text-[#1c2731]">{driver.name || 'Unknown Captain'}</p>
                      <div className="mt-1 flex items-center gap-3">
                        <span className="flex items-center gap-1 text-[12px] font-bold text-[#8a9aab]">
                          <Phone size={12} /> {driver.phone || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                      driver.isOnline ? 'bg-blue-50 text-[#007AFF] ring-1 ring-blue-200' : 'bg-slate-100 text-[#607282] ring-1 ring-[#d9e3ec]'
                    }`}>
                      {driver.isOnline ? 'Online' : 'Offline'}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                      driver.isActive !== false ? 'bg-green-50 text-[#34c759] ring-1 ring-green-200' : 'bg-red-50 text-[#ff3b30] ring-1 ring-red-200'
                    }`}>
                      {driver.isActive !== false ? 'Active' : 'Suspended'}
                    </span>
                  </div>

                </div>

                {driver.documents && driver.documents.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-[#e8eef4] pt-4">
                    {driver.documents.map((doc, i) => (
                      <span key={i} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${
                        doc.verified ? 'bg-green-50 text-[#34c759] ring-1 ring-green-200' : 'bg-orange-50 text-[#ff9500] ring-1 ring-orange-200'
                      }`}>
                        <FileText size={12} /> {doc.name || 'Document'} {doc.verified ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            )
          })}
        </div>

        {/* Detail Panel */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          {selected ? (
            <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] ring-1 ring-[#d9e3ec] animate-in fade-in slide-in-from-right-4">
              
              <div className="bg-gradient-to-br from-[#007AFF] to-[#0062CC] px-8 pb-6 pt-8 text-white relative">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
                <div className="relative z-10 flex items-center gap-5">
                  <div className="grid h-20 w-20 place-items-center rounded-[1.5rem] bg-white text-3xl font-black text-[#007AFF] shadow-lg ring-4 ring-white/20">
                    {(selected.name || 'D')[0].toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black">{selected.name}</h2>
                    <p className="mt-1 text-[13px] font-bold text-blue-100 flex items-center gap-1">
                      <Calendar size={14} /> Joined {new Date(selected.createdAt).getFullYear()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                
                <div className="space-y-3">
                  <div className="flex items-center gap-4 rounded-[1.2rem] bg-[#f8fafc] p-4 ring-1 ring-[#d9e3ec]">
                    <div className="text-[#007AFF]"><Phone size={20} /></div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Mobile Number</p>
                      <p className="text-[15px] font-bold text-[#1c2731]">{selected.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 rounded-[1.2rem] bg-[#f8fafc] p-4 ring-1 ring-[#d9e3ec]">
                    <div className="text-[#007AFF]"><Mail size={20} /></div>
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Email Address</p>
                      <p className="text-[15px] font-bold text-[#1c2731]">{selected.email || '—'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-[12px] font-black uppercase tracking-widest text-[#1c2731] mb-4 flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#007AFF]" /> Account Controls
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {selected.isActive !== false ? (
                      <button onClick={() => updateStatus(selected._id, false)} className="flex items-center justify-center gap-2 rounded-[1.2rem] bg-[#fff5f5] py-3.5 text-[13px] font-bold text-[#ff3b30] ring-1 ring-[#ffd4d4] transition-all hover:bg-[#ff3b30] hover:text-white hover:shadow-md">
                        <X size={16} /> Suspend Driver
                      </button>
                    ) : (
                      <button onClick={() => updateStatus(selected._id, true)} className="flex items-center justify-center gap-2 rounded-[1.2rem] bg-green-50 py-3.5 text-[13px] font-bold text-[#34c759] ring-1 ring-green-200 transition-all hover:bg-[#34c759] hover:text-white hover:shadow-md">
                        <Check size={16} /> Reactivate
                      </button>
                    )}
                    <button onClick={() => verifyDocs(selected._id)} className="flex items-center justify-center gap-2 rounded-[1.2rem] bg-[#1c2731] py-3.5 text-[13px] font-bold text-white shadow-md transition-all hover:bg-[#2a3a4a] hover:shadow-lg">
                      <ShieldCheck size={16} /> Verify Docs
                    </button>
                  </div>
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-dashed border-[#d9e3ec] bg-[#f8fafc] p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#8a9aab] mb-3 flex items-center gap-1">
                    <ShieldAlert size={12} className="text-[#ff9500]" /> Quick Flags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Fake GPS', 'Promo Abuse', 'Multiple Accounts', 'Bad Behavior'].map((r) => (
                      <button 
                        key={r} 
                        onClick={() => updateStatus(selected._id, false)} 
                        className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-[#607282] shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:bg-[#ff3b30] hover:text-white hover:ring-[#ff3b30]"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-[#d9e3ec] bg-white p-8 text-center shadow-sm">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[#f8fafc] text-[#a0b0c0] ring-1 ring-[#d9e3ec]">
                <Car size={32} />
              </div>
              <h3 className="text-xl font-black text-[#1c2731]">No Profile Selected</h3>
              <p className="mt-2 text-[14px] font-medium text-[#8a9aab]">Click on a driver card from the list to view and manage their profile details.</p>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}
