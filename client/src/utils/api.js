/**
 * utils/api.js
 * ✅ Bug 3 fixed: proper error handling on all requests
 */

const BASE = '/api'

async function request(url, options = {}) {
  try {
    const res = await fetch(url, options)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || `Server error: ${res.status}`)
    }
    return res.json()
  } catch (err) {
    // Network error (server down) or server error
    console.error(`API error [${url}]:`, err.message)
    throw err  // re-throw so callers can show proper UI feedback
  }
}

export function saveExperiment(payload) {
  return request(`${BASE}/experiments`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  })
}

export function getExperiments() {
  return request(`${BASE}/experiments`)
}

export function getExperiment(id) {
  return request(`${BASE}/experiments/${id}`)
}

export function deleteExperiment(id) {
  return request(`${BASE}/experiments/${id}`, { method: 'DELETE' })
}