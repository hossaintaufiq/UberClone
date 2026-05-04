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

