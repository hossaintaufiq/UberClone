import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { LiveRideMap, RideMapPicker } from '../components/Maps'
import { Card, Empty, Field, ListCard, NotificationItem, PaymentItem, ProfileGrid, RideItem, StatCard } from '../components/Ui'
import { TOKEN_KEY } from '../constants/auth'
import { apiRequest } from '../services/api'

export default function RiderAppPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('home')
  const [state, setState] = useState({ profile: {}, rides: [], payments: [], notifications: [] })
  const [message, setMessage] = useState('')
  const [chat, setChat] = useState([])
  const [bookingPoints, setBookingPoints] = useState({ pickup: null, dropoff: null })
  const [track, setTrack] = useState(null)

  const load = async () => {
    try {
      const [profileData, ridesData, paymentsData, notificationsData] = await Promise.all([
        apiRequest('/api/user/profile'),
        apiRequest('/api/user/rides'),
        apiRequest('/api/user/payments'),
        apiRequest('/api/user/notifications'),
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
        navigate('/user/login')
        return
      }
      setMessage(error.message)
    }
  }

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      navigate('/user/login')
      return
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeRide = useMemo(() => state.rides.find((ride) => ['requested', 'accepted', 'arrived', 'started', 'ongoing', 'driver_arrived', 'in_progress'].includes(String(ride.status || '').toLowerCase())), [state.rides])

  const loadChat = async (rideId) => {
    try {
      const data = await apiRequest(`/api/rides/${rideId}/chat`)
      setChat(data.data || [])
    } catch {
      setChat([])
    }
  }

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
          distance_km: Number(formData.get('distance_km') || 0),
          ride_type: formData.get('ride_type') || 'single',
          promo_code: formData.get('promo_code') || '',
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

  const sendChat = async (event) => {
    event.preventDefault()
    if (!activeRide?._id) return
    const form = new FormData(event.currentTarget)
    const messageText = String(form.get('message') || '').trim()
    if (!messageText) return
    try {
      await apiRequest(`/api/rides/${activeRide._id}/chat`, { method: 'POST', body: { message: messageText } })
      event.currentTarget.reset()
      loadChat(activeRide._id)
    } catch (error) {
      setMessage(error.message)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    navigate('/user/login')
  }

  const views = ['home', 'book', 'active', 'history', 'payments', 'notifications', 'profile']

  useEffect(() => {
    if (activeRide?._id) loadChat(activeRide._id)
  }, [activeRide?._id])

  useEffect(() => {
    if (!activeRide?._id) return
    let alive = true
    const tick = async () => {
      try {
        const data = await apiRequest(`/api/rides/${activeRide._id}/track`)
        if (alive) setTrack(data.data || null)
      } catch {
        if (alive) setTrack(null)
      }
    }
    tick()
    const id = setInterval(tick, 8000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [activeRide?._id])

  return (
    <Layout
      title="User App"
      subtitle={`Welcome ${state.profile.name || state.profile.full_name || 'User'} (${state.profile.status || 'active'})`}
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
            <Field name="pickup_lat" placeholder="Pickup lat" value={bookingPoints.pickup?.lat || ''} readOnly />
            <Field name="pickup_lng" placeholder="Pickup lng" value={bookingPoints.pickup?.lng || ''} readOnly />
            <Field name="dropoff_lat" placeholder="Dropoff lat" value={bookingPoints.dropoff?.lat || ''} readOnly />
            <Field name="dropoff_lng" placeholder="Dropoff lng" value={bookingPoints.dropoff?.lng || ''} readOnly />
            <Field name="distance_km" placeholder="Distance (km)" />
            <select name="ride_type" className="h-11 rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 text-[#1f2e3a] outline-none focus:border-[#1092ce]">
              <option value="single">Single</option>
              <option value="share">Share</option>
              <option value="family">Family</option>
              <option value="intercity-reserve">Intercity Reserve</option>
              <option value="intercity-day-trip">Intercity Day Trip</option>
              <option value="intercity-inside-city">Intercity Inside City</option>
            </select>
            <select name="payment_method" className="h-11 rounded-md border border-[#cfd9e4] bg-[#f7fbff] px-3 text-[#1f2e3a] outline-none focus:border-[#1092ce]">
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bkash">Bkash</option>
            </select>
            <Field name="promo_code" placeholder="Promo code (optional)" />
            <div className="md:col-span-2">
              <RideMapPicker
                pickup={bookingPoints.pickup}
                dropoff={bookingPoints.dropoff}
                onPickupChange={(point) => setBookingPoints((p) => ({ ...p, pickup: point }))}
                onDropoffChange={(point) => setBookingPoints((p) => ({ ...p, dropoff: point }))}
              />
            </div>
            <button className="md:col-span-2 rounded-md bg-[#1092ce] py-2 font-semibold text-white shadow-[0_10px_18px_rgba(16,146,206,0.24)] transition-colors hover:bg-[#0d80b4]">Request Ride</button>
          </form>
        </Card>
      ) : null}

      {view === 'active' ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Card title="Active Ride" actions={<button onClick={cancelRide} className="rounded-md border border-[#d7b8b8] bg-[#fff8f8] px-3 py-1 text-sm font-semibold text-[#a04444]">Cancel</button>}>
            {activeRide ? (
              <div className="grid gap-3">
                <RideItem ride={activeRide} />
                <div className="rounded-lg border border-[#d9e8f3] bg-[#f4fbff] p-3 text-sm text-[#486075]">
                  <p>Tracking status: <span className="font-semibold capitalize">{activeRide.status}</span></p>
                  <p>Estimated fare: <span className="font-semibold">BDT {Number(activeRide.estimatedFare || activeRide.fare || 0).toLocaleString()}</span></p>
                  <p>Current fare: <span className="font-semibold">BDT {Number(activeRide.fare || 0).toLocaleString()}</span></p>
                </div>
                <LiveRideMap
                  pickup={{ lat: Number(activeRide.pickupLat || 0), lng: Number(activeRide.pickupLng || 0) }}
                  dropoff={{ lat: Number(activeRide.dropoffLat || 0), lng: Number(activeRide.dropoffLng || 0) }}
                  driver={{
                    lat: Number(track?.driverId?.location?.lat || 0),
                    lng: Number(track?.driverId?.location?.lng || 0),
                  }}
                />
              </div>
            ) : <Empty text="No active ride right now." />}
          </Card>
          <Card title="Chat with Driver">
            {activeRide ? (
              <div className="grid gap-2">
                <div className="h-52 overflow-auto rounded-lg border border-[#d9e8f3] bg-[#f9fcff] p-2">
                  {chat.length ? chat.map((item, idx) => (
                    <p key={idx} className="mb-1 text-sm text-[#355066]"><span className="font-semibold capitalize">{item.senderRole}:</span> {item.message}</p>
                  )) : <p className="text-sm text-[#6b7d8d]">No messages yet.</p>}
                </div>
                <form onSubmit={sendChat} className="flex gap-2">
                  <input name="message" className="h-10 flex-1 rounded-md border border-[#cfd9e4] bg-white px-3 text-[#1f2e3a] outline-none focus:border-[#1092ce]" placeholder="Type message..." />
                  <button className="rounded-md bg-[#1092ce] px-4 text-sm font-semibold text-white">Send</button>
                </form>
              </div>
            ) : <Empty text="Chat appears when a ride is active." />}
          </Card>
        </div>
      ) : null}

      {view === 'history' ? <ListCard title="Ride History" items={state.rides} render={(item) => <RideItem ride={item} />} empty="No rides found." /> : null}
      {view === 'payments' ? <ListCard title="Payments" items={state.payments} render={(item) => <PaymentItem payment={item} />} empty="No payment records available." /> : null}
      {view === 'notifications' ? <ListCard title="Notifications" items={state.notifications} render={(item) => <NotificationItem item={item} />} empty="No notifications available." /> : null}
      {view === 'profile' ? <Card title="Profile"><ProfileGrid profile={state.profile} /></Card> : null}
    </Layout>
  )
}
