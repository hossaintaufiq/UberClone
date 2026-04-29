import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { LiveRideMap } from '../components/Maps'
import { Card, ListCard, NotificationItem, RideItem, StatCard } from '../components/Ui'
import { DRIVER_TOKEN_KEY, TOKEN_KEY } from '../constants/auth'
import { apiRequest } from '../services/api'

export default function DriverDashboardPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('overview')
  const [message, setMessage] = useState('')
  const [state, setState] = useState({
    profile: {},
    rides: [],
    rideRequests: [],
    earnings: {},
    documents: [],
    notifications: [],
  })
  const [activeRideChat, setActiveRideChat] = useState([])
  const [track, setTrack] = useState(null)

  const load = async () => {
    try {
      const [profile, rides, rideRequests, earnings, documents, notifications] = await Promise.all([
        apiRequest('/api/driver/profile'),
        apiRequest('/api/driver/rides'),
        apiRequest('/api/driver/ride-requests'),
        apiRequest('/api/driver/earnings'),
        apiRequest('/api/driver/documents'),
        apiRequest('/api/driver/notifications'),
      ])
      setState({
        profile: profile.data || {},
        rides: rides.data || [],
        rideRequests: rideRequests.data || [],
        earnings: earnings.data || {},
        documents: documents.data || [],
        notifications: notifications.data || [],
      })
    } catch (error) {
      if (error.status === 401 || error.status === 403) {
        localStorage.removeItem(DRIVER_TOKEN_KEY)
        navigate('/driver/login')
        return
      }
      setMessage(error.message)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem(DRIVER_TOKEN_KEY)
    if (!token) {
      navigate('/driver/login')
      return
    }
    localStorage.setItem(TOKEN_KEY, token)
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleOnline = async () => {
    try {
      await apiRequest('/api/driver/go-online', { method: 'PATCH' })
      setMessage('Online status updated.')
      load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const logout = () => {
    localStorage.removeItem(DRIVER_TOKEN_KEY)
    localStorage.removeItem(TOKEN_KEY)
    navigate('/driver/login')
  }

  const totalEarnings = useMemo(() => Number(state.earnings.total_earnings || 0).toLocaleString(), [state.earnings.total_earnings])
  const activeRide = useMemo(() => state.rides.find((ride) => ['accepted', 'arrived', 'ongoing', 'started'].includes(String(ride.status || '').toLowerCase())), [state.rides])
  const views = ['overview', 'rides', 'documents', 'notifications', 'profile']

  const respondRide = async (rideId, action) => {
    try {
      await apiRequest(`/api/rides/${rideId}/${action}`, { method: 'PATCH' })
      setMessage(`Ride ${action}ed.`)
      load()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const loadChat = async (rideId) => {
    if (!rideId) return setActiveRideChat([])
    try {
      const data = await apiRequest(`/api/rides/${rideId}/chat`)
      setActiveRideChat(data.data || [])
    } catch {
      setActiveRideChat([])
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

  useEffect(() => {
    loadChat(activeRide?._id)
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
      title="Driver Dashboard"
      subtitle="Unified light-blue dashboard connected to your driver account."
      actions={
        <div className="flex gap-2">
          <button onClick={toggleOnline} className="rounded-md border border-[#9dd0ee] bg-[#eaf7ff] px-3 py-2 text-sm font-semibold text-[#1f709f] transition-colors hover:bg-[#d6f0ff]">
            {state.profile.isOnline ? 'Go Offline' : 'Go Online'}
          </button>
          <button onClick={logout} className="rounded-md border border-[#c6def0] bg-white px-3 py-2 text-sm font-semibold text-[#28526d] transition-colors hover:border-[#3aa7e8] hover:text-[#2a95d2]">
            Logout
          </button>
        </div>
      }
    >
      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        {views.map((item) => (
          <button key={item} onClick={() => setView(item)} className={`min-h-[42px] rounded-lg border text-sm font-semibold capitalize transition-colors ${view === item ? 'border-[#36a7e6] bg-[#36a7e6] text-white' : 'border-[#c7dcec] bg-white text-[#355066] hover:border-[#36a7e6] hover:text-[#2a95d2]'}`}>
            {item}
          </button>
        ))}
      </div>

      {message ? <div className="mb-3 rounded-md border border-[#d3e9f7] bg-[#f2faff] px-3 py-2 text-sm text-[#2a6f97]">{message}</div> : null}

      {view === 'overview' ? (
        <div className="grid gap-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <StatCard label="Completed rides" value={state.earnings.completed_rides || 0} />
            <StatCard label="Total earnings" value={`BDT ${totalEarnings}`} />
            <StatCard label="Notifications" value={state.notifications.length} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Card title="Ride Requests">
              <div className="grid gap-2">
                {state.rideRequests.length ? state.rideRequests.map((ride) => (
                  <div key={ride._id} className="rounded-lg border border-[#d9e8f3] bg-[#f4fbff] p-3">
                    <p className="text-sm font-semibold text-[#1f2d39]">{ride.pickupAddress} to {ride.dropoffAddress}</p>
                    <p className="text-xs text-[#607281]">{ride.rideType} | BDT {Number(ride.fare || 0).toLocaleString()}</p>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => respondRide(ride._id, 'accept')} className="rounded-md bg-[#36a7e6] px-3 py-1 text-xs font-semibold text-white">Accept</button>
                      <button onClick={() => respondRide(ride._id, 'reject')} className="rounded-md border border-[#e4bcbc] bg-[#fff6f6] px-3 py-1 text-xs font-semibold text-[#a14545]">Reject</button>
                    </div>
                  </div>
                )) : <p className="text-sm text-[#607281]">No pending requests.</p>}
              </div>
            </Card>
            <Card title="Live Ride & Chat">
              {activeRide ? (
                <div className="grid gap-2">
                  <RideItem ride={activeRide} />
                  <LiveRideMap
                    pickup={{ lat: Number(activeRide.pickupLat || 0), lng: Number(activeRide.pickupLng || 0) }}
                    dropoff={{ lat: Number(activeRide.dropoffLat || 0), lng: Number(activeRide.dropoffLng || 0) }}
                    driver={{
                      lat: Number(track?.driverId?.location?.lat || state.profile?.location?.lat || 0),
                      lng: Number(track?.driverId?.location?.lng || state.profile?.location?.lng || 0),
                    }}
                  />
                  <div className="h-36 overflow-auto rounded-lg border border-[#d9e8f3] bg-[#f9fcff] p-2">
                    {activeRideChat.length ? activeRideChat.map((item, idx) => (
                      <p key={idx} className="mb-1 text-sm text-[#355066]"><span className="font-semibold capitalize">{item.senderRole}:</span> {item.message}</p>
                    )) : <p className="text-sm text-[#6b7d8d]">No messages yet.</p>}
                  </div>
                  <form onSubmit={sendChat} className="flex gap-2">
                    <input name="message" className="h-10 flex-1 rounded-md border border-[#cfd9e4] bg-white px-3 text-[#1f2e3a] outline-none focus:border-[#36a7e6]" placeholder="Reply to user..." />
                    <button className="rounded-md bg-[#36a7e6] px-4 text-sm font-semibold text-white">Send</button>
                  </form>
                </div>
              ) : <p className="text-sm text-[#607281]">No active ride right now.</p>}
            </Card>
          </div>
        </div>
      ) : null}

      {view === 'rides' ? <ListCard title="Ride History" items={state.rides} render={(item) => <RideItem ride={item} />} empty="No rides found." /> : null}

      {view === 'documents' ? (
        <Card title="Documents">
          <div className="grid gap-2">
            {state.documents.length ? state.documents.map((item, index) => (
              <article key={item._id || index} className="rounded-xl border border-[#d9e8f3] bg-[#f4fbff] p-4">
                <p className="font-semibold text-[#1f2d39]">{item.name || 'Document'}</p>
                <p className="text-sm text-[#607281]">{item.verified ? 'Verified' : 'Pending verification'}</p>
              </article>
            )) : <p className="text-sm text-[#607281]">No documents uploaded.</p>}
          </div>
        </Card>
      ) : null}

      {view === 'notifications' ? <ListCard title="Notifications" items={state.notifications} render={(item) => <NotificationItem item={item} />} empty="No notifications available." /> : null}

      {view === 'profile' ? (
        <Card title="Driver Profile">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div className="rounded-lg border border-[#d9e8f3] bg-[#f4fbff] p-3"><p className="text-xs text-[#6f8191]">Name</p><p className="font-semibold text-[#1f2d39]">{state.profile.name || 'Driver'}</p></div>
            <div className="rounded-lg border border-[#d9e8f3] bg-[#f4fbff] p-3"><p className="text-xs text-[#6f8191]">Phone</p><p className="font-semibold text-[#1f2d39]">{state.profile.phone || 'Not set'}</p></div>
            <div className="rounded-lg border border-[#d9e8f3] bg-[#f4fbff] p-3"><p className="text-xs text-[#6f8191]">Email</p><p className="font-semibold text-[#1f2d39]">{state.profile.email || 'Not set'}</p></div>
            <div className="rounded-lg border border-[#d9e8f3] bg-[#f4fbff] p-3"><p className="text-xs text-[#6f8191]">Status</p><p className="font-semibold text-[#1f2d39]">{state.profile.isOnline ? 'Online' : 'Offline'}</p></div>
          </div>
        </Card>
      ) : null}
    </Layout>
  )
}
