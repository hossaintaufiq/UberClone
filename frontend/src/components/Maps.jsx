import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const pickupPinIcon = L.divIcon({
  className: 'leaflet-marker-pin-wrap',
  html: '<div style="width:18px;height:18px;background:#34c759;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const dropoffPinIcon = L.divIcon({
  className: 'leaflet-marker-pin-wrap',
  html: '<div style="width:18px;height:18px;background:#ff3b30;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,.35)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

const driverPinIcon = L.divIcon({
  className: 'leaflet-marker-driver-wrap',
  html: '<div style="width:16px;height:16px;background:#007AFF;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 10px rgba(0,122,255,.45)"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

function RecenterOnDriver({ driver }) {
  const map = useMap()
  useEffect(() => {
    if (!driver?.lat || !driver?.lng) return
    map.flyTo([driver.lat, driver.lng], Math.max(map.getZoom(), 14), { duration: 0.6 })
  }, [driver?.lat, driver?.lng, map])
  return null
}

function haversineKm(aLat, aLng, bLat, bLng) {
  const toRad = (v) => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad((bLat || 0) - (aLat || 0))
  const dLng = toRad((bLng || 0) - (aLng || 0))
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(aLat || 0)) * Math.cos(toRad(bLat || 0)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  return R * c
}

async function getRouteLine(start, end, signal) {
  if (!start || !end) return []
  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
  const res = await fetch(url, { signal })
  const json = await res.json()
  const coords = json?.routes?.[0]?.geometry?.coordinates
  if (!Array.isArray(coords) || coords.length < 2) return []
  return coords.map(([lng, lat]) => [lat, lng])
}

/** Avoid Leaflet "container already initialized" under React StrictMode dev double-mount. */
function MapMountGate({ children }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(true)
  }, [])
  if (!ready) {
    return (
      <div className="flex h-full min-h-[220px] items-center justify-center bg-[#f8fafc] text-[13px] font-semibold text-[#8a9aab]">
        Loading map…
      </div>
    )
  }
  return children
}

/** Read-only route preview after pickup & dropoff are chosen via search. */
export function RideRoutePreviewMap({ pickup, dropoff, className = '' }) {
  const center = useMemo(() => {
    if (pickup && dropoff) return [(pickup.lat + dropoff.lat) / 2, (pickup.lng + dropoff.lng) / 2]
    if (pickup) return [pickup.lat, pickup.lng]
    if (dropoff) return [dropoff.lat, dropoff.lng]
    return [23.8103, 90.4125]
  }, [pickup, dropoff])

  const zoom = useMemo(() => {
    if (pickup && dropoff) {
      const dLat = Math.abs(pickup.lat - dropoff.lat)
      const dLng = Math.abs(pickup.lng - dropoff.lng)
      const span = Math.max(dLat, dLng)
      if (span > 0.5) return 10
      if (span > 0.15) return 11
      if (span > 0.05) return 12
      return 13
    }
    return 12
  }, [pickup, dropoff])

  const line = pickup && dropoff ? [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]] : []

  return (
    <div className={`relative isolate z-0 grid gap-2 ${className}`}>
      <p className="text-[12px] font-medium leading-snug text-[#8a9aab]">
        Map preview only — set locations using the search fields above. Pins update when you pick a result.
      </p>
      <div className="relative z-0 h-[min(280px,50vh)] min-h-[200px] overflow-hidden rounded-[1.25rem] ring-1 ring-[#d9e3ec]">
        <MapMountGate>
          <MapContainer center={center} zoom={zoom} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {pickup ? <Marker position={[pickup.lat, pickup.lng]} icon={pickupPinIcon} /> : null}
            {dropoff ? <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffPinIcon} /> : null}
            {line.length ? <Polyline positions={line} pathOptions={{ color: '#007AFF', weight: 4, opacity: 0.85 }} /> : null}
          </MapContainer>
        </MapMountGate>
      </div>
    </div>
  )
}

export function LiveRideMap({ pickup, dropoff, driver, destinationLabel = '' }) {
  const center = useMemo(() => {
    if (driver?.lat && driver?.lng) return [driver.lat, driver.lng]
    if (pickup?.lat && pickup?.lng) return [pickup.lat, pickup.lng]
    return [23.8103, 90.4125]
  }, [driver?.lat, driver?.lng, pickup?.lat, pickup?.lng])
  const [routeLine, setRouteLine] = useState([])
  const [remainingLine, setRemainingLine] = useState([])

  useEffect(() => {
    if (!pickup || !dropoff) {
      setRouteLine([])
      return
    }
    const ctrl = new AbortController()
    getRouteLine(pickup, dropoff, ctrl.signal)
      .then((line) => setRouteLine(line))
      .catch(() => setRouteLine([[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]))
    return () => ctrl.abort()
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng])

  useEffect(() => {
    if (!driver || !dropoff) {
      setRemainingLine([])
      return
    }
    const ctrl = new AbortController()
    getRouteLine(driver, dropoff, ctrl.signal)
      .then((line) => setRemainingLine(line))
      .catch(() => setRemainingLine([[driver.lat, driver.lng], [dropoff.lat, dropoff.lng]]))
    return () => ctrl.abort()
  }, [driver?.lat, driver?.lng, dropoff?.lat, dropoff?.lng])

  const totalKm = pickup && dropoff ? haversineKm(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng) : 0
  const remainingKm = driver && dropoff ? haversineKm(driver.lat, driver.lng, dropoff.lat, dropoff.lng) : totalKm
  const progressPct = totalKm > 0 ? Math.max(0, Math.min(100, Math.round(((totalKm - remainingKm) / totalKm) * 100))) : 0

  return (
    <div className="relative h-64 overflow-hidden rounded-xl border border-[#d6e8f6]">
      <MapMountGate>
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pickup ? <Marker position={[pickup.lat, pickup.lng]} icon={pickupPinIcon} /> : null}
          {dropoff ? <Marker position={[dropoff.lat, dropoff.lng]} icon={dropoffPinIcon} /> : null}
          {driver ? <Marker position={[driver.lat, driver.lng]} icon={driverPinIcon} /> : null}
          {routeLine.length ? <Polyline positions={routeLine} pathOptions={{ color: '#93c5fd', weight: 4 }} /> : null}
          {remainingLine.length ? <Polyline positions={remainingLine} pathOptions={{ color: '#2563eb', weight: 5 }} /> : null}
          <RecenterOnDriver driver={driver} />
        </MapContainer>
      </MapMountGate>
      <div className="pointer-events-none absolute left-2 top-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#1c2731] ring-1 ring-[#d9e3ec]">
        {destinationLabel ? `Going to: ${destinationLabel}` : 'En route'}
      </div>
      <div className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#2563eb] ring-1 ring-[#d9e3ec]">
        Progress: {progressPct}% · Remaining {remainingKm.toFixed(1)} km
      </div>
    </div>
  )
}
