import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export default function ConfirmToast({ open, message, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const timeoutId = window.setTimeout(() => onClose?.(), 2400)
    return () => window.clearTimeout(timeoutId)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed right-5 top-5 z-[100] w-[min(92vw,420px)]">
      <div className="flex items-start gap-3 rounded-2xl border border-emerald-200/70 bg-white/90 p-4 shadow-[0_14px_40px_rgba(16,185,129,0.22)] backdrop-blur-xl">
        <div className="mt-0.5 rounded-full bg-emerald-100 p-1.5 text-emerald-600">
          <CheckCircle2 size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-emerald-600">Confirmed</p>
          <p className="mt-1 text-[14px] font-semibold leading-snug text-[#1c2731]">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-[#8a9aab] transition-colors hover:bg-slate-100 hover:text-[#1c2731]"
          aria-label="Close confirmation"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
