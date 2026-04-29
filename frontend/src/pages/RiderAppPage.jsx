import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { Card, Empty, Field, ListCard, NotificationItem, PaymentItem, ProfileGrid, RideItem, StatCard } from '../components/Ui'
import { TOKEN_KEY } from '../constants/auth'
import { apiRequest } from '../services/api'

export default function RiderAppPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('home')
  const [state, setState] = useState({ profile: {}, rides: [], payments: [], notifications: [] })
  const [message, setMessage] = useState('')

  const load = async () => {
    try {
      const [profileData, ridesData, paymentsData, notificationsData] = await Promise.all([
        apiRequest('/api/riders/profile'),
        apiRequest('/api/riders/rides'),
        apiRequest('/api/riders/payments'),
        apiRequest('/api/riders/notifications'),
      ])
      setState({
        profile: profileData.data || profileData.rider || {},
        rides: ridesData.data || ridesData.rides || [],
        payments: paymentsData.data || paymentsData.payments || [],
        notifications: notificationsData.data || notificationsData.notifications || [],
      })
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem(TOKEN_KEY)
        navigate('/rider/login')
        return
      }
      setMessage(error.message)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      navigate('/rider/login')
      return
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeRide = useMemo(
    () => state.rides.find((ride) => ['requested', 'accepted', 'arrived', 'started', 'driver_arrived', 'in_progress'].includes(String(ride.status || '').toLowerCase())),
    [state.rides]
  )

  const requestRide = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    try {
      await apiRequest('/api/rides', {
        method: 'POST',
        body: {
          pickup_address: formData.get('pickup_address'),
          dropoff_address: formData.get('dropoff_address'),
          pickup_lat: Number(formData.get('pickup_lat') || 0),
          pickup_lng: Number(formData.get('pickup_lng') || 0),
          dropoff_lat: Number(formData.get('dropoff_lat') || 0),
          dropoff_lng: Number(formData.get('dropoff_lng') || 0),
          fare: Number(formData.get('fare') || 0),
          payment_method: formData.get('payment_method') || 'cash',
        },
      })
      event.currentTarget.reset()
      setMessage('Ride requested successfully.')
      setView('active')
      load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const cancelRide = async () => {
    if (!activeRide?._id && !activeRide?.id) return
    try {
      await apiRequest(`/api/rides/${activeRide._id || activeRide.id}/cancel`, {
        method: 'PATCH',
        body: { reason: 'Cancelled from rider app UI' },
      })
      setView('history')
      load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    navigate('/rider/login')
  }

  const views = ['home', 'book', 'active', 'history', 'payments', 'notifications', 'profile']

  return (
    <Layout
      title="Rider App"
      subtitle={`Welcome ${state.profile.name || state.profile.full_name || 'Rider'} (${state.profile.status || 'active'})`}
      actions={<button onClick={logout} className="rounded-md border border-[#c4d4e2] bg-white px-3 py-2 text-sm font-semibold text-[#28526d] transition-colors hover:border-[#1092ce] hover:text-[#1092ce]">Logout</button>}
    >
      <div className="grid grid-cols-2 md:grid-cols-7 gap-2 mb-3">
        {views.map((item) => (
          <button key={item} onClick={() => setView(item)} className={`min-h-[42px] rounded-lg border text-sm font-semibold capitalize transition-colors ${view === item ? 'border-[#1092ce] bg-[#1092ce] text-white' : 'border-[#c7d6e4] bg-white text-[#355066] hover:border-[#1092ce] hover:text-[#1092ce]'}`}>
            {item}
          </button>
        ))}
      </div>

      {message ? <div className="mb-3 rounded-md border border-[#d7c4c4] bg-[#fff7f7] px-3 py-2 text-sm text-[#8f3d3d]">{message}</div> : null}

      {view === 'home' ? (
        <div className="grid gap-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <StatCard label="Total rides" value={state.rides.length} />
            <StatCard label="Payments" value={state.payments.length} />
            <StatCard label="Notifications" value={state.notifications.length} />
          </div>
          <Card title="Latest Ride">{state.rides[0] ? <RideItem ride={state.rides[0]} /> : <Empty text="No rides yet." />}</Card>
        </div>
      ) : null}

      {view === 'book' ? (
        <Card title="Book Ride">
          <form onSubmit={requestRide} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field name="pickup_address" placeholder="Pickup address" />
            <Field name="dropoff_address" placeholder="Dropoff address" />
            <Field name="pickup_lat" placeholder="Pickup lat" />
            <Field name="pickup_lng" placeholder="Pickup lng" />
            <Field name="dropoff_lat" placeholder="Dropoff lat" />
            <Field name="dropoff_lng" placeholder="Dropoff lng" />
            <Field name="fare" placeholder="Estimated fare" />
            <select name="payment_method" className="h-11 rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 text-[#1f2e3a] outline-none focus:border-[#1092ce]">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bkash">Bkash</option>
            </select>
            <button className="md:col-span-2 rounded-md bg-[#1092ce] py-2 font-semibold text-white shadow-[0_10px_18px_rgba(16,146,206,0.24)] transition-colors hover:bg-[#0d80b4]">Request Ride</button>
          </form>
        </Card>
      ) : null}

      {view === 'active' ? (
        <Card title="Active Ride" actions={<button onClick={cancelRide} className="rounded-md border border-[#d7b8b8] bg-[#fff8f8] px-3 py-1 text-sm font-semibold text-[#a04444]">Cancel</button>}>
          {activeRide ? <RideItem ride={activeRide} /> : <Empty text="No active ride right now." />}
        </Card>
      ) : null}

      {view === 'history' ? <ListCard title="Ride History" items={state.rides} render={(item) => <RideItem ride={item} />} empty="No rides found." /> : null}
      {view === 'payments' ? <ListCard title="Payments" items={state.payments} render={(item) => <PaymentItem payment={item} />} empty="No payment records available." /> : null}
      {view === 'notifications' ? <ListCard title="Notifications" items={state.notifications} render={(item) => <NotificationItem item={item} />} empty="No notifications available." /> : null}
      {view === 'profile' ? <Card title="Profile"><ProfileGrid profile={state.profile} /></Card> : null}
    </Layout>
  )
}
