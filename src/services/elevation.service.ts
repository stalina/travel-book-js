import { loggerService } from './logger.service'

export type ElevationCache = Record<string, number | null>

// Use dev proxy path to avoid CORS in development; Vite rewrites to https://api.opentopodata.org
const API_URL = '/api/opentopo/v1/aster30m'

type Pending = {
  lat: number
  lon: number
  resolvers: Array<(v: number | null) => void>
}

/**
 * Service de récupération d'altitudes via l'API OpenTopoData
 * Implémente un système de cache et de batch pour optimiser les requêtes
 */
export class ElevationService {
  private static instance: ElevationService
  
  // In-memory cache only (no network cache file)
  private memCache = new Map<string, number | null>()
  private pendingByKey = new Map<string, Pending>()
  private queue: Array<{ key: string; lat: number; lon: number }> = []
  private processing = false

  /**
   * Constructeur privé pour forcer l'utilisation du pattern Singleton
   */
  private constructor() {}

  /**
   * Obtient l'instance unique du ElevationService
   * @returns L'instance singleton de ElevationService
   */
  public static getInstance(): ElevationService {
    if (!ElevationService.instance) {
      ElevationService.instance = new ElevationService()
    }
    return ElevationService.instance
  }

  /**
   * Récupère l'altitude pour une coordonnée GPS donnée
   * Utilise le cache si disponible, sinon ajoute à la queue de traitement
   * @param lat - Latitude
   * @param lon - Longitude
   * @returns L'altitude en mètres ou null en cas d'erreur
   */
  public async getElevation(lat: number, lon: number): Promise<number | null> {
    const key = this.normalizeKey(lat, lon)

    if (this.memCache.has(key)) {
      const cached = this.memCache.get(key)!
      loggerService.debug('ElevationService', `Cache hit pour ${key}`, { elevation: cached })
      return cached
    }

    return new Promise<number | null>((resolve) => {
      let p = this.pendingByKey.get(key)
      if (!p) {
        p = { lat, lon, resolvers: [] }
        this.pendingByKey.set(key, p)
        this.queue.push({ key, lat, lon })
      }
      p.resolvers.push(resolve)
      void this.processQueue()
    })
  }

  /**
   * Récupère les altitudes pour un tableau de coordonnées GPS en batch
   * Optimise les requêtes en groupant par chunks de 100 points
   * @param locs - Tableau de coordonnées {lat, lon}
   * @returns Tableau d'altitudes correspondantes (même ordre)
   */
  public async getElevationsBulk(locs: Array<{ lat: number; lon: number }>): Promise<Array<number | null>> {
    if (!locs.length) return []
    
    loggerService.debug('ElevationService', `Bulk fetch pour ${locs.length} points`)
    
    // Normalize and dedupe while preserving order mapping
    const keys = locs.map(({ lat, lon }) => this.normalizeKey(lat, lon))
    const out: Array<number | null> = new Array(locs.length).fill(null)

    // First, fill from cache
    let need: Array<{ idx: number; key: string; lat: number; lon: number }> = []
    for (let i = 0; i < locs.length; i++) {
      const key = keys[i]
      const cached = this.memCache.get(key)
      if (cached !== undefined) {
        out[i] = cached
      } else {
        need.push({ idx: i, key, lat: locs[i].lat, lon: locs[i].lon })
      }
    }

    // If everything was cached, return early
    if (need.length === 0) {
      loggerService.debug('ElevationService', 'Tous les points en cache')
      return out
    }

    loggerService.debug('ElevationService', `${need.length} points à récupérer depuis l'API`)

    // Batch in chunks of 100 like Python
    const chunkSize = 100
    for (let start = 0; start < need.length; start += chunkSize) {
      const chunk = need.slice(start, start + chunkSize)
      await this.fetchBatch(chunk, out)
      
      // Respect 1 req/s if more chunks remain
      if (start + chunkSize < need.length) {
        await new Promise((r) => setTimeout(r, 1000))
      }
    }
    
    loggerService.debug('ElevationService', 'Bulk fetch terminé', { total: locs.length, fetched: need.length })
    return out
  }

  /**
   * Normalise une paire de coordonnées en clé de cache
   * @param lat - Latitude
   * @param lon - Longitude
   * @returns Clé normalisée
   */
  private normalizeKey(lat: number, lon: number): string {
    // Normalize to a stable precision to maximize cache hits
    return `${lat.toFixed(6)},${lon.toFixed(6)}`
  }

  /**
   * Récupère un batch de points depuis l'API
   * @param chunk - Chunk de points à récupérer
   * @param out - Tableau de sortie à remplir
   */
  private async fetchBatch(
    chunk: Array<{ idx: number; key: string; lat: number; lon: number }>,
    out: Array<number | null>
  ): Promise<void> {
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
        this.memCache.set(key, elev)
      }
      loggerService.debug('ElevationService', `Batch récupéré: ${chunk.length} points`)
    } catch (error) {
      // On error, fill the chunk with null and cache it to avoid retry storm
      loggerService.warn('ElevationService', 'Erreur lors du fetch batch', error)
      for (const { idx, key } of chunk) {
        out[idx] = null
        this.memCache.set(key, null)
      }
    }
  }

  /**
   * Traite la queue de requêtes en batch
   * Évite les requêtes concurrentes grâce au flag processing
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return
    this.processing = true
    try {
      while (this.queue.length > 0) {
        // Batch up to 100 points per request
        const batch = this.queue.splice(0, 100)
        const locationsParam = batch.map(({ lat, lon }) => `${lat},${lon}`).join('|')
        try {
          const res = await fetch(`${API_URL}?locations=${locationsParam}`)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const data = (await res.json()) as { results?: Array<{ elevation?: number | null }> }
          const results = data.results || []
          for (let i = 0; i < batch.length; i++) {
            const { key } = batch[i]
            const elev = (results[i]?.elevation ?? null) as number | null
            this.memCache.set(key, elev)
            const pending = this.pendingByKey.get(key)
            if (pending) {
              for (const r of pending.resolvers) r(elev)
              this.pendingByKey.delete(key)
            }
          }
          loggerService.debug('ElevationService', `Queue batch traité: ${batch.length} points`)
        } catch (error) {
          // On error, resolve all with null to avoid blocking UI
          loggerService.warn('ElevationService', 'Erreur lors du traitement queue', error)
          for (const { key } of batch) {
            this.memCache.set(key, null)
            const pending = this.pendingByKey.get(key)
            if (pending) {
              for (const r of pending.resolvers) r(null)
              this.pendingByKey.delete(key)
            }
          }
        }
        // Respect API guidance similar to Python (1 call per second)
        if (this.queue.length > 0) {
          await new Promise((r) => setTimeout(r, 1000))
        }
      }
    } finally {
      this.processing = false
    }
  }
}

// Export singleton instance
export const elevationService = ElevationService.getInstance()
