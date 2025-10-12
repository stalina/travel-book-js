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
