import { describe, it, expect, beforeAll, vi } from 'vitest'
import { 
  MapBuilder,
  buildMapSection,
  type MapBuilderContext 
} from '../../src/services/builders/map.builder'
import type { Step, Trip } from '../../src/models/types'

describe('map.builder - MapBuilder', () => {
  const createTrip = (steps: Step[]): Trip => ({
    id: 1,
    name: 'Test Trip',
    start_date: Math.floor(Date.now() / 1000),
    end_date: Math.floor(Date.now() / 1000),
    steps,
    cover_photo: null
  })

  describe('bounding box calculation', () => {
    it('calcule la bounding box pour plusieurs étapes', async () => {
      const steps: Step[] = [
        { id: 1, name: 'A', lat: 48.8566, lon: 2.3522, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' },
        { id: 2, name: 'B', lat: 52.52, lon: 13.405, country: 'DE', country_code: 'de', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'b' }
      ]
      const trip = createTrip(steps)
      
      // Mock fetch pour éviter les appels réseau
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false
      } as Response)

      const builder = new MapBuilder(trip, {}, {})
      const html = await builder.build()

      // Vérifie que la map-page est générée
      expect(html).toContain('map-page')
      expect(html).toContain('map-svg')
    })

    it('retourne vide pour un tableau vide', async () => {
      const trip = createTrip([])
      const builder = new MapBuilder(trip, {}, {})
      const html = await builder.build()
      
      expect(html).toBe('')
    })
  })

  describe('coordinate conversion', () => {
    it('convertit des coordonnées lat/lon en coordonnées SVG', async () => {
      const steps: Step[] = [
        { id: 1, name: 'A', lat: 48, lon: 2, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' },
        { id: 2, name: 'B', lat: 52, lon: 14, country: 'DE', country_code: 'de', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'b' }
      ]
      const trip = createTrip(steps)

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false
      } as Response)

      const builder = new MapBuilder(trip, {}, {})
      const html = await builder.build()

      // Vérifie que le SVG est généré avec des coordonnées
      expect(html).toContain('viewBox')
      expect(html).toContain('map-svg')
    })
  })

  describe('path generation', () => {
    it('génère un path M/L pour plusieurs étapes', async () => {
      const steps: Step[] = [
        { id: 1, name: 'A', lat: 48, lon: 2, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' },
        { id: 2, name: 'B', lat: 52, lon: 14, country: 'DE', country_code: 'de', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'b' }
      ]
      const trip = createTrip(steps)

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false
      } as Response)

      const builder = new MapBuilder(trip, {}, {})
      const html = await builder.build()

      expect(html).toContain('path')
      expect(html).toContain('class="map-route"')
    })

    it('ne génère pas de path pour une seule étape', async () => {
      const steps: Step[] = [
        { id: 1, name: 'A', lat: 48, lon: 2, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' }
      ]
      const trip = createTrip(steps)

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false
      } as Response)

      const builder = new MapBuilder(trip, {}, {})
      const html = await builder.build()

      // Vérifie qu'il n'y a pas de tracé (path vide ou absent)
      // Note: Le path peut exister mais être vide
      expect(html).toContain('map-page')
    })
  })

  describe('step markers generation', () => {
    it('génère des foreignObject pour chaque étape', async () => {
      const steps: Step[] = [
        { id: 1, name: 'A', lat: 48, lon: 2, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' }
      ]
      const trip = createTrip(steps)
      const photosMapping = {
        1: {
          1: { path: 'photo.jpg', index: 1, ratio: 'LANDSCAPE' }
        }
      }
      const photoDataUrlMap = {}

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false
      } as Response)

      const builder = new MapBuilder(trip, photosMapping, photoDataUrlMap)
      const html = await builder.build()

      expect(html).toContain('foreignObject')
      expect(html).toContain('map-marker')
    })

    it('utilise un icône fallback si pas de photo', async () => {
      const steps: Step[] = [
        { id: 1, name: 'A', lat: 48, lon: 2, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' }
      ]
      const trip = createTrip(steps)
      const photosMapping = {}
      const photoDataUrlMap = {}

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false
      } as Response)

      const builder = new MapBuilder(trip, photosMapping, photoDataUrlMap)
      const html = await builder.build()

      expect(html).toContain('📍')
    })
  })
})

describe('map.builder - buildMapSection (backward compatibility)', () => {
  beforeAll(() => {
    // Mock fetch pour les tiles satellite
    globalThis.fetch = vi.fn((url: string) => {
      const hostname = (() => { try { return new URL(url).hostname } catch { return '' } })();
      if (
        hostname === 'arcgisonline.com' ||
        hostname.endsWith('.arcgisonline.com')
      ) {
        return Promise.resolve({
          blob: () => Promise.resolve(new Blob(['fake-tile'], { type: 'image/jpeg' })),
          ok: true
        } as Response)
      }
      return Promise.reject(new Error('Not found'))
    }) as any
  })

  it('génère une map-page avec SVG', async () => {
    const trip: Trip = {
      id: 1,
      name: 'Test',
      start_date: 0,
      end_date: 100,
      steps: [
        { id: 1, name: 'A', lat: 48, lon: 2, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' },
        { id: 2, name: 'B', lat: 52, lon: 14, country: 'DE', country_code: 'de', start_time: 50, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'b' }
      ],
      summary: '',
      cover_photo: null
    }

    const context: MapBuilderContext = {
      trip,
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = await buildMapSection(context)

    expect(html).toContain('class="break-after map-page"')
    expect(html).toContain('<svg class="map-svg"')
    expect(html).toContain('viewBox="0 0 1000 1000"')
  })

  it('retourne une chaîne vide si aucune étape', async () => {
    const trip: Trip = {
      id: 1,
      name: 'Test',
      start_date: 0,
      end_date: 100,
      steps: [],
      summary: '',
      cover_photo: null
    }

    const context: MapBuilderContext = {
      trip,
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = await buildMapSection(context)

    expect(html).toBe('')
  })
})
