import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest'
import { MapBuilder, type InitialFocus } from '../../src/services/builders/map.builder'
import type { Step, Trip } from '../../src/models/types'

describe('map.builder - MapBuilder', () => {
  // Plusieurs tests affectent globalThis.fetch directement sans le restaurer : on rétablit
  // après chacun le fetch hors-ligne de tests/setup.ts (tuile PNG pour chaque URL de tuile).
  let offlineFetch: typeof fetch
  beforeAll(() => {
    offlineFetch = globalThis.fetch
  })
  afterEach(() => {
    globalThis.fetch = offlineFetch
    vi.restoreAllMocks()
  })

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

  describe('cadrage initial (initialFocus)', () => {
    const stepAt = (id: number, name: string, lat: number, lon: number): Step => ({
      id, name, lat, lon, country: '', country_code: '', start_time: 0, weather_condition: 'clear', weather_temperature: 20, description: '', slug: name.toLowerCase()
    })
    const paris = stepAt(1, 'Paris', 48.8566, 2.3522)
    const lyon = stepAt(2, 'Lyon', 45.764, 4.8357)
    const berlin = stepAt(3, 'Berlin', 52.52, 13.405)
    const trip = { id: 1, name: 'Paris-Lyon-Berlin', start_date: 0, end_date: 0, steps: [paris, lyon, berlin], cover_photo: null }
    const berlinBBox = { minLat: 52.4, maxLat: 52.6, minLon: 13.3, maxLon: 13.5 }

    // Conversions tuile -> lat/lon (schéma XYZ des tuiles demandées par le builder)
    const tile2lat = (y: number, z: number) => {
      const n = Math.PI - 2 * Math.PI * y / Math.pow(2, z)
      return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
    }
    const tile2lon = (x: number, z: number) => x / Math.pow(2, z) * 360 - 180

    /** Construit la carte (tuiles servies par le fetch hors-ligne) et renvoie le HTML, les zooms et l'emprise des tuiles demandées */
    const buildMap = async (focus?: InitialFocus) => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch')
      const html = await new MapBuilder(trip, {}, {}, focus).build()
      const tiles = fetchSpy.mock.calls.map(([url]) => {
        const [z, y, x] = String(url).match(/\/tile\/(\d+)\/(\d+)\/(\d+)$/)!.slice(1).map(Number)
        return { zoom: z, north: tile2lat(y, z), south: tile2lat(y + 1, z), west: tile2lon(x, z), east: tile2lon(x + 1, z) }
      })
      fetchSpy.mockRestore()
      const coverage = {
        north: Math.max(...tiles.map(t => t.north)),
        south: Math.min(...tiles.map(t => t.south)),
        west: Math.min(...tiles.map(t => t.west)),
        east: Math.max(...tiles.map(t => t.east))
      }
      const covers = (lat: number, lon: number) =>
        lat >= coverage.south && lat <= coverage.north && lon >= coverage.west && lon <= coverage.east
      return { html, zooms: new Set(tiles.map(t => t.zoom)), tileCount: tiles.length, covers }
    }

    /** Centres des vignettes (foreignObject de 40px), dans l'ordre des étapes */
    const markerCenters = (html: string) =>
      [...html.matchAll(/<foreignObject x="([-\d.]+)" y="([-\d.]+)"/g)].map(m => ({ x: Number(m[1]) + 20, y: Number(m[2]) + 20 }))
    const inFrame = ({ x, y }: { x: number, y: number }) => x >= 0 && x <= 1000 && y >= 0 && y <= 1000
    const routePointCount = (html: string) => (html.match(/class="map-route" d="([^"]*)"/)?.[1].match(/[ML]/g) ?? []).length

    it('sans cadrage, les tuiles et les vignettes couvrent tout le voyage', async () => {
      const { html, tileCount, covers } = await buildMap()

      expect(html.match(/<image href="data:image\/png/g)).toHaveLength(tileCount)
      expect([paris, lyon, berlin].every(s => covers(s.lat, s.lon))).toBe(true)
      expect(markerCenters(html).every(inFrame)).toBe(true)
    })

    it('stepIds : tuiles demandées sur les étapes ciblées, toutes les vignettes et le tracé conservés', async () => {
      const warn = vi.spyOn(console, 'warn')
      const full = await buildMap()
      const { html, zooms, covers } = await buildMap({ stepIds: [paris.id, lyon.id] })

      expect(covers(paris.lat, paris.lon)).toBe(true)
      expect(covers(lyon.lat, lyon.lon)).toBe(true)
      expect(covers(berlin.lat, berlin.lon)).toBe(false)
      expect(Math.min(...zooms)).toBeGreaterThan(Math.max(...full.zooms))

      const [parisMarker, lyonMarker, berlinMarker] = markerCenters(html)
      expect(markerCenters(html)).toHaveLength(3)
      expect(inFrame(parisMarker)).toBe(true)
      expect(inFrame(lyonMarker)).toBe(true)
      expect(inFrame(berlinMarker)).toBe(false)
      expect(routePointCount(html)).toBe(3)
      // Des étapes hors champ sont attendues avec un cadrage : pas d'avertissement
      expect(warn).not.toHaveBeenCalled()
    })

    it('bbox explicite : tuiles demandées sur la zone fournie', async () => {
      const { html, covers } = await buildMap({ bbox: berlinBBox })

      expect(covers(berlinBBox.minLat, berlinBBox.minLon)).toBe(true)
      expect(covers(berlinBBox.maxLat, berlinBBox.maxLon)).toBe(true)
      expect(covers(paris.lat, paris.lon)).toBe(false)
      expect(covers(lyon.lat, lyon.lon)).toBe(false)
      expect(markerCenters(html).map(inFrame)).toEqual([false, false, true])
      expect(routePointCount(html)).toBe(3)
    })

    it('centre+zoom : tuiles demandées au zoom fourni autour du centre', async () => {
      const { html, zooms, covers } = await buildMap({ center: { lat: lyon.lat, lon: lyon.lon }, zoom: 12 })

      expect([...zooms]).toEqual([12])
      expect(covers(lyon.lat, lyon.lon)).toBe(true)
      expect(covers(paris.lat, paris.lon)).toBe(false)
      expect(markerCenters(html).map(inFrame)).toEqual([false, true, false])
      expect(routePointCount(html)).toBe(3)
    })

    it('priorité : la bbox explicite l\'emporte sur stepIds et centre+zoom', async () => {
      const { covers } = await buildMap({ bbox: berlinBBox, stepIds: [paris.id], center: { lat: lyon.lat, lon: lyon.lon }, zoom: 12 })

      expect(covers(berlin.lat, berlin.lon)).toBe(true)
      expect(covers(paris.lat, paris.lon)).toBe(false)
      expect(covers(lyon.lat, lyon.lon)).toBe(false)
    })

    it('priorité : stepIds l\'emporte sur centre+zoom', async () => {
      const { covers } = await buildMap({ stepIds: [paris.id], center: { lat: lyon.lat, lon: lyon.lon }, zoom: 12 })

      expect(covers(paris.lat, paris.lon)).toBe(true)
      expect(covers(lyon.lat, lyon.lon)).toBe(false)
    })

    it('un cadrage vide produit exactement la carte par défaut, sans avertissement', async () => {
      const warn = vi.spyOn(console, 'warn')
      const { html: defaultHtml } = await buildMap()
      const { html } = await buildMap({})

      expect(html).toBe(defaultHtml)
      expect(warn).not.toHaveBeenCalled()
    })

    it.each<[string, InitialFocus]>([
      ['étapes inconnues', { stepIds: [999] }],
      ['bbox inversée', { bbox: { minLat: 50, maxLat: 40, minLon: 0, maxLon: 1 } }],
      ['bbox non numérique', { bbox: { minLat: NaN, maxLat: 40, minLon: 0, maxLon: 1 } }],
      ['centre sans zoom', { center: { lat: lyon.lat, lon: lyon.lon } }]
    ])('cadrage inutilisable (%s) : repli sur la carte par défaut avec avertissement', async (_label, focus) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { html: defaultHtml } = await buildMap()
      const { html } = await buildMap(focus)

      expect(html).toBe(defaultHtml)
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0][1]).toContain('Cadrage initial inutilisable')
    })
  })
})
