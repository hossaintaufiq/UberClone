import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer } from 'react-leaflet'
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

export function LiveRideMap({ pickup, dropoff, driver }) {
  const center = useMemo(() => {
    if (driver?.lat && driver?.lng) return [driver.lat, driver.lng]
    if (pickup?.lat && pickup?.lng) return [pickup.lat, pickup.lng]
    return [23.8103, 90.4125]
  }, [driver?.lat, driver?.lng, pickup?.lat, pickup?.lng])

  const line = pickup && dropoff ? [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]] : []

  return (
    <div className="h-64 overflow-hidden rounded-xl border border-[#d6e8f6]">
      <MapMountGate>
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {pickup ? <Marker position={[pickup.lat, pickup.lng]} /> : null}
          {dropoff ? <Marker position={[dropoff.lat, dropoff.lng]} /> : null}
          {driver ? <Marker position={[driver.lat, driver.lng]} /> : null}
          {line.length ? <Polyline positions={line} pathOptions={{ color: '#3B82F6', weight: 4 }} /> : null}
        </MapContainer>
      </MapMountGate>
    </div>
  )
}
