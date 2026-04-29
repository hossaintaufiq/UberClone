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
  })

  const load = async () => {
    try {
      const [dashboard, revenue, riders, drivers, rides, complaints] = await Promise.all([
        apiRequest('/api/admin/dashboard'),
        apiRequest('/api/admin/revenue'),
        apiRequest('/api/admin/riders'),
        apiRequest('/api/admin/drivers'),
        apiRequest('/api/admin/rides'),
        apiRequest('/api/admin/complaints'),
      ])
      setState({
        dashboard: dashboard.data || {},
        revenue: revenue.data || {},
        riders: riders.data || [],
        drivers: drivers.data || [],
        rides: rides.data || [],
        complaints: complaints.data || [],
      })
    } catch (error) {
      setMessage(error.message)
    }
  }

  useEffect(() => {
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const totalRevenue = useMemo(() => Number(state.revenue.total_revenue || 0).toLocaleString(), [state.revenue.total_revenue])

  const logout = () => {
    navigate('/')
  }

  const views = ['overview', 'riders', 'drivers', 'rides', 'complaints']

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
    </Layout>
  )
}
