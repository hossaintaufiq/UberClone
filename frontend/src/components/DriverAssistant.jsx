import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { DRIVER_NAV, processDriverMessage } from '../services/driverAssistant'

function renderMarkdownLight(text) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g)
  return parts.map((chunk, i) => {
    const m = chunk.match(/^\*\*([^*]+)\*\*$/)
    if (m) {
      return (
        <strong key={i} className="font-bold text-[#1c2731]">
          {m[1]}
        </strong>
      )
    }
    return <span key={i}>{chunk}</span>
  })
}

export default function DriverAssistant() {
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      from: 'assistant',
      text: 'I’m your **Driver Assistant**. Say **open incoming**, **earnings**, **current trip**, or **help**.',
    },
  ])
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const dispatchUserMessage = (raw) => {
    const trimmed = raw.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { from: 'driver', text: trimmed }])
    const { reply, navigate: path } = processDriverMessage(trimmed, location.pathname)
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'assistant', text: reply }])
      if (path) navigate(path)
    }, path ? 120 : 0)
  }

  const send = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    setInput('')
    dispatchUserMessage(trimmed)
  }

  const quick = (label) => {
    dispatchUserMessage(label)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-[60] flex items-center gap-2 rounded-full bg-[#1c2731] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_28px_rgba(28,39,49,0.35)] ring-2 ring-white transition-all hover:bg-[#2d3d4f] hover:shadow-xl active:scale-95 md:bottom-8 md:right-8"
        aria-label="Open driver assistant"
      >
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-[#34c759]">
          <Sparkles size={18} className="text-white" />
        </span>
        <span className="hidden pr-1 sm:inline">Assistant</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex justify-end bg-black/25 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Driver assistant">
          <button type="button" className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} aria-hidden />

          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-[-12px_0_48px_rgba(14,47,74,0.12)] animate-in slide-in-from-right duration-200">
            <header className="flex items-center justify-between border-b border-[#e8eef4] px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#34c759] to-[#28a745] text-white shadow-md">
                  <Bot size={22} />
                </div>
                <div>
                  <p className="text-[15px] font-bold text-[#1c2731]">Driver Assistant</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8a9aab]">Navigate · Tips</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[#e8eef4] text-[#64748b] transition-colors hover:bg-[#f8fafc]"
                aria-label="Close assistant"
              >
                <X size={20} />
              </button>
            </header>

            <div className="flex flex-wrap gap-2 border-b border-[#f0f4f8] px-4 py-3">
              {DRIVER_NAV.map((n) => (
                <button
                  key={n.path}
                  type="button"
                  onClick={() => quick(`Open ${n.label}`)}
                  className="rounded-full bg-[#f0fdf4] px-3 py-1.5 text-[11px] font-bold text-[#15803d] transition-colors hover:bg-[#34c759] hover:text-white"
                >
                  {n.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => quick('Help')}
                className="rounded-full bg-[#e8f4fd] px-3 py-1.5 text-[11px] font-bold text-[#007AFF] hover:bg-[#007AFF] hover:text-white"
              >
                Help
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="flex flex-col gap-4">
                {messages.map((m, idx) => {
                  const isUser = m.from === 'driver'
                  return (
                    <div key={`${idx}-${m.text.slice(0, 12)}`} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[90%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                          isUser ? 'rounded-br-md bg-[#34c759] text-white' : 'rounded-bl-md bg-[#f8fafc] text-[#1c2731] ring-1 ring-[#e8eef4]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{renderMarkdownLight(m.text)}</p>
                      </div>
                    </div>
                  )
                })}
                <div ref={endRef} />
              </div>
            </div>

            <footer className="border-t border-[#e8eef4] p-4 pb-safe">
              <div className="flex gap-2 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] p-1.5 focus-within:border-[#34c759] focus-within:ring-2 focus-within:ring-[#34c759]/15">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send()
                    }
                  }}
                  placeholder="e.g. Incoming rides, earnings, help…"
                  className="min-w-0 flex-1 bg-transparent px-3 py-2 text-[14px] font-medium text-[#1c2731] outline-none placeholder:text-[#94a3b8]"
                />
                <button
                  type="button"
                  onClick={send}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#34c759] text-white transition-colors hover:bg-[#28a745]"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="mt-2 text-center text-[10px] font-medium text-[#94a3b8]">Shortcuts — does not access live ride data.</p>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  )
}
