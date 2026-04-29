import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, ListCard, StatCard } from '../components/Ui'
import { apiRequest } from '../services/api'

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('overview')
  const [message, setMessage] = useState('')
  const [state, setState] = useState({
    dashboard: {},
    revenue: {},
    riders: [],
    drivers: [],
    rides: [],
    complaints: [],
    config: { perKmFare: 40, commissionRate: 0.05, promoCodes: [] },
  })

  const load = async () => {
    try {
      const [dashboard, revenue, riders, drivers, rides, complaints, config] = await Promise.all([
        apiRequest('/api/admin/dashboard'),
        apiRequest('/api/admin/revenue'),
        apiRequest('/api/admin/riders'),
        apiRequest('/api/admin/drivers'),
        apiRequest('/api/admin/rides'),
        apiRequest('/api/admin/complaints'),
        apiRequest('/api/admin/config'),
      ])
      setState({
        dashboard: dashboard.data || {},
        revenue: revenue.data || {},
        riders: riders.data || [],
        drivers: drivers.data || [],
        rides: rides.data || [],
        complaints: complaints.data || [],
        config: config.data || { perKmFare: 40, commissionRate: 0.05, promoCodes: [] },
      })
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalRevenue = useMemo(() => Number(state.revenue.total_revenue || 0).toLocaleString(), [state.revenue.total_revenue])
  const chartData = useMemo(
    () => [
      { label: 'Daily', value: Number(state.revenue.daily || 0) },
      { label: 'Weekly', value: Number(state.revenue.weekly || 0) },
      { label: 'Monthly', value: Number(state.revenue.monthly || 0) },
    ],
    [state.revenue.daily, state.revenue.weekly, state.revenue.monthly]
  )
  const maxChart = useMemo(() => Math.max(...chartData.map((x) => x.value), 1), [chartData])

  const logout = () => {
    navigate('/')
  }

  const updateSystemConfig = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await apiRequest('/api/admin/config', {
        method: 'PATCH',
        body: {
          per_km_fare: Number(form.get('per_km_fare') || 40),
          commission_rate: Number(form.get('commission_rate') || 0.05),
        },
      })
      setMessage('System configuration updated.')
      load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const createPromoCode = async (event) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await apiRequest('/api/admin/promo-codes', {
        method: 'POST',
        body: {
          code: form.get('code'),
          discount_percent: Number(form.get('discount_percent') || 0),
        },
      })
      setMessage('Promo code created.')
      event.currentTarget.reset()
      load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const views = ['overview', 'riders', 'drivers', 'rides', 'complaints', 'controls']

  return (
    <Layout
      title="Admin Dashboard"
      subtitle="Unified light-blue command center for platform operations."
      actions={<button onClick={logout} className="rounded-md border border-[#c6def0] bg-white px-3 py-2 text-sm font-semibold text-[#28526d] transition-colors hover:border-[#3aa7e8] hover:text-[#2a95d2]">Logout</button>}
    >
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        {views.map((item) => (
          <button key={item} onClick={() => setView(item)} className={`min-h-[42px] rounded-lg border text-sm font-semibold capitalize transition-colors ${view === item ? 'border-[#36a7e6] bg-[#36a7e6] text-white' : 'border-[#c7dcec] bg-white text-[#355066] hover:border-[#36a7e6] hover:text-[#2a95d2]'}`}>
            {item}
          </button>
        ))}
      </div>

      {message ? <div className="mb-3 rounded-md border border-[#e7c8c8] bg-[#fff8f8] px-3 py-2 text-sm text-[#a34141]">{message}</div> : null}

      {view === 'overview' ? (
        <div className="grid gap-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatCard label="Riders" value={state.dashboard.riders || 0} />
            <StatCard label="Drivers" value={state.dashboard.drivers || 0} />
            <StatCard label="Rides" value={state.dashboard.rides || 0} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatCard label="Complaints" value={state.dashboard.complaints || 0} />
            <StatCard label="Total Revenue" value={`BDT ${totalRevenue}`} />
            <StatCard label="Payments" value={state.revenue.total_payments || 0} />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Card title="Revenue Trends">
              <div className="grid gap-2">
                {chartData.map((item) => (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-sm text-[#466177]">
                      <span>{item.label}</span>
                      <span>BDT {item.value.toLocaleString()}</span>
                    </div>
                    <div className="h-3 rounded-full bg-[#e4f1fa]">
                      <div className="h-3 rounded-full bg-gradient-to-r from-[#6bc0ff] to-[#36a7e6]" style={{ width: `${(item.value / maxChart) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Profit / Loss Snapshot">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-[#d9e8f3] bg-[#f4fbff] p-3">
                  <p className="text-xs text-[#6f8191]">Estimated Profit</p>
                  <p className="text-xl font-bold text-[#1f2d39]">BDT {Number(state.revenue.profit || 0).toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-[#f1d9d9] bg-[#fff7f7] p-3">
                  <p className="text-xs text-[#9d6e6e]">Estimated Loss</p>
                  <p className="text-xl font-bold text-[#8e4f4f]">BDT {Number(state.revenue.loss || 0).toLocaleString()}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {view === 'riders' ? (
        <ListCard
          title="Riders"
          items={state.riders}
          empty="No rider data."
          render={(item) => (
            <article className="rounded-xl border border-[#d9e8f3] bg-[#f4fbff] p-4">
              <p className="font-semibold text-[#1f2d39]">{item.name || 'Rider'}</p>
              <p className="text-sm text-[#607281]">{item.phone || 'No phone'} | {item.email || 'No email'}</p>
            </article>
          )}
        />
      ) : null}

      {view === 'drivers' ? (
        <ListCard
          title="Drivers"
          items={state.drivers}
          empty="No driver data."
          render={(item) => (
            <article className="rounded-xl border border-[#d9e8f3] bg-[#f4fbff] p-4">
              <p className="font-semibold text-[#1f2d39]">{item.name || 'Driver'}</p>
              <p className="text-sm text-[#607281]">{item.phone || 'No phone'} | {item.isActive ? 'Active' : 'Inactive'}</p>
            </article>
          )}
        />
      ) : null}

      {view === 'rides' ? (
        <ListCard
          title="Rides"
          items={state.rides}
          empty="No ride data."
          render={(item) => (
            <article className="rounded-xl border border-[#d9e8f3] bg-[#f4fbff] p-4">
              <p className="font-semibold text-[#1f2d39]">{item.pickupAddress || item.pickup_address || 'Pickup'} to {item.dropoffAddress || item.dropoff_address || 'Dropoff'}</p>
              <p className="text-sm text-[#607281]">{item.status || 'unknown'} | BDT {Number(item.fare || 0).toLocaleString()}</p>
            </article>
          )}
        />
      ) : null}

      {view === 'complaints' ? (
        <Card title="Complaints">
          <div className="grid gap-2">
            {state.complaints.length ? state.complaints.map((item, index) => (
              <article key={item._id || index} className="rounded-xl border border-[#d9e8f3] bg-[#f4fbff] p-4">
                <p className="font-semibold text-[#1f2d39]">{item.type || 'Complaint'} ({item.status || 'open'})</p>
                <p className="text-sm text-[#607281]">{item.message || item.description || 'No details'}</p>
              </article>
            )) : <p className="text-sm text-[#607281]">No complaints found.</p>}
          </div>
        </Card>
      ) : null}

      {view === 'controls' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Card title="Fare & Commission">
            <form onSubmit={updateSystemConfig} className="grid gap-2">
              <input name="per_km_fare" defaultValue={state.config.perKmFare} type="number" step="0.01" className="h-11 rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 text-[#1f2e3a] outline-none focus:border-[#36a7e6]" placeholder="Per km fare" />
              <input name="commission_rate" defaultValue={state.config.commissionRate} type="number" step="0.01" className="h-11 rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 text-[#1f2e3a] outline-none focus:border-[#36a7e6]" placeholder="Commission rate" />
              <button className="rounded-md bg-[#36a7e6] py-2.5 font-semibold text-white">Save Config</button>
            </form>
          </Card>
          <Card title="Promo Codes">
            <form onSubmit={createPromoCode} className="grid gap-2">
              <input name="code" className="h-11 rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 text-[#1f2e3a] outline-none focus:border-[#36a7e6]" placeholder="Code e.g. SAVE10" />
              <input name="discount_percent" type="number" className="h-11 rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 text-[#1f2e3a] outline-none focus:border-[#36a7e6]" placeholder="Discount %" />
              <button className="rounded-md bg-[#36a7e6] py-2.5 font-semibold text-white">Create Promo</button>
            </form>
            <div className="mt-3 grid gap-2">
              {(state.config.promoCodes || []).map((promo, idx) => (
                <div key={`${promo.code}-${idx}`} className="rounded-lg border border-[#d9e8f3] bg-[#f4fbff] px-3 py-2 text-sm text-[#355066]">
                  {promo.code} - {promo.discountPercent}% - {promo.active ? 'Active' : 'Disabled'}
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </Layout>
  )
}
