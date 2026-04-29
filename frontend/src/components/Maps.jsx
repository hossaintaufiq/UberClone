import { useMemo, useState } from 'react'
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

export function RideMapPicker({ pickup, dropoff, onPickupChange, onDropoffChange }) {
  const [target, setTarget] = useState('pickup')
  const center = useMemo(() => [23.8103, 90.4125], [])
  const line = pickup && dropoff ? [[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]] : []

  return (
    <div className="grid gap-2">
      <div className="flex gap-2">
        <button type="button" onClick={() => setTarget('pickup')} className={`rounded-md px-3 py-1 text-xs font-semibold ${target === 'pickup' ? 'bg-[#36a7e6] text-white' : 'bg-[#e7f5ff] text-[#35617f]'}`}>
          Set Pickup
        </button>
        <button type="button" onClick={() => setTarget('dropoff')} className={`rounded-md px-3 py-1 text-xs font-semibold ${target === 'dropoff' ? 'bg-[#36a7e6] text-white' : 'bg-[#e7f5ff] text-[#35617f]'}`}>
          Set Destination
        </button>
      </div>
      <div className="h-64 overflow-hidden rounded-xl border border-[#d6e8f6]">
        <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <PickerLayer target={target} onPickupChange={onPickupChange} onDropoffChange={onDropoffChange} />
          {pickup ? <Marker position={[pickup.lat, pickup.lng]} /> : null}
          {dropoff ? <Marker position={[dropoff.lat, dropoff.lng]} /> : null}
          {line.length ? <Polyline positions={line} pathOptions={{ color: '#3B82F6', weight: 4 }} /> : null}
        </MapContainer>
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
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {pickup ? <Marker position={[pickup.lat, pickup.lng]} /> : null}
        {dropoff ? <Marker position={[dropoff.lat, dropoff.lng]} /> : null}
        {driver ? <Marker position={[driver.lat, driver.lng]} /> : null}
        {line.length ? <Polyline positions={line} pathOptions={{ color: '#3B82F6', weight: 4 }} /> : null}
      </MapContainer>
    </div>
  )
}
