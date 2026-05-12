import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { searchPlaces } from '../services/geocoding'

const MAX_TA_PX = 168

/**
 * Address search with multi-line field (wraps long places) and portal suggestion list.
 */
export function PlaceSearchField({ id, label, icon: Icon, value, onChangeValue, onSelectPlace, accentClass }) {
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const abortRef = useRef(null)
  const rootRef = useRef(null)
  const menuRef = useRef(null)
  const anchorRef = useRef(null)
  const taRef = useRef(null)
  const [menuStyle, setMenuStyle] = useState(null)

  const syncMenuPosition = useCallback(() => {
    const el = anchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setMenuStyle({
      position: 'fixed',
      left: `${Math.round(r.left)}px`,
      top: `${Math.round(r.bottom + 6)}px`,
      width: `${Math.round(r.width)}px`,
      zIndex: 2147483647,
    })
  }, [])

  const adjustTextareaHeight = useCallback(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    const h = Math.min(Math.max(el.scrollHeight, 52), MAX_TA_PX)
    el.style.height = `${h}px`
    el.style.overflowY = el.scrollHeight > MAX_TA_PX ? 'auto' : 'hidden'
  }, [value])

  useLayoutEffect(() => {
    adjustTextareaHeight()
  }, [value, adjustTextareaHeight])

  useEffect(() => {
    const q = value.trim()
    if (q.length < 3) {
      setResults([])
      return
    }
    abortRef.current?.abort()
    const ac = new AbortController()
    abortRef.current = ac
    const timer = window.setTimeout(async () => {
      setBusy(true)
      try {
        const rows = await searchPlaces(q, ac.signal)
        if (!ac.signal.aborted) setResults(rows)
      } catch {
        if (!ac.signal.aborted) setResults([])
      } finally {
        if (!ac.signal.aborted) setBusy(false)
      }
    }, 400)
    return () => {
      window.clearTimeout(timer)
      ac.abort()
    }
  }, [value])

  useEffect(() => {
    if (!open || results.length === 0) {
      setMenuStyle(null)
      return
    }
    syncMenuPosition()
    window.addEventListener('scroll', syncMenuPosition, true)
    window.addEventListener('resize', syncMenuPosition)
    return () => {
      window.removeEventListener('scroll', syncMenuPosition, true)
      window.removeEventListener('resize', syncMenuPosition)
    }
  }, [open, results.length, syncMenuPosition, value])

  useLayoutEffect(() => {
    if (open && results.length > 0) syncMenuPosition()
  }, [open, results.length, syncMenuPosition, value])

  useEffect(() => {
    const close = (e) => {
      const t = e.target
      if (rootRef.current?.contains(t)) return
      if (menuRef.current?.contains(t)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const menuPortal =
    open && results.length > 0 && menuStyle && typeof document !== 'undefined'
      ? createPortal(
          <ul
            ref={menuRef}
            data-place-search-menu=""
            className="max-h-72 overflow-auto rounded-[1rem] bg-white py-1 shadow-xl ring-1 ring-[#d9e3ec]"
            style={menuStyle}
          >
            {results.map((row, idx) => (
              <li key={`${row.place_id ?? idx}-${row.label.slice(0, 40)}`}>
                <button
                  type="button"
                  className="w-full break-words px-4 py-3 text-left text-[13px] font-semibold leading-snug text-[#1c2731] hover:bg-[#f0f7ff]"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelectPlace({ lat: row.lat, lng: row.lng, label: row.label })
                    setOpen(false)
                    setResults([])
                  }}
                >
                  {row.label}
                </button>
              </li>
            ))}
          </ul>,
          document.body
        )
      : null

  const padIcon = Icon ? 'pl-12 pr-11' : 'px-4'

  return (
    <>
      <div ref={rootRef} className="relative min-w-0 overflow-visible">
        {label ? (
          <label htmlFor={id} className="mb-2 block text-[11px] font-extrabold uppercase tracking-widest text-[#8a9aab]">
            {label}
          </label>
        ) : null}
        <div ref={anchorRef} className="relative min-w-0 overflow-visible">
          {Icon ? (
            <div className={`pointer-events-none absolute left-4 top-[1.15rem] ${accentClass || 'text-[#007AFF]'}`}>
              <Icon size={18} />
            </div>
          ) : null}
          <textarea
            ref={taRef}
            id={id}
            rows={2}
            autoComplete="off"
            spellCheck="false"
            value={value}
            onChange={(e) => {
              onChangeValue(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            className={`box-border min-h-[52px] min-w-0 w-full resize-none rounded-[1.2rem] bg-[#f8fafc] py-3 text-[15px] font-bold leading-snug text-[#1c2731] shadow-sm ring-1 ring-[#d9e3ec] transition-all placeholder:font-medium placeholder:text-[#a0b0c0] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] ${padIcon} break-words whitespace-pre-wrap`}
            placeholder="Search address or place name"
            required
          />
          {busy ? (
            <span className="pointer-events-none absolute right-4 top-3 text-[11px] font-bold text-[#8a9aab]">Searching…</span>
          ) : null}
        </div>
      </div>
      {menuPortal}
    </>
  )
}
