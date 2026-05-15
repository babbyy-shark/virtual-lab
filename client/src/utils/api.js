const BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Server error: ${res.status}`)
  }
  return res.json()
}

export const saveExperiment   = (payload) => request(`${BASE}/experiments`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
})

export const getExperiments   = ()    => request(`${BASE}/experiments`)
export const getExperiment    = (id)  => request(`${BASE}/experiments/${id}`)
export const deleteExperiment = (id)  => request(`${BASE}/experiments/${id}`, { method: 'DELETE' })
