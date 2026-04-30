import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DriverLayout from '../../components/DriverLayout'
import { DRIVER_TOKEN_KEY } from '../../constants/auth'
import { Map, AlertTriangle, MessageCircle, CheckCircle, Check, ChevronUp, ChevronDown, MapPin, Navigation, User, Send } from 'lucide-react'

export default function DriverCurrentTripPage() {
  const navigate = useNavigate()
  const [trip, setTrip] = useState({
    riderName: 'Aminul Haque',
    riderPhone: '01712345678',
    pickup: 'Mirpur 10 Circle',
    dropoff: 'Dhanmondi 27',
    fare: 120,
    status: 'accepted',
    distance: '5.2 km',
  })
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'rider', text: 'I am waiting near the bus stop', time: '2:30 PM' },
    { from: 'driver', text: 'On my way, 3 minutes', time: '2:31 PM' },
  ])
  const [newMsg, setNewMsg] = useState('')
  const [accidentOpen, setAccidentOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(DRIVER_TOKEN_KEY)) navigate('/driver/login')
  }, [navigate])

  const updateStatus = (newStatus) => setTrip({ ...trip, status: newStatus })

  const sendMessage = () => {
    if (!newMsg.trim()) return
    setMessages([...messages, { from: 'driver', text: newMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    setNewMsg('')
  }

  const statusFlow = ['accepted', 'arrived', 'started', 'completed']
  const currentIdx = statusFlow.indexOf(trip.status)
  const nextStatus = statusFlow[currentIdx + 1]
  const statusLabels = { accepted: 'Navigate to Pickup', arrived: 'Start Ride', started: 'Complete Ride', completed: 'Ride Completed' }

  return (
    <DriverLayout title="Active Trip Tracker">
      {trip.status === 'completed' ? (
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-green-50 to-emerald-100 p-12 text-center shadow-[0_20px_60px_rgba(52,199,89,0.15)] ring-1 ring-green-200">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-green-400/20 blur-[80px]"></div>
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-[80px]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-8 grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-[#34c759] to-[#30d158] shadow-[0_12px_40px_rgba(52,199,89,0.4)]">
              <CheckCircle size={64} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-5xl font-black tracking-tight text-[#1c2731]">Ride Completed!</h2>
            <p className="mt-4 text-xl font-medium text-[#607282]">You successfully dropped off {trip.riderName}.</p>
            
            <div className="my-10 w-full max-w-sm rounded-[2rem] bg-white/60 p-8 shadow-inner ring-1 ring-inset ring-green-100 backdrop-blur-xl">
              <p className="text-[13px] font-extrabold uppercase tracking-[0.2em] text-[#8a9aab]">Total Fare Earned</p>
              <p className="mt-2 text-6xl font-black tracking-tighter text-[#34c759]">৳{trip.fare}</p>
            </div>

            <button onClick={() => navigate('/driver/dashboard')} className="group flex items-center gap-2 rounded-full bg-[#1c2731] px-10 py-5 text-[15px] font-bold text-white shadow-[0_8px_30px_rgba(28,39,49,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(28,39,49,0.4)] active:scale-95">
              Return to Dashboard <Navigation size={18} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid h-full gap-6 lg:grid-cols-[1fr_400px]">
          {/* Left Column: Massive Map & Route Focus */}
          <div className="flex h-full flex-col gap-6">
            
            {/* Immersive Map Container */}
            <div className="group relative flex min-h-[400px] flex-1 items-center justify-center overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#e8f4fd] to-blue-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/60 transition-all hover:shadow-[0_12px_40px_rgba(0,122,255,0.08)]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
              <div className="absolute h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-200/20 via-transparent to-transparent"></div>
              
              {/* Pulsing Map Pin Animation */}
              <div className="relative flex flex-col items-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white/80 shadow-2xl backdrop-blur-xl">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#007AFF] opacity-20"></span>
                  <Map size={48} className="text-[#007AFF] drop-shadow-md" strokeWidth={1.5} />
                </div>
                <div className="mt-6 rounded-full bg-white/60 px-6 py-2.5 shadow-sm ring-1 ring-white/80 backdrop-blur-md">
                  <p className="text-[14px] font-bold text-[#1c2731]">Live GPS Tracking Active</p>
                </div>
                <p className="mt-3 text-[12px] font-semibold text-[#8a9aab]">(Leaflet/Google Maps Integration Area)</p>
              </div>

              {/* Status Overlay on Map */}
              <div className="absolute left-6 top-6 flex items-center gap-3 rounded-full bg-white/90 px-5 py-2.5 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
                <div className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-[#34c759]"></span>
                </div>
                <span className="text-[13px] font-extrabold uppercase tracking-widest text-[#1c2731]">{trip.status}</span>
              </div>
            </div>

            {/* Glowing Route Timeline Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white/80 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/60 backdrop-blur-xl">
              <div className="absolute -right-20 top-0 h-40 w-40 rounded-full bg-[#007AFF]/5 blur-3xl"></div>
              
              <div className="relative">
                <div className="flex items-start gap-5">
                  <div className="flex flex-col items-center">
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-emerald-50 ring-4 ring-white shadow-sm">
                      <span className="h-3 w-3 rounded-full bg-[#34c759] shadow-[0_0_10px_rgba(52,199,89,0.5)]"></span>
                    </div>
                    <div className="my-2 h-10 w-[2px] bg-gradient-to-b from-emerald-200 to-rose-200"></div>
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-rose-50 ring-4 ring-white shadow-sm">
                      <span className="h-3 w-3 rounded-full bg-[#ff3b30] shadow-[0_0_10px_rgba(255,59,48,0.5)]"></span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col justify-between py-1">
                    <div className="mb-7">
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">Pickup Location</p>
                      <p className="mt-1 text-xl font-black text-[#1c2731]">{trip.pickup}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">Dropoff Destination</p>
                      <p className="mt-1 text-xl font-black text-[#1c2731]">{trip.dropoff}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Interaction Hub */}
          <div className="flex flex-col gap-6 lg:h-full lg:overflow-hidden">
            
            {/* Primary Action Button (Massive and Sticky) */}
            {nextStatus && (
              <button
                onClick={() => updateStatus(nextStatus)}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[2rem] bg-gradient-to-r from-[#007AFF] to-[#0062CC] py-6 shadow-[0_12px_35px_rgba(0,122,255,0.35)] transition-all hover:shadow-[0_20px_50px_rgba(0,122,255,0.45)] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.2),transparent)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:animate-shimmer"></div>
                <Navigation className="h-6 w-6 text-white transition-transform group-hover:translate-x-1" />
                <span className="text-xl font-black text-white">{statusLabels[trip.status] || 'Next Step'}</span>
              </button>
            )}

            {/* Rider Info Card */}
            <div className="rounded-[2.5rem] bg-white/70 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/60 backdrop-blur-xl sm:p-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-[#1c2731] to-[#3a4f63] text-2xl font-black text-white shadow-lg">
                    {trip.riderName[0]}
                  </div>
                  <div className="absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-[#34c759] ring-2 ring-white">
                    <User size={12} className="text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-[#8a9aab]">Passenger</p>
                  <p className="text-xl font-black text-[#1c2731]">{trip.riderName}</p>
                  <p className="text-[13px] font-bold text-[#007AFF]">{trip.riderPhone}</p>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <div className="flex-1 rounded-2xl bg-white/50 p-4 text-center ring-1 ring-[#d9e3ec] backdrop-blur-sm">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab]">Distance</p>
                  <p className="mt-1 text-xl font-black text-[#1c2731]">{trip.distance}</p>
                </div>
                <div className="flex-1 rounded-2xl bg-white/50 p-4 text-center ring-1 ring-[#d9e3ec] backdrop-blur-sm">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-[#8a9aab]">Est. Fare</p>
                  <p className="mt-1 text-xl font-black text-[#34c759]">৳{trip.fare}</p>
                </div>
              </div>
            </div>

            {/* iMessage Style Chat */}
            <div className={`flex flex-col rounded-[2.5rem] bg-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-white/60 backdrop-blur-xl transition-all duration-300 ${chatOpen ? 'flex-1' : 'h-auto'}`}>
              <button onClick={() => setChatOpen(!chatOpen)} className="flex w-full items-center justify-between px-8 py-6 outline-none">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#007AFF]">
                    <MessageCircle size={20} />
                  </div>
                  <span className="text-lg font-extrabold text-[#1c2731]">Chat with User</span>
                </div>
                <div className="grid h-8 w-8 place-items-center rounded-full bg-[#f8fafc] text-[#8a9aab] ring-1 ring-[#d9e3ec] transition-transform hover:bg-[#e8f4fd] hover:text-[#007AFF]">
                  {chatOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </button>
              
              {chatOpen && (
                <div className="flex flex-1 flex-col overflow-hidden border-t border-white/40">
                  <div className="flex-1 space-y-4 overflow-y-auto p-6 scrollbar-hide">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.from === 'driver' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`relative max-w-[85%] rounded-[1.5rem] px-5 py-3 ${m.from === 'driver' ? 'rounded-tr-sm bg-gradient-to-r from-[#007AFF] to-[#0062CC] text-white shadow-md' : 'rounded-tl-sm bg-[#f0f5fa] text-[#1c2731]'}`}>
                          <p className="text-[15px] font-medium leading-snug">{m.text}</p>
                          <p className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${m.from === 'driver' ? 'text-blue-200' : 'text-[#8a9aab]'}`}>{m.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/50 p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 rounded-full bg-white p-2 shadow-sm ring-1 ring-[#d9e3ec] focus-within:ring-2 focus-within:ring-[#007AFF]">
                      <input
                        value={newMsg}
                        onChange={(e) => setNewMsg(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        className="flex-1 bg-transparent px-4 py-2 text-[15px] font-medium text-[#1c2731] placeholder-[#a0b0c0] outline-none"
                        placeholder="Type a message..."
                      />
                      <button onClick={sendMessage} className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[#007AFF] text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50" disabled={!newMsg.trim()}>
                        <Send size={18} className="ml-1" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accident Report */}
            <div className="mt-auto">
              <button onClick={() => setAccidentOpen(!accidentOpen)} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-transparent bg-[#fff5f5] py-4 text-[15px] font-bold text-[#ff3b30] ring-1 ring-[#ffd4d4] transition-all hover:bg-[#ff3b30] hover:text-white">
                <AlertTriangle size={18} /> Report Incident or Accident
              </button>
              {accidentOpen && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2 rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-[#ffd4d4]">
                  <textarea className="w-full resize-none rounded-xl border border-[#d9e3ec] bg-[#f8fafc] p-4 text-[15px] font-medium text-[#1c2731] placeholder-[#a0b0c0] outline-none focus:border-[#ff3b30] focus:ring-2 focus:ring-[#ff3b30]/10" rows={3} placeholder="Describe the accident details immediately..." />
                  <button className="mt-3 w-full rounded-xl bg-[#ff3b30] py-3.5 text-[15px] font-bold text-white shadow-md active:scale-95">Submit Emergency Report</button>
                  <p className="mt-3 flex items-start gap-1.5 text-[11px] font-bold text-[#ff9500]"><AlertTriangle size={14} className="mt-0.5 flex-shrink-0" /> Note: Ensure all passengers are safe before reporting. The driver assumes responsibility for reporting accurately.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </DriverLayout>
  )
}
