import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { ADMIN_TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'
import { Users, Search, ShieldAlert, Check, X, Mail, Phone, Calendar, ArrowUpRight } from 'lucide-react'

export default function AdminManageRiderPage() {
  const navigate = useNavigate()
  const [riders, setRiders] = useState([])
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!localStorage.getItem(ADMIN_TOKEN_KEY)) { navigate('/admin/login'); return }
    loadRiders()
  }, [navigate])

  const loadRiders = async () => {
    try {
      const data = await apiRequest('/api/admin/riders', { tokenKey: ADMIN_TOKEN_KEY })
      setRiders(data.data || [])
    } catch { setRiders([]) }
  }

  const updateStatus = async (id, isActive, reason) => {
    try {
      await apiRequest(`/api/admin/riders/${id}/status`, {
        method: 'PATCH',
        body: { is_active: isActive },
        tokenKey: ADMIN_TOKEN_KEY,
      })
      setMessage(`User ${isActive ? 'activated' : 'suspended'} successfully.`)
      loadRiders()
    } catch (err) { setMessage(err.message) }
  }

  const filtered = riders.filter((r) =>
    (r.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.phone || '').includes(search) ||
    (r.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout title="User Database">
      
      {message && (
        <div className="animate-in fade-in slide-in-from-top-4 mb-6 flex items-center justify-between rounded-[1.5rem] bg-blue-50 p-4 ring-1 ring-blue-500/20">
          <p className="text-[13px] font-bold text-[#007AFF]">{message}</p>
          <button onClick={() => setMessage('')} className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#007AFF] shadow-sm hover:scale-105 hover:bg-[#007AFF] hover:text-white transition-all">✕</button>
        </div>
      )}

      {/* Control Strip */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-bottom-2">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a0b0c0]"><Search size={18} /></div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[1.5rem] bg-white py-3.5 pl-12 pr-4 text-[14px] font-bold text-[#1c2731] shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-1 ring-[#d9e3ec] transition-all placeholder:font-medium placeholder:text-[#a0b0c0] focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
            placeholder="Search by name, email, or phone..."
          />
        </div>
        <div className="flex gap-3">
          <div className="inline-flex rounded-full bg-[#1c2731] px-5 py-2 text-[12px] font-bold text-white shadow-md">
            {filtered.length} Users Listed
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] animate-in fade-in slide-in-from-bottom-4">
        
        {/* Table Header Wrapper for visual flair */}
        <div className="bg-gradient-to-r from-[#f8fafc] to-white p-6 border-b border-[#e8eef4]">
          <h3 className="text-lg font-black text-[#1c2731] flex items-center gap-2">
            <Users size={20} className="text-[#007AFF]" /> Registered Riders Directory
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#e8eef4] bg-[#f8fafc]">
                <th className="px-8 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Profile Data</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Contact Info</th>
                <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Account Status</th>
                <th className="px-8 py-4 text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] text-right">Administrative Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f4f8]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <Users size={40} className="text-[#a0b0c0] mb-4" />
                      <p className="text-lg font-black text-[#1c2731]">No user records found</p>
                      <p className="mt-1 text-[13px] font-medium text-[#8a9aab]">The database returned zero matches.</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((rider) => (
                <tr key={rider._id} className="group transition-colors hover:bg-blue-50/30">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-[1rem] bg-[#007AFF] text-[15px] font-black text-white shadow-sm ring-1 ring-[#007AFF]/20 transition-transform group-hover:scale-110">
                        {(rider.name || 'R')[0].toUpperCase()}
                      </div>
                      <div>
                        <span className="text-[15px] font-black text-[#1c2731]">{rider.name || 'Unknown User'}</span>
                        <p className="flex items-center gap-1 text-[11px] font-bold text-[#8a9aab] mt-0.5">
                          <Calendar size={12} /> Joined {new Date(rider.createdAt || Date.now()).getFullYear()}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#607282]">
                        <Phone size={14} className="text-[#8a9aab]" /> {rider.phone || '—'}
                      </div>
                      <div className="flex items-center gap-2 text-[13px] font-bold text-[#607282]">
                        <Mail size={14} className="text-[#8a9aab]" /> {rider.email || '—'}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                      rider.isActive !== false ? 'bg-green-50 text-[#34c759] ring-1 ring-green-200' : 'bg-red-50 text-[#ff3b30] ring-1 ring-red-200'
                    }`}>
                      {rider.isActive !== false ? <Check size={12} /> : <X size={12} />}
                      {rider.isActive !== false ? 'Verified' : 'Suspended'}
                    </span>
                  </td>
                  
                  <td className="px-8 py-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="flex items-center justify-center gap-1 rounded-xl bg-[#f8fafc] px-3 py-2 text-[11px] font-bold text-[#607282] ring-1 ring-[#d9e3ec] transition-all hover:bg-white hover:text-[#1c2731] hover:shadow-sm">
                        <ArrowUpRight size={14} /> Details
                      </button>
                      {rider.isActive !== false ? (
                        <button onClick={() => updateStatus(rider._id, false, 'Admin action')} className="flex items-center justify-center gap-1 rounded-xl bg-[#fff5f5] px-3 py-2 text-[11px] font-bold text-[#ff3b30] ring-1 ring-[#ffd4d4] transition-all hover:bg-[#ff3b30] hover:text-white hover:shadow-sm">
                          <ShieldAlert size={14} /> Suspend
                        </button>
                      ) : (
                        <button onClick={() => updateStatus(rider._id, true)} className="flex items-center justify-center gap-1 rounded-xl bg-green-50 px-3 py-2 text-[11px] font-bold text-[#34c759] ring-1 ring-green-200 transition-all hover:bg-[#34c759] hover:text-white hover:shadow-sm">
                          <Check size={14} /> Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
