import { useEffect, useMemo, useState } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, useMapEvents } from 'react-leaflet'
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

function PickerLayer({ target, onPickupChange, onDropoffChange }) {
  useMapEvents({
    click(event) {
      const payload = { lat: event.latlng.lat, lng: event.latlng.lng }
      if (target === 'pickup') onPickupChange(payload)
      else onDropoffChange(payload)
    },
  })
  return null
}

export function RideMapPicker({ pickup, dropoff, onPickupChange, onDropoffChange, className = '' }) {
  const [target, setTarget] = useState('pickup')
  const center = useMemo(() => [23.8103, 90.4125], [])
  const line = pickup && dropoff ? [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]] : []

  return (
    <div className={`grid gap-3 ${className}`}>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTarget('pickup')}
          className={`rounded-[1rem] px-4 py-2 text-[13px] font-bold transition-all ${target === 'pickup' ? 'bg-[#34c759] text-white shadow-md ring-2 ring-[#34c759]/40' : 'bg-[#f8fafc] text-[#1c2731] ring-1 ring-[#d9e3ec] hover:bg-white'}`}
        >
          Pickup on map
        </button>
        <button
          type="button"
          onClick={() => setTarget('dropoff')}
          className={`rounded-[1rem] px-4 py-2 text-[13px] font-bold transition-all ${target === 'dropoff' ? 'bg-[#ff3b30] text-white shadow-md ring-2 ring-[#ff3b30]/40' : 'bg-[#f8fafc] text-[#1c2731] ring-1 ring-[#d9e3ec] hover:bg-white'}`}
        >
          Dropoff on map
        </button>
      </div>
      <p className="text-[12px] font-medium leading-snug text-[#8a9aab]">
        OpenStreetMap (free). Choose pickup or dropoff, then tap the map — latitude and longitude are saved automatically. Addresses are filled when possible via OSM search.
      </p>
      <div className="h-[min(320px,55vh)] min-h-[220px] overflow-hidden rounded-[1.25rem] ring-1 ring-[#d9e3ec]">
        <MapMountGate>
          <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <PickerLayer target={target} onPickupChange={onPickupChange} onDropoffChange={onDropoffChange} />
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
