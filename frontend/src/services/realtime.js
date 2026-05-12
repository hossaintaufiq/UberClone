import { io } from 'socket.io-client'
import { API_BASE } from '../constants/auth'

let socket

function getSocket() {
  if (!socket) {
    socket = io(API_BASE, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
    })
  }
  return socket
}

export function onRealtimeRefresh(callback) {
  const s = getSocket()
  const handler = () => {
    callback?.()
  }
  s.on('system:refresh', handler)
  return () => {
    s.off('system:refresh', handler)
  }
}

export function joinRideRoom(rideId) {
  if (!rideId) return
  const s = getSocket()
  s.emit('join:ride', String(rideId))
}

export function emitDriverLocation({ rideId, lat, lng, driverId }) {
  if (!rideId || !Number.isFinite(lat) || !Number.isFinite(lng)) return
  const s = getSocket()
  s.emit('driver:location', { rideId: String(rideId), lat, lng, driverId: driverId ? String(driverId) : undefined })
}

export function onDriverLocation(rideId, callback) {
  if (!rideId) return () => {}
  const s = getSocket()
  const wanted = String(rideId)
  const handler = (payload = {}) => {
    if (payload.rideId && String(payload.rideId) !== wanted) return
    const lat = Number(payload.lat)
    const lng = Number(payload.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    callback?.({ ...payload, lat, lng })
  }
  s.on('driver:location', handler)
  return () => {
    s.off('driver:location', handler)
  }
}

