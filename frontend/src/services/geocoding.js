import { API_BASE } from '../constants/auth'

export function formatCoordsLabel(lat, lng) {
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
}

/**
 * Forward place search via backend proxy (correct User-Agent for Nominatim; avoids browser limits).
 * Returns [{ lat, lng, label, place_id? }, ...]
 */
export async function searchPlaces(query, signal) {
  const q = String(query || '').trim()
  if (q.length < 2) return []
  const params = new URLSearchParams({ q, limit: '8' })
  const res = await fetch(`${API_BASE}/api/geocode/search?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Place search failed')
  const json = await res.json()
  if (json.success === false) throw new Error(json.message || 'Place search failed')
  return Array.isArray(json.data) ? json.data : []
}

/** Reverse lookup via backend proxy for stable browser support. */
export async function reverseGeocode(lat, lng, signal) {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) })
  const res = await fetch(`${API_BASE}/api/geocode/reverse?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Geocode failed')
  const data = await res.json()
  if (data?.success === false) throw new Error(data?.message || 'Geocode failed')
  return typeof data?.data?.label === 'string' ? data.data.label : ''
}
