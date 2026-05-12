import { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { TOKEN_KEY } from '../../constants/auth'
import { apiRequest } from '../../services/api'
import { joinRideRoom, onRideChatMessage } from '../../services/realtime'
import { ArrowLeft, Phone, MoreVertical, Send, CheckCheck } from 'lucide-react'

function formatChatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function mapChatRow(m) {
  return {
    id: String(m._id),
    from: m.senderRole === 'driver' ? 'driver' : 'rider',
    text: m.message,
    time: formatChatTime(m.createdAt),
  }
}

export default function RiderChatPage() {
  const { rideId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [driverInfo, setDriverInfo] = useState(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) navigate('/rider/login')
  }, [navigate])

  const mergeIncomingMessage = useCallback((doc) => {
    const row = mapChatRow(doc)
    setMessages((prev) => {
      if (prev.some((p) => p.id === row.id)) return prev
      return [...prev, row]
    })
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!rideId) return
    let cancelled = false
    joinRideRoom(rideId)

    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const [chatRes, trackRes] = await Promise.all([
          apiRequest(`/api/rides/${rideId}/chat`, { tokenKey: TOKEN_KEY }),
          apiRequest(`/api/rides/${rideId}/track`, { tokenKey: TOKEN_KEY }).catch(() => null),
        ])
        if (cancelled) return
        const rows = (chatRes.data || []).map(mapChatRow)
        setMessages(rows)
        const driver = trackRes?.data?.driverId
        if (driver && typeof driver === 'object') {
          setDriverInfo({
            name: driver.name || 'Driver',
            phone: driver.phone || '',
          })
        } else {
          setDriverInfo(null)
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load chat.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    const offChat = onRideChatMessage(rideId, mergeIncomingMessage)
    return () => {
      cancelled = true
      offChat()
    }
  }, [rideId, mergeIncomingMessage])

  const sendMessage = async () => {
    const text = newMsg.trim()
    if (!text || !rideId || sending) return
    try {
      setSending(true)
      setError('')
      const res = await apiRequest(`/api/rides/${rideId}/chat`, {
        method: 'POST',
        tokenKey: TOKEN_KEY,
        body: { message: text },
      })
      setMessages((res.data || []).map(mapChatRow))
      setNewMsg('')
    } catch (e) {
      setError(e.message || 'Could not send.')
    } finally {
      setSending(false)
    }
  }

  const driverInitial = (driverInfo?.name || 'D').slice(0, 1).toUpperCase()

  return (
    <div className="flex h-screen flex-col bg-[#edf3f9]">
      <header className="sticky top-0 z-30 bg-white/80 pb-4 pt-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:pt-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link to="/rider/app" className="group flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:scale-105 hover:shadow-md">
              <ArrowLeft size={20} className="text-[#1c2731] transition-transform group-hover:-translate-x-0.5" />
            </Link>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-tr from-[#34c759] to-[#248a3d] text-xl font-black text-white shadow-lg shadow-green-500/20">
                  {driverInitial}
                </div>
                <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-[#34c759] ring-2 ring-white">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34c759] opacity-50"></span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-[#1c2731]">{driverInfo?.name || 'Driver'}</h1>
                <p className="flex items-center gap-1.5 text-[13px] font-bold text-[#34c759]">
                  {driverInfo ? 'Online • Trip chat' : 'Trip chat'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {driverInfo?.phone ? (
              <a
                href={`tel:${driverInfo.phone}`}
                className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:scale-105 hover:bg-[#e8f4fd] hover:text-[#007AFF]"
              >
                <Phone size={20} />
              </a>
            ) : (
              <span className="grid h-12 w-12 place-items-center rounded-full bg-white/80 text-[#a0b0c0] shadow-sm ring-1 ring-[#d9e3ec]" title="Phone unavailable until driver is assigned">
                <Phone size={20} />
              </span>
            )}
            <button type="button" className="grid h-12 w-12 place-items-center rounded-full bg-white text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all hover:scale-105 hover:bg-[#f8fafc]">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 overflow-y-auto px-6 py-8 scrollbar-hide">
        <div className="mx-auto flex flex-col items-center gap-2">
          <span className="rounded-full bg-white/60 px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab] shadow-sm backdrop-blur-md">Trip messages</span>
          <p className="text-[12px] font-semibold text-[#8a9aab]">
            Ride #{(rideId || '').slice(-6) || '—'} · Live sync
          </p>
        </div>

        {error ? (
          <div className="rounded-2xl bg-red-50 px-4 py-3 text-center text-[13px] font-bold text-[#ff3b30] ring-1 ring-red-200">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-center text-[14px] font-medium text-[#8a9aab]">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-[14px] font-medium text-[#8a9aab]">No messages yet. Say hello to your driver.</p>
        ) : null}

        {messages.map((m) => {
          const isRider = m.from === 'rider'
          return (
            <div key={m.id} className={`flex w-full animate-in fade-in slide-in-from-bottom-2 ${isRider ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`group relative max-w-[80%] rounded-[1.5rem] px-5 py-3 shadow-md transition-all hover:shadow-lg sm:max-w-[70%] ${
                  isRider
                    ? 'rounded-tr-sm bg-gradient-to-br from-[#007AFF] to-[#0062CC] text-white'
                    : 'rounded-tl-sm bg-white text-[#1c2731] ring-1 ring-[#d9e3ec]'
                }`}
              >
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
              disabled={loading || !rideId}
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={!newMsg.trim() || sending || loading || !rideId}
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
