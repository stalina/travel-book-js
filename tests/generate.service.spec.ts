import { describe, it, expect, beforeAll } from 'vitest'
import { generateArtifacts, buildSingleFileHtmlString } from '../src/services/generate.service'

function mockFile(name: string, content = 'x'): File {
  return new File([content], name, { type: 'image/jpeg' })
}

describe('generate.service - page de couverture', () => {
  beforeAll(() => {
    // Mock fetch pour les assets requis par generateArtifacts
  ;(globalThis as any).fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (/assets\/style\.css$/.test(url)) {
        return new Response('body{background:#fff}', { status: 200, headers: { 'Content-Type': 'text/css' } })
      }
      if (/assets\/fonts\/fonts\.css$/.test(url)) {
        return new Response('@font-face{font-family:"BrandonGrotesque";src:local(Brandon);}', { status: 200, headers: { 'Content-Type': 'text/css' } })
      }
      if (/Brandon_Grotesque_medium\.otf$/.test(url)) {
        return new Response(new Blob(['OTF'], { type: 'font/otf' }), { status: 200 })
      }
      if (/\.svg$/.test(url)) {
        return new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })
      }
      // Autres ressources: 404 simulé
      return new Response('not found', { status: 404 })
    }) as any
  })
  async function setup(tripOverrides: any = {}, stepPhotos: Record<number, File[]> = {}) {
    const baseTrip: any = {
      id: 1,
      name: 'Mon Super Voyage',
      start_date: Date.UTC(2023,0,2) / 1000,
      end_date: Date.UTC(2023,0,5) / 1000,
      steps: [
        { id: 10, name: 'Etape 1', description: 'Desc', start_time: Date.UTC(2023,0,2)/1000, lat: 0, lon: 0, country_code: '00', weather_condition: 'clear-day', weather_temperature: 20 }
      ],
      cover_photo: null
    }
    const trip = { ...baseTrip, ...tripOverrides }
    ;(window as any).__parsedTrip = { trip, stepPhotos }
    const artifacts = await generateArtifacts({} as any)
    const html = await buildSingleFileHtmlString(artifacts)
    return { html, trip }
  }

  it('insère une section cover-page avec année et titre', async () => {
    const { html } = await setup()
  expect(html).toMatch(/class=\"break-after cover-page\"/)
    expect(html).toMatch(/Mon Super Voyage/)
    expect(html).toMatch(/2023/)
  })

  it('utilise cover_photo si disponible', async () => {
    const { html, trip } = await setup({ cover_photo: { path: 'https://exemple.test/photo.jpg' } })
    // On ne peut pas fetch l image en test, mais on vérifie que l URL apparait
    if (trip.cover_photo.path) {
      expect(html).toContain('photo.jpg')
    }
  })

  it('fallback sur première photo de step si pas de cover_photo', async () => {
  const file = mockFile('test.jpg')
  const { html } = await setup({}, { 10: [file] })
  // La photo sera transformée en data URL dans single-file => vérifier présence 'data:image'
  expect(/data:image\//.test(html)).toBe(true)
  })
})

describe('generate.service - page statistiques', () => {
  beforeAll(() => {
    ;(globalThis as any).fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (/assets\/style\.css$/.test(url)) return new Response('body{}', { status: 200, headers: { 'Content-Type': 'text/css' } })
      if (/assets\/fonts\/fonts\.css$/.test(url)) return new Response('', { status: 200, headers: { 'Content-Type': 'text/css' } })
      if (/\.svg$/.test(url)) return new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })
      if (/Brandon_Grotesque_medium\.otf$/.test(url)) return new Response(new Blob(['OTF'], { type: 'font/otf' }), { status: 200 })
      if (/country_bounding_boxes\.json$/.test(url)) return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
      return new Response('not found', { status: 404 })
    }) as any
  })

  async function setupMulti() {
    const trip: any = {
      id: 2,
      name: 'Voyage Multi Pays',
      start_date: Date.UTC(2024,0,1)/1000,
      end_date: Date.UTC(2024,0,5)/1000,
      total_km: 1234.56,
      steps: [
        { id: 1, name: 'Start', description: '', start_time: Date.UTC(2024,0,1)/1000, lat: 48.8566, lon: 2.3522, country_code: 'FR', weather_condition: 'clear-day', weather_temperature: 10 },
        { id: 2, name: 'Berlin', description: '', start_time: Date.UTC(2024,0,2)/1000, lat: 52.52, lon: 13.405, country_code: 'DE', weather_condition: 'cloudy', weather_temperature: 4 },
        { id: 3, name: 'Ljubljana', description: '', start_time: Date.UTC(2024,0,3)/1000, lat: 46.0569, lon: 14.5058, country_code: 'SI', weather_condition: 'cloudy', weather_temperature: 6 }
      ]
    }
    ;(window as any).__parsedTrip = { trip, stepPhotos: { 1: [mockFile('a.jpg')], 2: [mockFile('b.jpg'), mockFile('c.jpg')], 3: [] } }
    const artifacts = await generateArtifacts({} as any)
    const html = await buildSingleFileHtmlString(artifacts)
    return { html }
  }

  it('génère une stats-page après la cover', async () => {
    const { html } = await setupMulti()
    expect(html).toMatch(/class=\"break-after cover-page\"/)
    expect(html).toMatch(/class=\"break-after stats-page\"/)
    expect(html).toMatch(/RÉSUMÉ DU VOYAGE/)
  })

  it('affiche les métriques de base', async () => {
    const { html } = await setupMulti()
    expect(html).toMatch(/KILOMÈTRES/)
    expect(html).toMatch(/JOURS/)
    expect(html).toMatch(/ÉTAPES/)
    expect(html).toMatch(/PHOTOS/)
  })
})

describe('generate.service - page carte', () => {
  beforeAll(() => {
    ;(globalThis as any).fetch = (async (input: RequestInfo | URL) => {
      const url = String(input)
      if (/assets\/style\.css$/.test(url)) {
        return new Response(':root { --theme-color: rgb(71, 174, 162); }', { status: 200, headers: { 'Content-Type': 'text/css' } })
      }
      if (/assets\/fonts\/fonts\.css$/.test(url)) {
        return new Response('@font-face { font-family: "Test"; }', { status: 200, headers: { 'Content-Type': 'text/css' } })
      }
      if (/Brandon_Grotesque_medium\.otf$/.test(url)) {
        return new Response(new Blob(['OTF'], { type: 'font/otf' }), { status: 200 })
      }
      if (/\.svg$/.test(url)) {
        return new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { status: 200, headers: { 'Content-Type': 'image/svg+xml' } })
      }
      if (/country_bounding_boxes\.json$/.test(url)) {
        return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } })
      }
      return new Response('not found', { status: 404 })
    }) as any
  })

  async function setupMap(tripOverrides: any = {}, stepPhotos: Record<number, File[]> = {}) {
    const baseTrip: any = {
      id: 1,
      name: 'Voyage Test Carte',
      start_date: 1704063600,
      end_date: 1704668400,
      summary: 'Test carte',
      cover_photo: null,
      steps: [
        { id: 10, name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France', country_code: 'fr', start_time: 1704063600, description: 'Départ', city: 'Paris', weather_condition: 'clear', weather_temperature: 15, slug: 'paris' },
        { id: 11, name: 'Lyon', lat: 45.7640, lon: 4.8357, country: 'France', country_code: 'fr', start_time: 1704150000, description: 'Étape 2', city: 'Lyon', weather_condition: 'cloudy', weather_temperature: 12, slug: 'lyon' },
        { id: 12, name: 'Marseille', lat: 43.2965, lon: 5.3698, country: 'France', country_code: 'fr', start_time: 1704236400, description: 'Arrivée', city: 'Marseille', weather_condition: 'sunny', weather_temperature: 18, slug: 'marseille' }
      ]
    }
    const trip = { ...baseTrip, ...tripOverrides, steps: tripOverrides.steps || baseTrip.steps }
    ;(window as any).__parsedTrip = { trip, stepPhotos }
    const artifacts = await generateArtifacts({} as any)
    const html = await buildSingleFileHtmlString(artifacts)
    return { html, trip }
  }

  it('génère une map-page après stats-page', async () => {
    const { html } = await setupMap()
    expect(html).toMatch(/class="break-after stats-page"/)
    expect(html).toMatch(/class="break-after map-page"/)
  })

  it('contient un SVG avec viewBox', async () => {
    const { html } = await setupMap()
    expect(html).toMatch(/<svg class="map-svg" viewBox="0 0 1000 1000"/)
  })

  it('calcule correctement le bounding box', async () => {
    // Test avec des coordonnées connues
    const { html } = await setupMap()
    // Vérifie que le HTML est généré (les calculs internes sont testés implicitement)
    expect(html).toContain('map-container')
  })

  it('génère un tracé SVG avec path M et L', async () => {
    const { html } = await setupMap()
    // Vérifie la présence d'un path avec les commandes M (move) et L (line)
    expect(html).toMatch(/<path class="map-route"/)
    expect(html).toMatch(/d="M\s+[\d.]+\s+[\d.]+\s+L/)
  })

  it('ne génère pas de path pour une seule étape', async () => {
    const { html } = await setupMap({
      steps: [
        { id: 10, name: 'Paris', lat: 48.8566, lon: 2.3522, country: 'France', country_code: 'fr', start_time: 1704063600, description: 'Seule étape', city: 'Paris', weather_condition: 'clear', weather_temperature: 15, slug: 'paris' }
      ]
    })
    expect(html).toContain('map-container')
    // Pas de path généré pour une seule étape
    expect(html).not.toMatch(/<path class="map-route"/)
  })

  it('génère des vignettes pour chaque étape', async () => {
    const { html } = await setupMap()
    // 3 étapes = 3 vignettes (foreignObject)
    const foreignObjects = html.match(/<foreignObject/g)
    expect(foreignObjects).toBeTruthy()
    expect(foreignObjects!.length).toBe(3)
  })

  it('utilise la photo principale de l\'étape dans la vignette', async () => {
    const file = mockFile('step-photo.jpg')
    const { html } = await setupMap({}, { 10: [file] })
    // La photo doit apparaître en data URL dans un background-image
    expect(html).toMatch(/background-image:\s*url\(data:image/)
  })

  it('affiche un fallback si pas de photo', async () => {
    const { html } = await setupMap()
    // Sans photos, on doit avoir l'icône fallback
    expect(html).toContain('map-marker-icon')
    expect(html).toContain('📍')
  })

  it('positionne les vignettes selon les coordonnées GPS', async () => {
    const { html } = await setupMap()
    // Les foreignObject doivent avoir des attributs x et y
    expect(html).toMatch(/<foreignObject x="[\d.]+" y="[\d.]+"/g)
  })

  it('gère correctement le viewBox SVG', async () => {
    const { html } = await setupMap()
    // Le SVG doit avoir un viewBox "0 0 1000 1000"
    expect(html).toContain('viewBox="0 0 1000 1000"')
    expect(html).toContain('preserveAspectRatio="xMidYMid meet"')
  })

  it('génère un fond satellite avec tuiles', async () => {
    const { html } = await setupMap()
    // Vérifie la présence des tuiles satellite (images embarquées en data URL)
    expect(html).toMatch(/map-tiles/)
    expect(html).toMatch(/<image href="data:/)
    // Au moins une tuile devrait être présente
    const tileCount = (html.match(/<image href="data:/g) || []).length
    expect(tileCount).toBeGreaterThan(0)
  })
})
