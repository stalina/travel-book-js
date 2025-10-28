import { describe, it, expect, beforeAll, vi } from 'vitest'
import { 
  calculateBoundingBox, 
  calculateViewBox, 
  latLonToSvg, 
  generatePathData,
  generateStepMarkers,
  buildMapSection,
  type MapBuilderContext 
} from '../../src/services/builders/map.builder'
import type { Step, Trip } from '../../src/models/types'

describe('map.builder - calculateBoundingBox', () => {
  it('calcule la bounding box pour plusieurs étapes', () => {
    const steps: Step[] = [
      { id: 1, name: 'A', lat: 48.8566, lon: 2.3522, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' },
      { id: 2, name: 'B', lat: 52.52, lon: 13.405, country: 'DE', country_code: 'de', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'b' }
    ]

    const bbox = calculateBoundingBox(steps)

    expect(bbox).not.toBeNull()
    expect(bbox!.minLat).toBe(48.8566)
    expect(bbox!.maxLat).toBe(52.52)
    expect(bbox!.minLon).toBe(2.3522)
    expect(bbox!.maxLon).toBe(13.405)
  })

  it('retourne null pour un tableau vide', () => {
    const bbox = calculateBoundingBox([])
    expect(bbox).toBeNull()
  })
})

describe('map.builder - calculateViewBox', () => {
  it('ajoute le padding correctement', () => {
    const bbox = { minLat: 48, maxLat: 52, minLon: 2, maxLon: 14 }
    const viewBox = calculateViewBox(bbox, 0.1)

    // latSpan = 4, lonSpan = 12
    // padding lat = 0.4, padding lon = 1.2
    expect(viewBox.x).toBeCloseTo(2 - 1.2, 10)
    expect(viewBox.y).toBeCloseTo(48 - 0.4, 10)
    expect(viewBox.width).toBeCloseTo(12 + 2.4, 10)
    expect(viewBox.height).toBeCloseTo(4 + 0.8, 10)
  })
})

describe('map.builder - latLonToSvg', () => {
  it('convertit des coordonnées lat/lon en coordonnées SVG', () => {
    const viewBox = { x: 0, y: 0, width: 10, height: 10 }
    const coord = latLonToSvg(5, 5, viewBox)

    expect(coord.x).toBe(500) // (5-0)/10 * 1000
    expect(coord.y).toBe(500) // (0+10-5)/10 * 1000
  })
})

describe('map.builder - generatePathData', () => {
  it('génère un path M/L pour plusieurs étapes', () => {
    const steps: Step[] = [
      { id: 1, name: 'A', lat: 48, lon: 2, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' },
      { id: 2, name: 'B', lat: 52, lon: 14, country: 'DE', country_code: 'de', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'b' }
    ]
    const viewBox = { x: 0, y: 45, width: 15, height: 10 }

    const path = generatePathData(steps, viewBox)

    expect(path).toContain('M ')
    expect(path).toContain(' L ')
  })

  it('retourne une chaîne vide pour une seule étape', () => {
    const steps: Step[] = [
      { id: 1, name: 'A', lat: 48, lon: 2, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' }
    ]
    const viewBox = { x: 0, y: 45, width: 15, height: 10 }

    const path = generatePathData(steps, viewBox)

    expect(path).toBe('')
  })
})

describe('map.builder - generateStepMarkers', () => {
  it('génère des foreignObject pour chaque étape', () => {
    const steps: Step[] = [
      { id: 1, name: 'A', lat: 48, lon: 2, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' }
    ]
    const viewBox = { x: 0, y: 45, width: 15, height: 10 }
    const photosMapping = {
      1: {
        1: { path: 'photo.jpg', index: 1, ratio: 'LANDSCAPE' }
      }
    }
    const photoDataUrlMap = {}

    const markers = generateStepMarkers(steps, viewBox, photosMapping, photoDataUrlMap)

    expect(markers).toContain('foreignObject')
    expect(markers).toContain('map-marker')
  })

  it('utilise un icône fallback si pas de photo', () => {
    const steps: Step[] = [
      { id: 1, name: 'A', lat: 48, lon: 2, country: 'FR', country_code: 'fr', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: 'a' }
    ]
    const viewBox = { x: 0, y: 45, width: 15, height: 10 }
    const photosMapping = {}
    const photoDataUrlMap = {}

    const markers = generateStepMarkers(steps, viewBox, photosMapping, photoDataUrlMap)

    expect(markers).toContain('📍')
  })
})

describe('map.builder - buildMapSection', () => {
  beforeAll(() => {
    // Mock fetch pour les tiles satellite
    globalThis.fetch = vi.fn((url: string) => {
      if (url.includes('arcgisonline.com')) {
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
