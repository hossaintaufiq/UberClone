import { API_BASE } from '../constants/auth'

const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'

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

/** Free OSM Nominatim reverse lookup (respect low volume / fair use). */
export async function reverseGeocode(lat, lng, signal) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
  })
  const res = await fetch(`${NOMINATIM_REVERSE}?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Geocode failed')
  const data = await res.json()
  return typeof data.display_name === 'string' ? data.display_name : ''
}
