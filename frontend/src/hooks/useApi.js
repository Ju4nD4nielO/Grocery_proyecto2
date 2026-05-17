const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3008'

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export const api = {
  get:    (path)           => request(path),
  post:   (path, body)     => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body)     => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  delete: (path)           => request(path, { method: 'DELETE' }),
}