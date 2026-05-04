import { API_BASE } from '../constants/auth'

export async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const tokenKey = options.tokenKey || 'rider_token'
  if (!options.skipAuth) {
    const token = localStorage.getItem(tokenKey)
    if (token) headers.Authorization = `Bearer ${token}`
  }

  // Remove content-type for FormData
  if (options.body instanceof FormData) {
    delete headers['Content-Type']
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method || 'GET',
    headers,
    body: options.body instanceof FormData
      ? options.body
      : options.body ? JSON.stringify(options.body) : undefined,
  })

  const raw = await response.text()
  let data = {}
  try {
    data = raw ? JSON.parse(raw) : {}
  } catch {
    data = {
      success: false,
      message: raw ? `${raw.slice(0, 180)}${raw.length > 180 ? '…' : ''}` : `Server error (${response.status})`,
    }
  }

  if (!response.ok || data.success === false) {
    const error = new Error(data.message || `Request failed (${response.status})`)
    error.status = response.status
    throw error
  }

  return data
}
