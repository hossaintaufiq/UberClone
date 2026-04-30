import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { TOKEN_KEY } from '../../constants/auth'
import { ArrowLeft, Phone, MoreVertical, Send, Check, CheckCheck } from 'lucide-react'

export default function RiderChatPage() {
  const { rideId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    { from: 'driver', text: 'I am on my way. Will be there in 5 minutes.', time: '2:30 PM' },
    { from: 'rider', text: 'Okay, I am near the main gate.', time: '2:31 PM' },
    { from: 'driver', text: 'Got it. I am in a blue Honda Civic.', time: '2:32 PM' },
  ])
  const [newMsg, setNewMsg] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) navigate('/rider/login')
  }, [navigate])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!newMsg.trim()) return
    setMessages([...messages, {
      from: 'rider',
      text: newMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }])
    setNewMsg('')
  }

  return (
    <div className="flex h-screen flex-col bg-[#edf3f9]">
      {/* Premium Glass Header */}
      <header className="sticky top-0 z-30 bg-white/80 pb-4 pt-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:pt-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/rider/app" className="group flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:scale-105 hover:shadow-md">
              <ArrowLeft size={20} className="text-[#1c2731] transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-[#34c759] to-[#248a3d] text-xl font-black text-white shadow-lg shadow-green-500/20">
                  D
                </div>
                <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#34c759] ring-2 ring-white">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-50"></span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-[#1c2731]">David (Driver)</h1>
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#34c759]">
                  Online • Toyota Prius (Blue)
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:scale-105 hover:bg-[#e8f4fd] hover:text-[#007AFF]">
              <Phone size={20} />
            </button>
            <button className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:scale-105 hover:bg-[#f8fafc]">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Dynamic Chat Bubbles */}
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 overflow-y-auto px-6 py-8 scrollbar-hide">
        <div className="mx-auto flex flex-col items-center gap-2">
          <span className="rounded-full bg-white/60 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] shadow-sm backdrop-blur-md">Today</span>
          <p className="text-[12px] font-semibold text-[#8a9aab]">Ride #{(rideId || '847291').slice(-6)} encrypted end-to-end</p>
        </div>
        
        {messages.map((m, i) => {
          const isRider = m.from === 'rider'
          return (
            <div key={i} className={`flex w-full animate-in fade-in slide-in-from-bottom-2 ${isRider ? 'justify-end' : 'justify-start'}`}>
              <div className={`group relative max-w-[80%] rounded-[1.5rem] px-5 py-3 shadow-md transition-all hover:shadow-lg sm:max-w-[70%] ${
                isRider
                  ? 'rounded-tr-sm bg-gradient-to-br from-[#007AFF] to-[#0062CC] text-white'
                  : 'rounded-tl-sm bg-white text-[#1c2731] ring-1 ring-[#d9e3ec]'
              }`}>
                <p className="text-[15px] font-medium leading-relaxed">{m.text}</p>
                <div className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] font-bold uppercase tracking-wider ${isRider ? 'text-blue-200' : 'text-[#8a9aab]'}`}>
                  {m.time}
                  {isRider && <CheckCheck size={14} className="text-blue-100" />}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Floating Input Area */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#edf3f9] via-[#edf3f9] to-transparent pb-8 pt-4">
        <div className="mx-auto max-w-2xl px-6">
          <div className="flex items-end gap-3 rounded-[2rem] bg-white p-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] ring-1 ring-[#d9e3ec] focus-within:ring-2 focus-within:ring-[#007AFF]">
            <textarea
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              className="max-h-[120px] min-h-[56px] w-full resize-none bg-transparent px-5 py-4 text-[15px] font-medium text-[#1c2731] placeholder-[#a0b0c0] outline-none scrollbar-hide"
              placeholder="Message your driver..."
              rows={1}
            />
            <button 
              onClick={sendMessage} 
              disabled={!newMsg.trim()}
              className="mb-1 mr-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-white shadow-md transition-all hover:scale-105 hover:bg-[#0062CC] active:scale-95 disabled:scale-100 disabled:opacity-50"
            >
              <Send size={20} className="ml-1" />
            </button>
          </div>
          <p className="mt-3 text-center text-[11px] font-semibold text-[#8a9aab]">
            Press Enter to send. For emergencies, tap the phone icon above.
          </p>
        </div>
      </div>
    </div>
  )
}
