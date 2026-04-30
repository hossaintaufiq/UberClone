import { API_BASE } from '../constants/auth'

export async function apiRequest(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  const tokenKey = options.tokenKey || 'rider_token'
  const token = localStorage.getItem(tokenKey)
  if (token) headers.Authorization = `Bearer ${token}`

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

  const data = await response.json().catch(() => ({ success: false, message: 'Unexpected server response' }))
  if (!response.ok || data.success === false) {
    const error = new Error(data.message || 'Request failed')
    error.status = response.status
    throw error
  }

  return data
}
