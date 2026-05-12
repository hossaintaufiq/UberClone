import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TOKEN_KEY } from '../constants/auth'
import { apiRequest } from '../services/api'
import { onRideChatMessage } from '../services/realtime'
import { ChevronDown, ChevronUp, MessageCircle, Send } from 'lucide-react'

function formatChatTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function mapRow(m) {
  return {
    id: String(m._id),
    from: m.senderRole === 'driver' ? 'driver' : 'rider',
    text: m.message,
    time: formatChatTime(m.createdAt),
  }
}

/**
 * Live rider ↔ driver chat inside RiderAppPage (same API + Socket.IO as full-page chat).
 */
export default function RiderInlineRideChat({ rideId, defaultExpanded = false, compact = false, onError }) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  const mergeIncoming = useCallback((doc) => {
    const row = mapRow(doc)
    setMessages((prev) => {
      if (prev.some((p) => p.id === row.id)) return prev
      return [...prev, row]
    })
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, expanded])

  useEffect(() => {
    const id = String(rideId || '').trim()
    if (!id) {
      setMessages([])
      return
    }
    let cancelled = false
    setLoading(true)
    apiRequest(`/api/rides/${id}/chat`, { tokenKey: TOKEN_KEY })
      .then((res) => {
        if (cancelled) return
        setMessages((res.data || []).map(mapRow))
      })
      .catch(() => {
        if (!cancelled) setMessages([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    const off = onRideChatMessage(id, mergeIncoming)
    return () => {
      cancelled = true
      off()
    }
  }, [rideId, mergeIncoming])

  const send = async () => {
    const text = input.trim()
    const id = String(rideId || '').trim()
    if (!text || !id || sending) return
    try {
      setSending(true)
      const res = await apiRequest(`/api/rides/${id}/chat`, {
        method: 'POST',
        tokenKey: TOKEN_KEY,
        body: { message: text },
      })
      setMessages((res.data || []).map(mapRow))
      setInput('')
    } catch (e) {
      onError?.(e?.message || 'Could not send message.')
    } finally {
      setSending(false)
    }
  }

  const id = String(rideId || '').trim()
  if (!id) return null

  const toggleBtn = (
    <button
      type="button"
      onClick={() => setExpanded((e) => !e)}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl bg-[#e8f4fd]/90 px-4 py-3 text-left ring-1 ring-[#007AFF]/20 transition-colors hover:bg-[#e8f4fd] ${compact ? '' : 'sm:px-5'}`}
    >
      <span className="flex items-center gap-2 text-[14px] font-black text-[#007AFF]">
        <MessageCircle size={18} />
        Driver chat
        {loading ? <span className="text-[11px] font-bold text-[#8a9aab]">· syncing…</span> : null}
      </span>
      <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-white text-[#007AFF] shadow-sm ring-1 ring-[#007AFF]/15">
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </span>
    </button>
  )

  return (
    <div className={`w-full ${compact ? '' : ''}`}>
      {toggleBtn}

      {expanded ? (
        <div className="mt-3 space-y-3">
          <div
            className={`max-h-[min(280px,45vh)] overflow-y-auto rounded-[1.25rem] bg-[#f8fafc] p-3 ring-1 ring-[#d9e3ec] ${compact ? 'text-[13px]' : ''}`}
          >
            {messages.length === 0 && !loading ? (
              <p className="py-6 text-center text-[13px] font-medium text-[#8a9aab]">No messages yet. Say hello to your driver.</p>
            ) : null}
            <div className="flex flex-col gap-2">
              {messages.map((m) => {
                const mine = m.from === 'rider'
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl px-3 py-2 ${
                        mine ? 'rounded-tr-sm bg-gradient-to-br from-[#007AFF] to-[#0062CC] text-white' : 'rounded-tl-sm bg-white text-[#1c2731] ring-1 ring-[#d9e3ec]'
                      }`}
                    >
                      <p className="font-medium leading-snug">{m.text}</p>
                      <p className={`mt-0.5 text-[10px] font-bold uppercase tracking-wide ${mine ? 'text-blue-200' : 'text-[#8a9aab]'}`}>{m.time}</p>
                    </div>
                  </div>
                )
              })}
              <div ref={endRef} />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-white p-1.5 pl-4 shadow-sm ring-1 ring-[#d9e3ec] focus-within:ring-2 focus-within:ring-[#007AFF]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              placeholder="Message your driver…"
              disabled={sending || loading}
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#1c2731] placeholder-[#a0b0c0] outline-none"
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || sending || loading}
              className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[#007AFF] text-white shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Send size={16} className="ml-0.5" />
            </button>
          </div>

          <Link
            to={`/rider/chat/${id}`}
            className="block text-center text-[12px] font-bold text-[#007AFF] underline-offset-2 hover:underline"
          >
            Open full-screen chat
          </Link>
        </div>
      ) : null}
    </div>
  )
}
