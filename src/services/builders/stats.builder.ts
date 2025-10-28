import { Trip } from '../../models/types'
import { esc, numberFr0, COUNTRY_FR, countryNameFrFromCode } from './utils'
import { logger } from '../logger.service'

/**
 * Calcule la distance en kilomètres entre deux points GPS en utilisant la formule de Haversine
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

export type StatsBuilderContext = {
  trip: Trip
  photosMapping: Record<number, Record<number, any>>
}

/**
 * Construit la page de statistiques du voyage
 * @param context - Contexte contenant le voyage et le mapping des photos
 * @returns HTML de la page de statistiques
 */
export function buildStatsSection(context: StatsBuilderContext): string {
  try {
    const { trip, photosMapping } = context
    
    if (!trip.steps.length) return ''
    
    // Pays uniques dans l'ordre de première apparition
    const seen = new Set<string>()
    const countries: { code: string, name: string }[] = []
    for (const s of trip.steps) {
      const code = (s.country_code || '').toLowerCase()
      if (code && code !== '00' && !seen.has(code)) {
        seen.add(code)
        countries.push({ code, name: COUNTRY_FR[code] || countryNameFrFromCode(code, code) })
      }
    }
    
    // Nombre de photos total (depuis photosMapping)
    let totalPhotos = 0
    for (const sid of Object.keys(photosMapping)) {
      totalPhotos += Object.keys(photosMapping[Number(sid)] || {}).length
    }
    
    const totalKm = (trip as any).total_km
    const km = totalKm ? Math.round(totalKm) : Math.round(trip.steps.reduce((acc, s, i, arr) => {
      if (i === 0) return 0
      const prev = arr[i-1]
      return acc + haversineKm(prev.lat, prev.lon, s.lat, s.lon)
    }, 0))
    
    const days = (() => {
      const start = new Date(trip.start_date * 1000)
      const end = trip.end_date ? new Date(trip.end_date * 1000) : new Date(Math.max(...trip.steps.map(s => s.start_time * 1000)))
      const diff = Math.round((+end - +start) / (24*3600*1000)) + 1
      return Math.max(1, diff)
    })()
    
    const stepsCount = trip.steps.length
    
    // Point le plus éloigné de la première étape
    const first = trip.steps[0]
    let maxDist = 0
    let farStep: any = null
    for (const s of trip.steps) {
      const d = haversineKm(first.lat, first.lon, s.lat, s.lon)
      if (d > maxDist) { 
        maxDist = d
        farStep = s 
      }
    }
    const maxDistKm = Math.round(maxDist)
    const farCity = (farStep as any)?.city || farStep?.name || ''

    // Construction HTML (layout 2 colonnes)
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

    const tripSummary = esc((trip as any).summary || '')
    const departureCity = esc(((trip.steps[0] as any).city) || trip.steps[0].name || '')

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
  } catch (e) {
    logger.error('stats-builder', 'Erreur lors de la génération des statistiques', e)
    return ''
  }
}
