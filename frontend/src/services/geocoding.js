const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse'

export function formatCoordsLabel(lat, lng) {
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`
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
