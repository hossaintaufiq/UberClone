import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { TOKEN_KEY } from '../constants/auth'
import { apiRequest } from '../services/api'
import { User, Users, UsersRound, Building2, Route, Sun, Home, Car, MapPin, ClipboardList, Banknote, Bell, UserCircle, MessageCircle, Lightbulb, Map as MapIcon, Compass, Navigation, ArrowRight } from 'lucide-react'

const rideTypes = [
  { key: 'single', label: 'Single', icon: <User size={28} />, desc: 'Solo ride' },
  { key: 'share', label: 'Share', icon: <Users size={28} />, desc: 'Split fare' },
  { key: 'family', label: 'Family', icon: <UsersRound size={28} />, desc: 'Group ride' },
]

const tripCategories = [
  { key: 'city', label: 'Inside City', icon: <Building2 size={24} /> },
  { key: 'intercity_reserve', label: 'Intercity', icon: <Route size={24} /> },
  { key: 'daytrip', label: 'Day Trip', icon: <Sun size={24} /> },
]

export default function RiderAppPage() {
  const navigate = useNavigate()
  const [view, setView] = useState('home')
  const [state, setState] = useState({ profile: {}, rides: [], payments: [], notifications: [] })
  const [message, setMessage] = useState('')
  const [selectedRideType, setSelectedRideType] = useState('single')
  const [selectedTrip, setSelectedTrip] = useState('city')
  const [promoCode, setPromoCode] = useState('')

  const load = async () => {
    try {
      const [profileData, ridesData, paymentsData, notificationsData] = await Promise.all([
        apiRequest('/api/riders/profile', { tokenKey: TOKEN_KEY }),
        apiRequest('/api/riders/rides', { tokenKey: TOKEN_KEY }),
        apiRequest('/api/riders/payments', { tokenKey: TOKEN_KEY }),
        apiRequest('/api/riders/notifications', { tokenKey: TOKEN_KEY }),
      ])
      setState({
        profile: profileData.data || {},
        rides: ridesData.data || [],
        payments: paymentsData.data || [],
        notifications: notificationsData.data || [],
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
    if (!localStorage.getItem(TOKEN_KEY)) { navigate('/rider/login'); return }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const activeRide = useMemo(
    () => state.rides.find((ride) => ['requested', 'accepted', 'arrived', 'started'].includes(String(ride.status || '').toLowerCase())),
    [state.rides]
  )

  const requestRide = async (event) => {
    event.preventDefault()
    const fd = new FormData(event.currentTarget)
    try {
      await apiRequest('/api/rides', {
        method: 'POST',
        body: {
          pickup_address: fd.get('pickup_address'),
          dropoff_address: fd.get('dropoff_address'),
          pickup_lat: Number(fd.get('pickup_lat') || 0),
          pickup_lng: Number(fd.get('pickup_lng') || 0),
          dropoff_lat: Number(fd.get('dropoff_lat') || 0),
          dropoff_lng: Number(fd.get('dropoff_lng') || 0),
          fare: Number(fd.get('fare') || 0),
          payment_method: fd.get('payment_method') || 'cash',
        },
        tokenKey: TOKEN_KEY,
      })
      event.currentTarget.reset()
      setMessage('Ride requested successfully!')
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
        body: { reason: 'Cancelled by rider' },
        tokenKey: TOKEN_KEY,
      })
      setMessage('Ride cancelled. ৳30 penalty will be added to your next ride.')
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

  const views = [
    { key: 'home', label: 'Overview', icon: <Home size={18} /> },
    { key: 'book', label: 'Book Ride', icon: <Compass size={18} /> },
    { key: 'active', label: 'Active', icon: <Navigation size={18} /> },
    { key: 'history', label: 'History', icon: <ClipboardList size={18} /> },
    { key: 'payments', label: 'Wallet', icon: <Banknote size={18} /> },
    { key: 'notifications', label: 'Alerts', icon: <Bell size={18} /> },
    { key: 'profile', label: 'Profile', icon: <UserCircle size={18} /> },
  ]

  const statusColors = {
    requested: 'bg-orange-50 text-[#ff9500] ring-1 ring-[#ff9500]/30',
    accepted: 'bg-blue-50 text-[#007AFF] ring-1 ring-[#007AFF]/30',
    arrived: 'bg-purple-50 text-[#5856d6] ring-1 ring-[#5856d6]/30',
    started: 'bg-green-50 text-[#34c759] ring-1 ring-[#34c759]/30',
    completed: 'bg-slate-100 text-[#607282] ring-1 ring-[#d9e3ec]',
    cancelled: 'bg-red-50 text-[#ff3b30] ring-1 ring-[#ff3b30]/30',
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#edf3f9] selection:bg-[#007AFF]/20 selection:text-[#007AFF]">
      
      {/* Floating Glass Header */}
      <header className="sticky top-0 z-40 bg-white/70 shadow-[0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-[1rem] bg-gradient-to-tr from-[#007AFF] to-[#0062CC] text-xl font-black text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)]">T</div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#1c2731]">Transitely</h1>
              <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#007AFF]">Rider App</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-3 rounded-full bg-white px-4 py-2 ring-1 ring-[#d9e3ec] sm:flex">
              <div className="h-2 w-2 animate-pulse rounded-full bg-[#34c759]"></div>
              <span className="text-[13px] font-bold text-[#1c2731]">{state.profile.name || 'User'}</span>
            </div>
            <button onClick={logout} className="rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-[#ff3b30] shadow-sm ring-1 ring-[#ffd4d4] transition-all hover:bg-[#ff3b30] hover:text-white active:scale-95">
              Logout
            </button>
          </div>
        </div>
        
        {/* Scrollable Nav Track */}
        <div className="border-t border-white/40 bg-white/40">
          <div className="scrollbar-hide mx-auto flex max-w-6xl gap-2 overflow-x-auto px-6 py-3">
            {views.map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold transition-all ${
                  view === v.key
                    ? 'bg-[#1c2731] text-white shadow-[0_8px_20px_rgba(28,39,49,0.3)]'
                    : 'bg-white text-[#607282] shadow-sm ring-1 ring-[#d9e3ec] hover:-translate-y-0.5 hover:text-[#1c2731] hover:shadow-md'
                }`}
              >
                <span>{v.icon}</span>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 pb-32 sm:pb-8">
        
        {/* Global Toast */}
        {message && (
          <div className="animate-in fade-in slide-in-from-top-4 relative mb-8 flex items-center justify-between overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-[#e8f4fd] to-white p-5 shadow-sm ring-1 ring-[#007AFF]/20">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-[#007AFF]"></div>
            <p className="text-[14px] font-bold text-[#007AFF]">{message}</p>
            <button onClick={() => setMessage('')} className="grid h-8 w-8 place-items-center rounded-full bg-blue-50 text-[#007AFF] transition-colors hover:bg-blue-100">✕</button>
          </div>
        )}

        {/* ===================== HOME VIEW ===================== */}
        {view === 'home' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[
                { label: 'Total Rides', value: state.rides.length, icon: <Car size={24} />, bg: 'bg-[#007AFF]/10', color: 'text-[#007AFF]' },
                { label: 'Active Ride', value: activeRide ? 'Yes' : 'None', icon: <MapPin size={24} />, bg: 'bg-[#34c759]/10', color: 'text-[#34c759]' },
                { label: 'Wallet Activity', value: state.payments.length, icon: <Banknote size={24} />, bg: 'bg-[#ff9500]/10', color: 'text-[#ff9500]' },
                { label: 'Alerts', value: state.notifications.length, icon: <Bell size={24} />, bg: 'bg-[#5856d6]/10', color: 'text-[#5856d6]' },
              ].map((c) => (
                <div key={c.label} className="group overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(0,122,255,0.08)]">
                  <div className={`mb-4 inline-flex rounded-2xl ${c.bg} p-3 transition-transform group-hover:scale-110`}>
                    <div className={c.color}>{c.icon}</div>
                  </div>
                  <p className="text-3xl font-black tracking-tighter text-[#1c2731]">{c.value}</p>
                  <p className="mt-1 text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">{c.label}</p>
                </div>
              ))}
            </div>

            {/* Active Ride Highlight */}
            {activeRide && (
              <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-[0_10px_40px_rgba(0,122,255,0.1)] ring-1 ring-[#007AFF]/20">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#007AFF]/10 blur-[60px]"></div>
                <div className="relative z-10">
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[#007AFF]/10 text-[#007AFF]">
                        <Navigation size={20} className="animate-pulse" />
                      </div>
                      <h2 className="text-2xl font-black text-[#1c2731]">Ride in Progress</h2>
                    </div>
                    <span className={`rounded-full px-4 py-1.5 text-[12px] font-black uppercase tracking-wider ${statusColors[activeRide.status]}`}>{activeRide.status}</span>
                  </div>
                  
                  <div className="mb-8 flex items-center gap-6 rounded-[1.5rem] bg-[#f8fafc] p-6 ring-1 ring-inset ring-[#d9e3ec]">
                    <div className="flex flex-1 flex-col justify-center">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Pickup</p>
                      <p className="text-lg font-bold text-[#1c2731]">{activeRide.pickupAddress}</p>
                    </div>
                    <ArrowRight className="text-[#007AFF] opacity-50" />
                    <div className="flex flex-1 flex-col justify-center text-right">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Dropoff</p>
                      <p className="text-lg font-bold text-[#1c2731]">{activeRide.dropoffAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Estimated Fare</p>
                      <p className="text-3xl font-black text-[#007AFF]">৳{Number(activeRide.fare || 0).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={cancelRide} className="rounded-2xl bg-[#fff5f5] px-6 py-3.5 text-[14px] font-bold text-[#ff3b30] shadow-sm ring-1 ring-[#ffd4d4] transition-all hover:bg-[#ff3b30] hover:text-white active:scale-95">Cancel (৳30 penalty)</button>
                      <Link to={`/rider/chat/${activeRide._id}`} className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#007AFF] to-[#0062CC] px-8 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)] transition-all hover:shadow-[0_12px_25px_rgba(0,122,255,0.4)] active:scale-95"><MessageCircle size={18} /> Driver Chat</Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loyalty Prompt */}
            <div className="group relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#e8f4fd] to-blue-50 p-6 shadow-sm ring-1 ring-[#007AFF]/20 transition-all hover:shadow-md sm:p-8">
              <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/40 to-transparent"></div>
              <div className="relative z-10 flex items-center gap-5">
                <div className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl bg-[#007AFF] text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)]">
                  <Banknote size={24} />
                </div>
                <div>
                  <p className="text-[12px] font-extrabold uppercase tracking-[0.15em] text-[#007AFF]">Loyalty Program</p>
                  <p className="mt-1 text-[15px] font-bold text-[#1c2731]">Book the same driver for your next destination and instantly get a <strong className="text-[#34c759]">5% cashback</strong> on the fare!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================== BOOK RIDE VIEW ===================== */}
        {view === 'book' && (
          <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 lg:grid-cols-[1fr_400px]">
            
            <div className="space-y-6">
              {/* Type Selection */}
              <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] sm:p-8">
                <h3 className="mb-6 text-xl font-black tracking-tight text-[#1c2731]">Select Ride Type</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {rideTypes.map((rt) => (
                    <button
                      key={rt.key}
                      onClick={() => setSelectedRideType(rt.key)}
                      className={`group relative overflow-hidden rounded-[1.5rem] p-6 text-left transition-all ${
                        selectedRideType === rt.key
                          ? 'bg-[#007AFF] shadow-[0_12px_25px_rgba(0,122,255,0.3)] ring-2 ring-[#007AFF] ring-offset-2'
                          : 'bg-[#f8fafc] shadow-sm ring-1 ring-[#d9e3ec] hover:-translate-y-1 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <div className={`mb-4 inline-flex rounded-xl p-3 transition-transform group-hover:scale-110 ${selectedRideType === rt.key ? 'bg-white/20 text-white' : 'bg-white text-[#007AFF] shadow-sm ring-1 ring-[#d9e3ec]'}`}>
                        {rt.icon}
                      </div>
                      <p className={`text-lg font-black ${selectedRideType === rt.key ? 'text-white' : 'text-[#1c2731]'}`}>{rt.label}</p>
                      <p className={`mt-1 text-[13px] font-medium ${selectedRideType === rt.key ? 'text-blue-100' : 'text-[#8a9aab]'}`}>{rt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] sm:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight text-[#1c2731]">Trip Category</h3>
                  {(selectedTrip === 'daytrip' || selectedTrip === 'intercity_reserve') && (
                    <Link to="/rider/chatbot" className="animate-pulse rounded-full bg-[#e8f4fd] px-4 py-1.5 text-[12px] font-bold text-[#007AFF] transition-colors hover:bg-[#007AFF] hover:text-white">
                      Ask AI Assistant ✨
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {tripCategories.map((tc) => (
                    <button
                      key={tc.key}
                      onClick={() => setSelectedTrip(tc.key)}
                      className={`flex flex-col items-center justify-center rounded-[1.5rem] p-5 text-center transition-all ${
                        selectedTrip === tc.key
                          ? 'bg-[#1c2731] text-white shadow-[0_8px_20px_rgba(28,39,49,0.3)]'
                          : 'bg-white text-[#607282] shadow-sm ring-1 ring-[#d9e3ec] hover:-translate-y-1 hover:shadow-md'
                      }`}
                    >
                      <div className={`mb-3 ${selectedTrip === tc.key ? 'text-[#007AFF]' : 'text-[#8a9aab]'}`}>{tc.icon}</div>
                      <p className={`text-[14px] font-bold ${selectedTrip === tc.key ? 'text-white' : 'text-[#1c2731]'}`}>{tc.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] sm:p-8">
              <h3 className="mb-6 text-xl font-black tracking-tight text-[#1c2731]">Route Details</h3>
              <form onSubmit={requestRide} className="space-y-4">
                
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#34c759]"><MapPin size={18} /></div>
                  <input name="pickup_address" className="w-full rounded-[1.2rem] bg-[#f8fafc] py-4 pl-12 pr-4 text-[15px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all placeholder:font-medium placeholder:text-[#a0b0c0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" placeholder="Pickup Address" required />
                </div>
                
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#ff3b30]"><MapIcon size={18} /></div>
                  <input name="dropoff_address" className="w-full rounded-[1.2rem] bg-[#f8fafc] py-4 pl-12 pr-4 text-[15px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all placeholder:font-medium placeholder:text-[#a0b0c0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" placeholder="Dropoff Address" required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-[1.2rem] bg-[#f8fafc] p-1 ring-1 ring-[#d9e3ec]">
                    <input name="pickup_lat" className="w-full bg-transparent px-3 py-2 text-[13px] font-medium text-[#1c2731] outline-none placeholder:text-[#a0b0c0]" placeholder="Pick Lat" />
                  </div>
                  <div className="rounded-[1.2rem] bg-[#f8fafc] p-1 ring-1 ring-[#d9e3ec]">
                    <input name="pickup_lng" className="w-full bg-transparent px-3 py-2 text-[13px] font-medium text-[#1c2731] outline-none placeholder:text-[#a0b0c0]" placeholder="Pick Lng" />
                  </div>
                  <div className="rounded-[1.2rem] bg-[#f8fafc] p-1 ring-1 ring-[#d9e3ec]">
                    <input name="dropoff_lat" className="w-full bg-transparent px-3 py-2 text-[13px] font-medium text-[#1c2731] outline-none placeholder:text-[#a0b0c0]" placeholder="Drop Lat" />
                  </div>
                  <div className="rounded-[1.2rem] bg-[#f8fafc] p-1 ring-1 ring-[#d9e3ec]">
                    <input name="dropoff_lng" className="w-full bg-transparent px-3 py-2 text-[13px] font-medium text-[#1c2731] outline-none placeholder:text-[#a0b0c0]" placeholder="Drop Lng" />
                  </div>
                </div>

                <div className="pt-2">
                  <p className="mb-2 text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Payment & Fare</p>
                  <div className="flex gap-4">
                    <div className="relative flex-1">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1c2731]"><span className="font-bold">৳</span></div>
                      <input name="fare" className="w-full rounded-[1.2rem] bg-[#f8fafc] py-3.5 pl-9 pr-4 text-[15px] font-black text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]" placeholder="Fare" />
                    </div>
                    <select name="payment_method" className="flex-1 rounded-[1.2rem] bg-[#f8fafc] px-4 py-3.5 text-[14px] font-bold text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all focus:outline-none focus:ring-2 focus:ring-[#007AFF]">
                      <option value="cash">Cash 💵</option>
                      <option value="card">Card 💳</option>
                      <option value="bkash">bKash 📱</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    className="flex-1 rounded-[1.2rem] bg-[#f8fafc] px-4 py-3.5 font-mono text-[14px] font-bold uppercase tracking-wider text-[#007AFF] shadow-sm ring-1 ring-[#d9e3ec] transition-all placeholder:font-sans placeholder:text-[14px] placeholder:font-medium placeholder:tracking-normal placeholder:text-[#a0b0c0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                    placeholder="Enter Promo Code"
                  />
                  <button type="button" className="rounded-[1.2rem] bg-[#1c2731] px-6 text-[13px] font-bold text-white shadow-md active:scale-95">Apply</button>
                </div>

                <button className="group mt-8 flex w-full items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-[#007AFF] to-[#0062CC] py-5 text-lg font-black text-white shadow-[0_8px_25px_rgba(0,122,255,0.35)] transition-all hover:shadow-[0_15px_35px_rgba(0,122,255,0.45)] active:scale-95">
                  Request {rideTypes.find(r => r.key === selectedRideType)?.label} Ride <Navigation size={20} className="transition-transform group-hover:translate-x-1" />
                </button>
              </form>
            </div>

          </div>
        )}

        {/* ===================== ACTIVE VIEW ===================== */}
        {view === 'active' && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            {activeRide ? (
              <div className="mx-auto max-w-2xl overflow-hidden rounded-[3rem] bg-white shadow-[0_15px_50px_rgb(0,0,0,0.06)] ring-1 ring-[#d9e3ec]">
                
                {/* Simulated Map Header */}
                <div className="relative h-64 w-full bg-[#e8f4fd] overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                  <div className="absolute h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200/40 via-transparent to-transparent"></div>
                  <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#007AFF] opacity-20"></span>
                      <Car size={32} className="text-[#007AFF]" />
                    </div>
                  </div>
                  <div className="absolute right-6 top-6">
                    <span className={`rounded-full px-4 py-2 text-[12px] font-black uppercase tracking-wider shadow-md backdrop-blur-md ${statusColors[activeRide.status]}`}>{activeRide.status}</span>
                  </div>
                </div>

                <div className="p-8 sm:p-10">
                  <div className="mb-8">
                    <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Route Tracking</p>
                    <div className="mt-4 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-green-50 ring-4 ring-white shadow-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#34c759]"></span>
                        </div>
                        <p className="text-xl font-bold text-[#1c2731]">{activeRide.pickupAddress}</p>
                      </div>
                      <div className="ml-5 h-8 border-l-[3px] border-dashed border-[#d9e3ec]"></div>
                      <div className="flex items-center gap-4">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-red-50 ring-4 ring-white shadow-sm">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#ff3b30]"></span>
                        </div>
                        <p className="text-xl font-bold text-[#1c2731]">{activeRide.dropoffAddress}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 rounded-[1.5rem] bg-[#f8fafc] p-6 ring-1 ring-inset ring-[#d9e3ec]">
                    <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Locked Fare</p>
                    <p className="mt-1 text-4xl font-black text-[#1c2731]">৳{Number(activeRide.fare || 0).toLocaleString()}</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link to={`/rider/chat/${activeRide._id}`} className="flex flex-1 items-center justify-center gap-2 rounded-[1.5rem] bg-gradient-to-r from-[#007AFF] to-[#0062CC] py-4 text-[15px] font-black text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)] transition-all hover:shadow-[0_12px_25px_rgba(0,122,255,0.4)] active:scale-95"><MessageCircle size={18} /> Open Driver Chat</Link>
                    <button onClick={cancelRide} className="rounded-[1.5rem] bg-white px-8 py-4 text-[15px] font-bold text-[#ff3b30] shadow-sm ring-1 ring-[#ffd4d4] transition-all hover:bg-[#fff5f5] active:scale-95">Cancel Ride</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto flex max-w-lg flex-col items-center justify-center rounded-[3rem] bg-white py-24 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec]">
                <div className="grid h-24 w-24 place-items-center rounded-[1.5rem] bg-[#f8fafc] text-[#8a9aab] ring-1 ring-[#d9e3ec]">
                  <Compass size={40} />
                </div>
                <h3 className="mt-6 text-2xl font-black tracking-tight text-[#1c2731]">No Active Rides</h3>
                <p className="mt-2 text-[15px] font-medium text-[#607282]">You are not currently on a trip.</p>
                <button onClick={() => setView('book')} className="mt-8 rounded-[1.5rem] bg-[#007AFF] px-8 py-4 text-[15px] font-bold text-white shadow-[0_8px_20px_rgba(0,122,255,0.3)] transition-all hover:shadow-[0_12px_25px_rgba(0,122,255,0.4)] active:scale-95">Book a Ride Now</button>
              </div>
            )}
          </div>
        )}

        {/* ===================== HISTORY VIEW ===================== */}
        {view === 'history' && (
          <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="mb-6 text-3xl font-black tracking-tight text-[#1c2731]">Trip History</h2>
            {state.rides.length === 0 ? (
              <div className="rounded-[2.5rem] border-2 border-dashed border-[#d9e3ec] bg-white/50 py-20 text-center text-[15px] font-bold text-[#8a9aab]">No past rides recorded.</div>
            ) : state.rides.map((ride) => (
              <div key={ride._id} className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-lg sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${statusColors[ride.status] || 'bg-slate-100 text-[#607282]'}`}>{ride.status}</span>
                      <span className="text-[12px] font-bold text-[#8a9aab]">{new Date(ride.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[15px] font-black text-[#1c2731]"><span className="text-[#8a9aab] font-medium mr-1">From:</span> {ride.pickupAddress}</p>
                      <p className="text-[15px] font-black text-[#1c2731]"><span className="text-[#8a9aab] font-medium mr-1">To:</span> {ride.dropoffAddress}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start sm:items-end">
                    <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Total Fare</p>
                    <p className="mt-1 text-3xl font-black tracking-tighter text-[#1c2731]">৳{Number(ride.fare || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================== PAYMENTS VIEW ===================== */}
        {view === 'payments' && (
          <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="mb-6 text-3xl font-black tracking-tight text-[#1c2731]">Digital Wallet</h2>
            {state.payments.length === 0 ? (
              <div className="rounded-[2.5rem] border-2 border-dashed border-[#d9e3ec] bg-white/50 py-20 text-center text-[15px] font-bold text-[#8a9aab]">No transactions recorded.</div>
            ) : state.payments.map((p) => (
              <div key={p._id} className="flex items-center justify-between rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-lg sm:p-8">
                <div className="flex items-center gap-5">
                  <div className="grid h-14 w-14 place-items-center rounded-[1.2rem] bg-blue-50 text-[#007AFF] ring-1 ring-[#007AFF]/20">
                    <Banknote size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-[#1c2731]">৳{Number(p.amount || 0).toLocaleString()}</p>
                    <p className="text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab] pl-1">{(p.method || 'cash')}</p>
                  </div>
                </div>
                <span className={`rounded-full px-4 py-1.5 text-[12px] font-black uppercase tracking-wider ${p.status === 'paid' ? 'bg-green-50 text-[#34c759] ring-1 ring-green-500/30' : 'bg-red-50 text-[#ff3b30] ring-1 ring-red-500/30'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* ===================== NOTIFICATIONS VIEW ===================== */}
        {view === 'notifications' && (
          <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black tracking-tight text-[#1c2731]">Alerts</h2>
              <span className="rounded-full bg-[#1c2731] px-4 py-1.5 text-[12px] font-black text-white">{state.notifications.length} New</span>
            </div>
            {state.notifications.length === 0 ? (
              <div className="rounded-[2.5rem] border-2 border-dashed border-[#d9e3ec] bg-white/50 py-20 text-center text-[15px] font-bold text-[#8a9aab]">You're all caught up.</div>
            ) : state.notifications.map((n) => (
              <div key={n._id} className="flex items-start gap-4 rounded-[2rem] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-[#d9e3ec] transition-all hover:bg-[#f8fafc]">
                <div className="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-[#007AFF] shadow-[0_0_10px_rgba(0,122,255,0.4)]"></div>
                <div>
                  <p className="text-[16px] font-black text-[#1c2731]">{n.title}</p>
                  <p className="mt-1 text-[14px] font-medium leading-relaxed text-[#607282]">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ===================== PROFILE VIEW ===================== */}
        {view === 'profile' && (
          <div className="mx-auto max-w-2xl animate-in fade-in slide-in-from-bottom-4">
            <div className="overflow-hidden rounded-[3rem] bg-white shadow-[0_15px_50px_rgb(0,0,0,0.06)] ring-1 ring-[#d9e3ec]">
              <div className="h-32 w-full bg-gradient-to-r from-[#007AFF] to-[#0062CC]"></div>
              <div className="px-8 pb-10 sm:px-12">
                <div className="-mt-16 mb-6 flex items-end justify-between">
                  <div className="grid h-32 w-32 place-items-center rounded-[2rem] bg-white text-5xl font-black text-[#1c2731] shadow-xl ring-4 ring-white">
                    {(state.profile.name || 'R')[0].toUpperCase()}
                  </div>
                  <span className={`rounded-full px-4 py-2 text-[12px] font-black uppercase tracking-wider ${state.profile.isActive !== false ? 'bg-green-50 text-[#34c759] ring-1 ring-[#34c759]/30' : 'bg-red-50 text-[#ff3b30] ring-1 ring-[#ff3b30]/30'}`}>
                    {state.profile.isActive !== false ? 'Active Account' : 'Suspended'}
                  </span>
                </div>
                
                <h2 className="text-3xl font-black text-[#1c2731]">{state.profile.name || 'User'}</h2>
                <p className="text-[15px] font-bold text-[#007AFF]">{state.profile.email || 'No email provided'}</p>
                
                <div className="mt-8 space-y-3">
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-[#f8fafc] p-5 ring-1 ring-[#d9e3ec]">
                    <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Phone Number</span>
                    <span className="text-[16px] font-black text-[#1c2731]">{state.profile.phone || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-[1.5rem] bg-[#f8fafc] p-5 ring-1 ring-[#d9e3ec]">
                    <span className="text-[12px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Account ID</span>
                    <span className="font-mono text-[14px] font-bold text-[#1c2731]">{state.profile._id || '—'}</span>
                  </div>
                </div>
                
                <button onClick={logout} className="mt-8 w-full rounded-[1.5rem] bg-[#fff5f5] py-4 text-[15px] font-bold text-[#ff3b30] ring-1 ring-[#ffd4d4] transition-all hover:bg-[#ff3b30] hover:text-white active:scale-95">
                  Sign Out of Account
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Mobile Bottom Bar Overlay */}
      <div className="fixed bottom-0 left-0 z-50 w-full bg-white/80 pb-safe pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:hidden">
        <div className="flex justify-evenly">
          {views.slice(0, 5).map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={`flex flex-col items-center justify-center p-3 transition-colors ${view === v.key ? 'text-[#007AFF]' : 'text-[#8a9aab]'}`}
            >
              <span className={`transition-transform ${view === v.key ? 'scale-110' : ''}`}>{v.icon}</span>
              <span className="mt-1 text-[10px] font-bold">{v.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
