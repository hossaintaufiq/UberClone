import { useEffect, useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TOKEN_KEY } from '../../constants/auth'
import { ArrowLeft, Bot, Sun, Route, Star, MapPin, Sparkles, Navigation, CheckCircle2 } from 'lucide-react'

const suggestions = {
  daytrip: [
    { destination: 'Sonargaon', driver: 'Kamal Hossain', rating: 4.8, fare: '৳2,500', trips: 142, note: 'Expert in Sonargaon routes, knows all historical spots.' },
    { destination: 'Gazipur Safari Park', driver: 'Rahim Uddin', rating: 4.7, fare: '৳1,800', trips: 89, note: 'Comfortable vehicle, great with families.' },
    { destination: 'Mawa Ghat', driver: 'Jamal Ahmed', rating: 4.9, fare: '৳3,200', trips: 215, note: 'Premium sedan, includes hilsha fish stop recommendations.' },
  ],
  intercity: [
    { destination: 'Chattogram', driver: 'Rafiq Miah', rating: 4.8, fare: '৳6,500', trips: 430, note: 'Highway expert, 5+ years intercity experience.' },
    { destination: 'Sylhet', driver: 'Babul Khan', rating: 4.6, fare: '৳8,000', trips: 112, note: 'AC vehicle, safe highway driving record.' },
    { destination: "Cox's Bazar", driver: 'Selim Reza', rating: 4.9, fare: '৳12,000', trips: 340, note: 'Premium SUV, beach trip specialist.' },
  ],
}

export default function RiderChatbotPage() {
  const navigate = useNavigate()
  const [tripType, setTripType] = useState('')
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Hello! I'm Transitely's AI Engine. Are you planning a day trip or an intercity journey today? I can analyze our fleet to find the perfect captain for your route." },
  ])
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) navigate('/rider/login')
  }, [navigate])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, tripType])

  const selectTrip = (type) => {
    setTripType(type)
    const label = type === 'daytrip' ? 'Day Trip' : 'Intercity Journey'
    setMessages((prev) => [
      ...prev,
      { from: 'rider', text: `I'm planning a ${label}.` },
    ])
    
    // Simulate AI thinking
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: `Excellent choice. I've scanned our top-rated captains and found the best matches for ${label.toLowerCase()}s. Here are my recommendations:` },
      ])
    }, 600)
  }

  const data = tripType === 'daytrip' ? suggestions.daytrip : tripType === 'intercity' ? suggestions.intercity : []

  return (
    <div className="flex h-screen flex-col bg-[#edf3f9] selection:bg-[#007AFF]/20 selection:text-[#007AFF]">
      
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-30 bg-white/70 shadow-[0_4px_30px_rgba(0,0,0,0.03)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/rider/app" className="group flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:scale-105 hover:shadow-md">
              <ArrowLeft size={20} className="text-[#1c2731] transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="relative grid h-12 w-12 place-items-center rounded-full bg-gradient-to-tr from-[#1c2731] to-[#3a4f63] text-white shadow-[0_8px_20px_rgba(28,39,49,0.3)]">
                <Sparkles size={20} className="animate-pulse text-blue-200" />
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-[#34c759] ring-2 ring-white"></div>
              </div>
              <div>
                <h1 className="text-[17px] font-black text-[#1c2731]">Transitely AI</h1>
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#007AFF]">Trip Intelligence</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Dynamic Chat Area */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 overflow-y-auto px-6 py-8 scrollbar-hide">
        
        {/* Date Badge */}
        <div className="mx-auto flex flex-col items-center gap-2">
          <span className="rounded-full bg-white/60 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] shadow-sm backdrop-blur-md">
            AI Assistant Connected
          </span>
        </div>
        
        {messages.map((m, i) => {
          const isRider = m.from === 'rider'
          return (
            <div key={i} className={`flex w-full animate-in fade-in slide-in-from-bottom-2 ${isRider ? 'justify-end' : 'justify-start'}`}>
              {!isRider && (
                <div className="mr-3 mt-auto hidden h-8 w-8 place-items-center rounded-full bg-[#1c2731] text-white sm:grid">
                  <Bot size={14} />
                </div>
              )}
              <div className={`group relative max-w-[85%] rounded-[1.5rem] px-5 py-4 shadow-sm sm:max-w-[75%] ${
                isRider
                  ? 'rounded-tr-sm bg-gradient-to-br from-[#007AFF] to-[#0062CC] text-white'
                  : 'rounded-tl-sm bg-white text-[#1c2731] ring-1 ring-[#d9e3ec]'
              }`}>
                <p className="text-[15px] font-medium leading-relaxed">{m.text}</p>
              </div>
            </div>
          )
        })}

        {/* AI Selection Cards (Options) */}
        {!tripType && (
          <div className="ml-0 mt-2 flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-4 sm:ml-11 sm:flex-row">
            <button 
              onClick={() => selectTrip('daytrip')} 
              className="group relative flex flex-1 flex-col items-start overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-50 transition-transform group-hover:scale-150"></div>
              <div className="relative z-10 mb-4 inline-flex rounded-xl bg-orange-100 p-3 text-[#ff9500] ring-1 ring-orange-200">
                <Sun size={24} />
              </div>
              <h3 className="relative z-10 text-lg font-black text-[#1c2731]">Day Trip Planner</h3>
              <p className="relative z-10 mt-1 text-left text-[13px] font-medium text-[#607282]">Find verified drivers for full-day city tours and nearby attractions.</p>
            </button>
            
            <button 
              onClick={() => selectTrip('intercity')} 
              className="group relative flex flex-1 flex-col items-start overflow-hidden rounded-[1.5rem] bg-white p-6 shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-50 transition-transform group-hover:scale-150"></div>
              <div className="relative z-10 mb-4 inline-flex rounded-xl bg-blue-100 p-3 text-[#007AFF] ring-1 ring-blue-200">
                <Route size={24} />
              </div>
              <h3 className="relative z-10 text-lg font-black text-[#1c2731]">Intercity Journey</h3>
              <p className="relative z-10 mt-1 text-left text-[13px] font-medium text-[#607282]">Connect with experienced highway captains for safe long-distance travel.</p>
            </button>
          </div>
        )}

        {/* AI Results (Driver Suggestions) */}
        {data.length > 0 && messages.length > 2 && (
          <div className="ml-0 mt-2 space-y-4 animate-in fade-in slide-in-from-bottom-4 sm:ml-11">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">AI Top Matches</p>
            {data.map((s, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(0,122,255,0.08)] sm:p-8">
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#f8fafc] to-transparent opacity-50"></div>
                
                <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#34c759] to-[#248a3d] text-xl font-black text-white shadow-md">
                        {s.driver[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-black text-[#1c2731]">{s.driver}</h3>
                          <CheckCircle2 size={16} className="text-[#007AFF]" />
                        </div>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[12px] font-bold text-[#ff9500]">
                            <Star size={12} fill="currentColor" /> {s.rating}
                          </span>
                          <span className="text-[12px] font-bold text-[#8a9aab]">{s.trips} trips completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#007AFF]" />
                        <span className="text-[14px] font-bold text-[#1c2731]">Popular Route: <span className="font-medium text-[#607282]">{s.destination}</span></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Sparkles size={16} className="mt-0.5 text-[#5856d6]" />
                        <span className="text-[14px] font-bold text-[#1c2731]">AI Note: <span className="font-medium text-[#607282]">{s.note}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-start justify-between sm:items-end">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">Est. Fare</p>
                      <p className="mt-1 text-3xl font-black text-[#1c2731]">{s.fare}</p>
                    </div>
                    <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[#1c2731] px-6 py-3.5 text-[14px] font-bold text-white shadow-[0_8px_20px_rgba(28,39,49,0.3)] transition-all hover:shadow-lg active:scale-95 sm:mt-0 sm:w-auto">
                      Select Driver <Navigation size={16} />
                    </button>
                  </div>

                </div>
              </div>
            ))}
            
            <div className="mt-8 text-center">
              <button 
                onClick={() => setTripType('')} 
                className="rounded-full bg-white px-6 py-2.5 text-[13px] font-bold text-[#607282] shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:bg-[#f8fafc] hover:text-[#1c2731]"
              >
                Reset AI Search
              </button>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

    </div>
  )
}
