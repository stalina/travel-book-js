import { Trip } from '../../models/types'
import { esc, numberFr0, COUNTRY_FR, countryNameFrFromCode } from './utils'
import { loggerService } from '../logger.service'

/**
 * Calcule la distance en kilomètres entre deux points GPS en utilisant la formule de Haversine
 * @param lat1 - Latitude du premier point
 * @param lon1 - Longitude du premier point
 * @param lat2 - Latitude du deuxième point
 * @param lon2 - Longitude du deuxième point
 * @returns Distance en kilomètres
 */
export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const toRad = (d: number) => d * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/** @deprecated Utiliser StatsBuilder à la place */
export type StatsBuilderContext = {
  trip: Trip
  photosMapping: Record<number, Record<number, any>>
}

/**
 * Builder pour générer la page de statistiques du voyage
 * Prend le voyage et le mapping des photos via le constructeur
 */
export class StatsBuilder {
  /**
   * Crée une instance de StatsBuilder
   * @param trip - Le voyage complet avec toutes les étapes
   * @param photosMapping - Mapping des photos par étape
   */
  constructor(
    private readonly trip: Trip,
    private readonly photosMapping: Record<number, Record<number, any>>
  ) {}

  /**
   * Génère le HTML complet de la page de statistiques
   * @returns HTML de la page de statistiques ou chaîne vide si aucune étape
   */
  public build(): string {
    try {
      if (!this.trip.steps.length) return ''
      
      loggerService.debug('StatsBuilder', 'Construction page statistiques', { steps: this.trip.steps.length })
      
      const countries = this.extractUniqueCountries()
      const totalPhotos = this.calculateTotalPhotos()
      const km = this.calculateTotalKilometers()
      const days = this.calculateDays()
      const stepsCount = this.trip.steps.length
      const { maxDistKm, farCity } = this.findFarthestPoint()
      
      return this.generateHtml(countries, totalPhotos, km, days, stepsCount, maxDistKm, farCity)
    } catch (e) {
      loggerService.error('stats-builder', 'Erreur lors de la génération des statistiques', e)
      return ''
    }
  }

  /**
   * Extrait la liste des pays uniques traversés dans l'ordre d'apparition
   * @returns Tableau des pays avec code et nom
   */
  private extractUniqueCountries(): Array<{ code: string, name: string }> {
    const seen = new Set<string>()
    const countries: { code: string, name: string }[] = []
    
    for (const s of this.trip.steps) {
      const code = (s.country_code || '').toLowerCase()
      if (code && code !== '00' && !seen.has(code)) {
        seen.add(code)
        countries.push({ code, name: COUNTRY_FR[code] || countryNameFrFromCode(code, code) })
      }
    }
    
    loggerService.debug('StatsBuilder', 'Pays extraits', { count: countries.length, countries: countries.map(c => c.code) })
    return countries
  }

  /**
   * Calcule le nombre total de photos pour toutes les étapes
   * @returns Nombre total de photos
   */
  private calculateTotalPhotos(): number {
    let totalPhotos = 0
    for (const sid of Object.keys(this.photosMapping)) {
      totalPhotos += Object.keys(this.photosMapping[Number(sid)] || {}).length
    }
    return totalPhotos
  }

  /**
   * Calcule la distance totale du voyage en kilomètres
   * Utilise total_km si disponible, sinon calcule avec Haversine
   * @returns Distance totale en kilomètres (arrondie)
   */
  private calculateTotalKilometers(): number {
    const totalKm = (this.trip as any).total_km
    
    if (totalKm) {
      return Math.round(totalKm)
    }
    
    const calculated = this.trip.steps.reduce((acc, s, i, arr) => {
      if (i === 0) return 0
      const prev = arr[i-1]
      return acc + haversineKm(prev.lat, prev.lon, s.lat, s.lon)
    }, 0)
    
    return Math.round(calculated)
  }

  /**
   * Calcule le nombre de jours du voyage
   * @returns Nombre de jours (minimum 1)
   */
  private calculateDays(): number {
    const start = new Date(this.trip.start_date * 1000)
    const end = this.trip.end_date 
      ? new Date(this.trip.end_date * 1000) 
      : new Date(Math.max(...this.trip.steps.map(s => s.start_time * 1000)))
    
    const diff = Math.round((+end - +start) / (24*3600*1000)) + 1
    return Math.max(1, diff)
  }

  /**
   * Trouve le point le plus éloigné du point de départ
   * @returns Distance maximale en km et ville la plus éloignée
   */
  private findFarthestPoint(): { maxDistKm: number, farCity: string } {
    if (this.trip.steps.length === 0) {
      return { maxDistKm: 0, farCity: '' }
    }
    
    const first = this.trip.steps[0]
    let maxDist = 0
    let farStep: any = null
    
    for (const s of this.trip.steps) {
      const d = haversineKm(first.lat, first.lon, s.lat, s.lon)
      if (d > maxDist) { 
        maxDist = d
        farStep = s 
      }
    }
    
    const maxDistKm = Math.round(maxDist)
    const farCity = (farStep as any)?.city || farStep?.name || ''
    
    return { maxDistKm, farCity }
  }

  /**
   * Génère le HTML complet de la page de statistiques
   * @param countries - Liste des pays uniques
   * @param totalPhotos - Nombre total de photos
   * @param km - Distance totale en km
   * @param days - Nombre de jours
   * @param stepsCount - Nombre d'étapes
   * @param maxDistKm - Distance maximale depuis le départ
   * @param farCity - Ville la plus éloignée
   * @returns HTML de la page
   */
  private generateHtml(
    countries: Array<{ code: string, name: string }>,
    totalPhotos: number,
    km: number,
    days: number,
    stepsCount: number,
    maxDistKm: number,
    farCity: string
  ): string {
    const countriesHtml = countries.map(c => `
            <div class="stats-country">
              <div class="stats-country-shape">
                <img src="assets/images/maps/${esc(c.code)}.svg" alt="${esc(c.name)}" />
                <div class="stats-country-name">${esc(c.name)}</div>
              </div>
            </div>`).join('')

    const metricsGrid = `
              <div class="stats-metric"><div class="stats-icon">🗺️</div><div class="stats-value">${numberFr0(km)}</div><div class="stats-label">KILOMÈTRES</div></div>
              <div class="stats-metric"><div class="stats-icon">📆</div><div class="stats-value">${numberFr0(days)}</div><div class="stats-label">JOURS</div></div>
              <div class="stats-metric"><div class="stats-icon">📍</div><div class="stats-value">${numberFr0(stepsCount)}</div><div class="stats-label">ÉTAPES</div></div>
              <div class="stats-metric"><div class="stats-icon">📷</div><div class="stats-value">${numberFr0(totalPhotos)}</div><div class="stats-label">PHOTOS</div></div>`

    const tripSummary = esc((this.trip as any).summary || '')
    const departureCity = esc(((this.trip.steps[0] as any).city) || this.trip.steps[0].name || '')

    return `
      <div class="break-after stats-page">
        <div class="stats-layout">
          <div class="stats-left">
            <div class="stats-left-inner" style="--country-count:${countries.length};">${countriesHtml}</div>
          </div>
          <div class="stats-right">
            <div class="stats-header">
              <div class="stats-title">RÉSUMÉ DU VOYAGE</div>
              ${tripSummary ? `<div class="stats-subtitle">${tripSummary}</div>` : ''}
            </div>
            <div class="stats-metrics-grid">${metricsGrid}</div>
            <div class="stats-distance-block">
              <div class="stats-distance-diagram">
                <div class="stats-home-block">
                  <div class="stats-home">🏠</div>
                  <div class="stats-distance-text">Départ: ${departureCity}</div>
                </div>
                <div class="stats-arc">
                  <span>${numberFr0(maxDistKm)} km</span>
                  <svg class="stats-arc-svg" viewBox="0 0 1000 200" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M150 160 Q500 40 850 160" class="stats-arc-path" />
                  </svg>
                </div>
                <div class="stats-far-block">
                  <div class="stats-far">📍</div>
                  <div class="stats-distance-text">Point le plus éloigné${farCity ? ' : '+esc(farCity) : ''}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>`
  }
}

/**
 * Wrapper rétrocompatible (DEPRECATED - à supprimer après migration complète)
 * @deprecated Utiliser new StatsBuilder(trip, photosMapping).build() à la place
 */
export function buildStatsSection(context: StatsBuilderContext): string {
  const builder = new StatsBuilder(context.trip, context.photosMapping)
  return builder.build()
}
