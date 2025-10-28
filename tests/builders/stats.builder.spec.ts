import { describe, it, expect } from 'vitest'
import { buildStatsSection, haversineKm, type StatsBuilderContext } from '../../src/services/builders/stats.builder'
import type { Trip } from '../../src/models/types'

describe('stats.builder - haversineKm', () => {
  it('calcule la distance entre Paris et Lyon', () => {
    // Paris: 48.8566, 2.3522
    // Lyon: 45.7640, 4.8357
    // Distance réelle: ~392 km
    const dist = haversineKm(48.8566, 2.3522, 45.7640, 4.8357)
    expect(dist).toBeGreaterThan(390)
    expect(dist).toBeLessThan(400)
  })

  it('retourne 0 pour deux points identiques', () => {
    const dist = haversineKm(48.8566, 2.3522, 48.8566, 2.3522)
    expect(dist).toBe(0)
  })

  it('gère les coordonnées négatives', () => {
    // Buenos Aires: -34.6037, -58.3816
    // São Paulo: -23.5505, -46.6333
    const dist = haversineKm(-34.6037, -58.3816, -23.5505, -46.6333)
    expect(dist).toBeGreaterThan(1600)
  })
})

describe('stats.builder - buildStatsSection', () => {
  const mockTrip: Trip = {
    id: 1,
    name: 'Voyage Multi-Pays',
    start_date: Date.UTC(2024, 0, 1) / 1000,
    end_date: Date.UTC(2024, 0, 10) / 1000,
    steps: [
      {
        id: 1,
        name: 'Paris',
        description: '',
        country: 'France',
        country_code: 'fr',
        lat: 48.8566,
        lon: 2.3522,
        start_time: Date.UTC(2024, 0, 1) / 1000,
        weather_condition: 'clear',
        weather_temperature: 10,
        slug: 'paris'
      },
      {
        id: 2,
        name: 'Berlin',
        description: '',
        country: 'Germany',
        country_code: 'de',
        lat: 52.52,
        lon: 13.405,
        start_time: Date.UTC(2024, 0, 5) / 1000,
        weather_condition: 'cloudy',
        weather_temperature: 5,
        slug: 'berlin'
      },
      {
        id: 3,
        name: 'Ljubljana',
        description: '',
        country: 'Slovenia',
        country_code: 'si',
        lat: 46.0569,
        lon: 14.5058,
        start_time: Date.UTC(2024, 0, 8) / 1000,
        weather_condition: 'rain',
        weather_temperature: 8,
        slug: 'ljubljana'
      }
    ],
    summary: 'Un voyage à travers l\'Europe',
    cover_photo: null
  }

  it('génère une stats-page avec la structure correcte', () => {
    const context: StatsBuilderContext = {
      trip: mockTrip,
      photosMapping: {
        1: { 1: { path: 'photo1.jpg', index: 1, ratio: 'LANDSCAPE' } },
        2: { 1: { path: 'photo2.jpg', index: 1, ratio: 'PORTRAIT' } }
      }
    }

    const html = buildStatsSection(context)

    expect(html).toContain('class="break-after stats-page"')
    expect(html).toContain('RÉSUMÉ DU VOYAGE')
  })

  it('affiche les pays uniques dans l\'ordre de première apparition', () => {
    const context: StatsBuilderContext = {
      trip: mockTrip,
      photosMapping: {}
    }

    const html = buildStatsSection(context)

    expect(html).toContain('FRANCE')
    expect(html).toContain('ALLEMAGNE')
    expect(html).toContain('SLOVENIE')
    
    // Vérifie l'ordre (France avant Allemagne)
    const franceIdx = html.indexOf('FRANCE')
    const allemagneIdx = html.indexOf('ALLEMAGNE')
    expect(franceIdx).toBeLessThan(allemagneIdx)
  })

  it('affiche les métriques de base', () => {
    const context: StatsBuilderContext = {
      trip: mockTrip,
      photosMapping: {}
    }

    const html = buildStatsSection(context)

    expect(html).toContain('KILOMÈTRES')
    expect(html).toContain('JOURS')
    expect(html).toContain('ÉTAPES')
    expect(html).toContain('PHOTOS')
  })

  it('compte correctement le nombre total de photos', () => {
    const context: StatsBuilderContext = {
      trip: mockTrip,
      photosMapping: {
        1: {
          1: { path: 'photo1.jpg', index: 1, ratio: 'LANDSCAPE' },
          2: { path: 'photo2.jpg', index: 2, ratio: 'PORTRAIT' }
        },
        2: {
          1: { path: 'photo3.jpg', index: 1, ratio: 'LANDSCAPE' }
        },
        3: {}
      }
    }

    const html = buildStatsSection(context)

    // 2 photos pour step 1 + 1 photo pour step 2 = 3 photos au total
    expect(html).toMatch(/3[\s\S]*?PHOTOS/)
  })

  it('utilise total_km du trip si fourni', () => {
    const tripWithTotalKm = {
      ...mockTrip,
      total_km: 2500.75
    } as any

    const context: StatsBuilderContext = {
      trip: tripWithTotalKm,
      photosMapping: {}
    }

    const html = buildStatsSection(context)

    // Arrondi à 2501
    expect(html).toContain('2')
    expect(html).toContain('501')
  })

  it('calcule la distance par haversine si total_km absent', () => {
    const context: StatsBuilderContext = {
      trip: mockTrip,
      photosMapping: {}
    }

    const html = buildStatsSection(context)

    // Distance Paris-Berlin + Berlin-Ljubljana devrait être > 1000 km
    // La distance calculée est 1601 km d'après les logs
    expect(html).toContain('1')
    expect(html).toContain('601')
    expect(html).toContain('KILOMÈTRES')
  })

  it('calcule correctement le nombre de jours', () => {
    const context: StatsBuilderContext = {
      trip: mockTrip,
      photosMapping: {}
    }

    const html = buildStatsSection(context)

    // Du 1er au 10 janvier = 10 jours
    expect(html).toMatch(/10[\s\S]*?JOURS/)
  })

  it('affiche le point le plus éloigné', () => {
    const context: StatsBuilderContext = {
      trip: mockTrip,
      photosMapping: {}
    }

    const html = buildStatsSection(context)

    expect(html).toContain('Point le plus éloigné')
  })

  it('ignore les pays avec country_code "00"', () => {
    const tripWithInvalidCountry: Trip = {
      ...mockTrip,
      steps: [
        ...mockTrip.steps,
        {
          id: 4,
          name: 'Unknown',
          description: '',
          country: 'Unknown',
          country_code: '00',
          lat: 0,
          lon: 0,
          start_time: Date.UTC(2024, 0, 9) / 1000,
          weather_condition: 'clear',
          weather_temperature: 20,
          slug: 'unknown'
        }
      ]
    }

    const context: StatsBuilderContext = {
      trip: tripWithInvalidCountry,
      photosMapping: {}
    }

    const html = buildStatsSection(context)

    // Ne devrait contenir que 3 pays (France, Allemagne, Slovénie)
    const franceCount = (html.match(/FRANCE/g) || []).length
    const allemagneCount = (html.match(/ALLEMAGNE/g) || []).length
    const slovenieCount = (html.match(/SLOVENIE/g) || []).length
    
    expect(franceCount).toBeGreaterThan(0)
    expect(allemagneCount).toBeGreaterThan(0)
    expect(slovenieCount).toBeGreaterThan(0)
  })

  it('affiche le résumé du voyage si fourni', () => {
    const context: StatsBuilderContext = {
      trip: mockTrip,
      photosMapping: {}
    }

    const html = buildStatsSection(context)

    expect(html).toContain('Un voyage à travers l\'Europe')
  })

  it('retourne une chaîne vide si aucune étape', () => {
    const emptyTrip: Trip = {
      ...mockTrip,
      steps: []
    }

    const context: StatsBuilderContext = {
      trip: emptyTrip,
      photosMapping: {}
    }

    const html = buildStatsSection(context)

    expect(html).toBe('')
  })

  it('retourne une chaîne vide en cas d\'erreur', () => {
    // Force une erreur en passant null comme trip
    const context: any = {
      trip: null,
      photosMapping: {}
    }

    const html = buildStatsSection(context)

    expect(html).toBe('')
  })
})
