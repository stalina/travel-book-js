export type ElevationCache = Record<string, number | null>

// Use dev proxy path to avoid CORS in development; Vite rewrites to https://api.opentopodata.org
const API_URL = '/api/opentopo/v1/aster30m'

// In-memory cache only (no network cache file)
const memCache = new Map<string, number | null>()

type Pending = {
  lat: number
  lon: number
  resolvers: Array<(v: number | null) => void>
}

const pendingByKey = new Map<string, Pending>()
const queue: Array<{ key: string; lat: number; lon: number }> = []
let processing = false

function normalizeKey(lat: number, lon: number): string {
  // Normalize to a stable precision to maximize cache hits
  return `${lat.toFixed(6)},${lon.toFixed(6)}`
}

export async function getElevation(lat: number, lon: number): Promise<number | null> {
  const key = normalizeKey(lat, lon)

  if (memCache.has(key)) return memCache.get(key)!

  return new Promise<number | null>((resolve) => {
    let p = pendingByKey.get(key)
    if (!p) {
      p = { lat, lon, resolvers: [] }
      pendingByKey.set(key, p)
      queue.push({ key, lat, lon })
    }
    p.resolvers.push(resolve)
    void processQueue()
  })
}

export async function getElevationsBulk(locs: Array<{ lat: number; lon: number }>): Promise<Array<number | null>> {
  if (!locs.length) return []
  // Normalize and dedupe while preserving order mapping
  const keys = locs.map(({ lat, lon }) => normalizeKey(lat, lon))
  const out: Array<number | null> = new Array(locs.length).fill(null)

  // First, fill from cache
  let need: Array<{ idx: number; key: string; lat: number; lon: number }> = []
  for (let i = 0; i < locs.length; i++) {
    const key = keys[i]
    const cached = memCache.get(key)
    if (cached !== undefined) {
      out[i] = cached
    } else {
      need.push({ idx: i, key, lat: locs[i].lat, lon: locs[i].lon })
    }
  }

  // If everything was cached, return early
  if (need.length === 0) return out

  // Batch in chunks of 100 like Python
  const chunkSize = 100
  for (let start = 0; start < need.length; start += chunkSize) {
    const chunk = need.slice(start, start + chunkSize)
    const locationsParam = chunk.map(({ lat, lon }) => `${lat},${lon}`).join('|')
    try {
      const res = await fetch(`${API_URL}?locations=${locationsParam}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { results?: Array<{ elevation?: number | null }> }
      const results = data.results || []
      for (let i = 0; i < chunk.length; i++) {
        const { idx, key } = chunk[i]
        const elev = (results[i]?.elevation ?? null) as number | null
        out[idx] = elev
        memCache.set(key, elev)
      }
    } catch {
      // On error, fill the chunk with null and cache it to avoid retry storm
      for (const { idx, key } of chunk) {
        out[idx] = null
        memCache.set(key, null)
      }
    }
    // Respect 1 req/s if more chunks remain
    if (start + chunkSize < need.length) {
      await new Promise((r) => setTimeout(r, 1000))
    }
  }
  return out
}

async function processQueue(): Promise<void> {
  if (processing) return
  processing = true
  try {
    while (queue.length > 0) {
      // Batch up to 100 points per request
      const batch = queue.splice(0, 100)
      const locationsParam = batch.map(({ lat, lon }) => `${lat},${lon}`).join('|')
      try {
        const res = await fetch(`${API_URL}?locations=${locationsParam}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as { results?: Array<{ elevation?: number | null }> }
        const results = data.results || []
        for (let i = 0; i < batch.length; i++) {
          const { key } = batch[i]
          const elev = (results[i]?.elevation ?? null) as number | null
          memCache.set(key, elev)
          const pending = pendingByKey.get(key)
          if (pending) {
            for (const r of pending.resolvers) r(elev)
            pendingByKey.delete(key)
          }
        }
      } catch (_err) {
        // On error, resolve all with null to avoid blocking UI
        for (const { key } of batch) {
          memCache.set(key, null)
          const pending = pendingByKey.get(key)
          if (pending) {
            for (const r of pending.resolvers) r(null)
            pendingByKey.delete(key)
          }
        }
      }
      // Respect API guidance similar to Python (1 call per second)
      if (queue.length > 0) {
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
  } finally {
    processing = false
  }
}
