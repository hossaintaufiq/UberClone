import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { Ticket, Plus, Tag, RefreshCw, Calendar, Percent, Banknote, ShieldCheck } from 'lucide-react'

export default function AdminPromocodePage() {
  const [promos, setPromos] = useState([
    { id: 1, code: 'WELCOME50', discountType: 'flat', discountValue: 50, maxUses: 100, currentUses: 34, validTo: '2025-06-30', isActive: true },
    { id: 2, code: 'RIDE20', discountType: 'percent', discountValue: 20, maxUses: 500, currentUses: 189, validTo: '2025-05-15', isActive: true },
    { id: 3, code: 'SUMMER10', discountType: 'percent', discountValue: 10, maxUses: 1000, currentUses: 1000, validTo: '2025-04-01', isActive: false },
  ])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ code: '', discountType: 'flat', discountValue: '', maxUses: '', validTo: '' })
  const [message, setMessage] = useState('')

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)]
    setForm({ ...form, code })
  }

  const createPromo = (e) => {
    e.preventDefault()
    if (!form.code || !form.discountValue) return
    setPromos([
      {
        id: Date.now(),
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxUses: Number(form.maxUses) || 100,
        currentUses: 0,
        validTo: form.validTo || '2025-12-31',
        isActive: true,
      },
      ...promos,
    ])
    setForm({ code: '', discountType: 'flat', discountValue: '', maxUses: '', validTo: '' })
    setShowForm(false)
    setMessage('Promotional code generated and activated successfully!')
  }

  return (
    <AdminLayout title="Promotions Engine">
      
      {message && (
        <div className="animate-in fade-in slide-in-from-top-4 mb-6 flex items-center justify-between rounded-[1.5rem] bg-green-50 p-4 ring-1 ring-green-500/20">
          <p className="text-[13px] font-bold text-[#34c759]">{message}</p>
          <button onClick={() => setMessage('')} className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#34c759] shadow-sm hover:scale-105 hover:bg-[#34c759] hover:text-white transition-all">✕</button>
        </div>
      )}

      {/* Header Actions */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-bottom-2">
        <div>
          <h2 className="text-2xl font-black text-[#1c2731]">Active Campaigns</h2>
          <p className="mt-1 text-[14px] font-medium text-[#8a9aab]">{promos.filter(p=>p.isActive).length} active codes in circulation</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 rounded-full px-6 py-3 text-[14px] font-black text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${showForm ? 'bg-[#ff3b30]' : 'bg-[#007AFF] hover:bg-[#0062CC]'}`}
        >
          {showForm ? 'Cancel Creation' : <><Plus size={18} /> Create New Promo</>}
        </button>
      </div>

      {/* Creation Form */}
      {showForm && (
        <div className="mb-8 overflow-hidden rounded-[2.5rem] bg-white shadow-[0_20px_60px_rgba(0,122,255,0.08)] ring-1 ring-[#007AFF]/30 animate-in fade-in slide-in-from-top-4">
          <div className="bg-gradient-to-r from-[#007AFF] to-[#0062CC] px-8 py-6 text-white">
            <h3 className="text-xl font-black flex items-center gap-2"><Ticket size={20} /> Generate Marketing Code</h3>
            <p className="mt-1 text-[13px] font-medium text-blue-100">Configure discount logic, usage limits, and expiration.</p>
          </div>
          
          <form onSubmit={createPromo} className="p-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              
              <div className="space-y-2 lg:col-span-1 sm:col-span-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] flex items-center gap-2">
                  <Tag size={14} /> Coupon Code
                </label>
                <div className="flex gap-2">
                  <input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    className="flex-1 rounded-[1.2rem] bg-[#f8fafc] px-4 py-3.5 font-mono text-lg font-black uppercase tracking-widest text-[#1c2731] shadow-inner ring-1 ring-[#d9e3ec] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    placeholder="E.g. SUMMER50"
                  />
                  <button type="button" onClick={generateCode} className="flex shrink-0 items-center gap-2 rounded-[1.2rem] bg-blue-50 px-4 font-bold text-[#007AFF] ring-1 ring-blue-200 hover:bg-[#007AFF] hover:text-white transition-all">
                    <RefreshCw size={16} /> Auto
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] flex items-center gap-2">
                  <ShieldCheck size={14} /> Discount Type
                </label>
                <div className="relative">
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full appearance-none rounded-[1.2rem] bg-[#f8fafc] px-4 py-3.5 text-[15px] font-bold text-[#1c2731] shadow-inner ring-1 ring-[#d9e3ec] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  >
                    <option value="flat">Flat Amount (৳)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#a0b0c0]">▼</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] flex items-center gap-2">
                  {form.discountType === 'flat' ? <Banknote size={14}/> : <Percent size={14}/>} Value
                </label>
                <input
                  type="number"
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  className="w-full rounded-[1.2rem] bg-[#f8fafc] px-4 py-3.5 text-[15px] font-bold text-[#1c2731] shadow-inner ring-1 ring-[#d9e3ec] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  placeholder={form.discountType === 'flat' ? 'E.g. 50' : 'E.g. 20'}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Max Total Uses</label>
                <input
                  type="number"
                  value={form.maxUses}
                  onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  className="w-full rounded-[1.2rem] bg-[#f8fafc] px-4 py-3.5 text-[15px] font-bold text-[#1c2731] shadow-inner ring-1 ring-[#d9e3ec] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                  placeholder="1000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] flex items-center gap-2">
                  <Calendar size={14} /> Expiration Date
                </label>
                <input
                  type="date"
                  value={form.validTo}
                  onChange={(e) => setForm({ ...form, validTo: e.target.value })}
                  className="w-full rounded-[1.2rem] bg-[#f8fafc] px-4 py-3.5 text-[15px] font-bold text-[#1c2731] shadow-inner ring-1 ring-[#d9e3ec] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                />
              </div>

              <div className="flex items-end">
                <button type="submit" className="w-full rounded-[1.2rem] bg-[#1c2731] py-3.5 text-[15px] font-black text-white shadow-md transition-all hover:bg-[#2a3a4a] hover:shadow-lg active:scale-95">
                  Launch Campaign
                </button>
              </div>

            </div>
          </form>
        </div>
      )}

      {/* Promos Grid */}
      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-6">
        {promos.map((promo) => {
          const usagePercent = Math.min((promo.currentUses / promo.maxUses) * 100, 100)
          
          return (
            <article key={promo.id} className={`group relative overflow-hidden rounded-[2.5rem] bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,122,255,0.08)] sm:p-8 ${promo.isActive ? 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec]' : 'opacity-70 ring-1 ring-[#e8eef4] bg-slate-50'}`}>
              
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <span className={`inline-block rounded-[1rem] px-4 py-2 font-mono text-[16px] font-black tracking-widest shadow-sm ring-1 ${promo.isActive ? 'bg-blue-50 text-[#007AFF] ring-blue-200' : 'bg-white text-[#8a9aab] ring-[#d9e3ec]'}`}>
                    {promo.code}
                  </span>
                </div>
                <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${promo.isActive ? 'bg-green-50 text-[#34c759] ring-1 ring-green-200' : 'bg-[#e8eef4] text-[#607282]'}`}>
                  {promo.isActive ? 'Live' : 'Expired'}
                </span>
              </div>

              <div className="mb-8">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] mb-1">Discount Value</p>
                <p className={`text-4xl font-black tracking-tighter ${promo.isActive ? 'text-[#1c2731]' : 'text-[#607282]'}`}>
                  {promo.discountType === 'flat' ? `৳${promo.discountValue}` : `${promo.discountValue}%`}
                  <span className="ml-2 text-lg font-bold text-[#8a9aab]">off</span>
                </p>
              </div>

              <div className="space-y-2 border-t border-[#e8eef4] pt-6">
                <div className="flex justify-between text-[12px] font-bold">
                  <span className="text-[#8a9aab]">Global Usage</span>
                  <span className={usagePercent >= 100 ? 'text-[#ff3b30]' : 'text-[#1c2731]'}>{promo.currentUses} / {promo.maxUses}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#f0f5fa] ring-1 ring-inset ring-[#e8eef4]">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${usagePercent >= 100 ? 'bg-[#ff3b30]' : usagePercent > 80 ? 'bg-[#ff9500]' : 'bg-[#007AFF]'}`} 
                    style={{ width: `${usagePercent}%` }} 
                  />
                </div>
                <p className="text-[11px] font-bold text-[#8a9aab] pt-2 flex items-center justify-between">
                  <span>Valid until</span>
                  <span className="text-[#607282]">{new Date(promo.validTo).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </p>
              </div>
              
            </article>
          )
        })}
      </div>
    </AdminLayout>
  )
}
