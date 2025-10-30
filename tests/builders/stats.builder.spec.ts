import { describe, it, expect } from 'vitest'
import { StatsBuilder, haversineKm } from '../../src/services/builders/stats.builder'
import type { Trip } from '../../src/models/types'

describe('stats.builder - haversineKm', () => {
  it('calcule la distance entre Paris et Lyon', () => {
    const dist = haversineKm(48.8566, 2.3522, 45.7640, 4.8357)
    expect(dist).toBeGreaterThan(390)
    expect(dist).toBeLessThan(400)
  })

  it('retourne 0 pour deux points identiques', () => {
    const dist = haversineKm(48.8566, 2.3522, 48.8566, 2.3522)
    expect(dist).toBe(0)
  })

  it('gère les coordonnées négatives', () => {
    const dist = haversineKm(-34.6037, -58.3816, -23.5505, -46.6333)
    expect(dist).toBeGreaterThan(1600)
  })
})

describe('stats.builder - StatsBuilder', () => {
  const mockTrip: Trip = {
    id: 1,
    name: 'Voyage Multi-Pays',
    start_date: Date.UTC(2024, 0, 1) / 1000,
    end_date: Date.UTC(2024, 0, 10) / 1000,
    steps: [
      { id: 1, name: 'Paris', description: '', country: 'France', country_code: 'fr', lat: 48.8566, lon: 2.3522, start_time: Date.UTC(2024, 0, 1) / 1000, weather_condition: 'clear', weather_temperature: 10, slug: 'paris' },
      { id: 2, name: 'Berlin', description: '', country: 'Germany', country_code: 'de', lat: 52.52, lon: 13.405, start_time: Date.UTC(2024, 0, 5) / 1000, weather_condition: 'cloudy', weather_temperature: 5, slug: 'berlin' },
      { id: 3, name: 'Ljubljana', description: '', country: 'Slovenia', country_code: 'si', lat: 46.0569, lon: 14.5058, start_time: Date.UTC(2024, 0, 8) / 1000, weather_condition: 'rain', weather_temperature: 8, slug: 'ljubljana' }
    ],
    summary: 'Un voyage à travers l\'Europe',
    cover_photo: null
  }

  it('est une classe instanciable', () => {
    const builder = new StatsBuilder(mockTrip, {})
    expect(builder).toBeInstanceOf(StatsBuilder)
  })

  it('expose build()', () => {
    const builder = new StatsBuilder(mockTrip, {})
    expect(typeof builder.build).toBe('function')
  })

  it('génère la structure correcte', () => {
    const html = new StatsBuilder(mockTrip, {}).build()
    expect(html).toContain('class="break-after stats-page"')
    expect(html).toContain('RÉSUMÉ DU VOYAGE')
  })

  it('affiche les pays', () => {
    const html = new StatsBuilder(mockTrip, {}).build()
    expect(html).toContain('FRANCE')
    expect(html).toContain('ALLEMAGNE')
  })

  it('affiche les métriques', () => {
    const html = new StatsBuilder(mockTrip, {}).build()
    expect(html).toContain('KILOMÈTRES')
    expect(html).toContain('JOURS')
  })

  it('compte les photos', () => {
    const html = new StatsBuilder(mockTrip, { 1: { 1: {}, 2: {} }, 2: { 1: {} } }).build()
    expect(html).toMatch(/3[\s\S]*?PHOTOS/)
  })

  it('utilise total_km', () => {
    const html = new StatsBuilder({ ...mockTrip, total_km: 2500.75 } as any, {}).build()
    expect(html).toContain('2')
    expect(html).toContain('501')
  })

  it('calcule haversine', () => {
    const html = new StatsBuilder(mockTrip, {}).build()
    expect(html).toContain('1')
    expect(html).toContain('601')
  })

  it('calcule jours', () => {
    const html = new StatsBuilder(mockTrip, {}).build()
    expect(html).toMatch(/10[\s\S]*?JOURS/)
  })

  it('affiche point éloigné', () => {
    const html = new StatsBuilder(mockTrip, {}).build()
    expect(html).toContain('Point le plus éloigné')
  })

  it('ignore country_code 00', () => {
    const trip: Trip = { ...mockTrip, steps: [...mockTrip.steps, { id: 4, name: 'Unknown', description: '', country: 'Unknown', country_code: '00', lat: 0, lon: 0, start_time: Date.UTC(2024, 0, 9) / 1000, weather_condition: 'clear', weather_temperature: 20, slug: 'unknown' }] }
    const html = new StatsBuilder(trip, {}).build()
    expect(html).toContain('FRANCE')
  })

  it('affiche résumé', () => {
    const html = new StatsBuilder(mockTrip, {}).build()
    expect(html).toContain('Un voyage à travers l\'Europe')
  })

  it('retourne vide si pas d\'étapes', () => {
    const html = new StatsBuilder({ ...mockTrip, steps: [] }, {}).build()
    expect(html).toBe('')
  })

  it('retourne vide en cas d\'erreur', () => {
    const html = new StatsBuilder(null as any, {}).build()
    expect(html).toBe('')
  })
})
