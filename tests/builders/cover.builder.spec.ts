import { describe, it, expect } from 'vitest'
import { buildCoverSection, type CoverBuilderContext } from '../../src/services/builders/cover.builder'
import type { Trip } from '../../src/models/types'

describe('cover.builder', () => {
  const mockTrip: Trip = {
    id: 1,
    name: 'Mon Voyage Test',
    start_date: Date.UTC(2023, 0, 15) / 1000, // 15 janvier 2023
    end_date: Date.UTC(2023, 0, 20) / 1000,
    steps: [],
    summary: 'Test',
    cover_photo: null
  }

  it('génère une page de couverture avec titre et année', () => {
    const context: CoverBuilderContext = {
      trip: mockTrip,
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = buildCoverSection(context)

    expect(html).toContain('class="break-after cover-page"')
    expect(html).toContain('Mon Voyage Test')
    expect(html).toContain('2023')
  })

  it('utilise trip.cover_photo si disponible', () => {
    const tripWithCover = {
      ...mockTrip,
      cover_photo: {
        path: 'https://example.com/cover.jpg',
        large_thumbnail_path: 'https://example.com/cover_large.jpg'
      }
    } as any

    const context: CoverBuilderContext = {
      trip: tripWithCover,
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = buildCoverSection(context)

    expect(html).toContain('cover_large.jpg')
  })

  it('fallback sur cover_photo_path si large_thumbnail_path absent', () => {
    const tripWithCover = {
      ...mockTrip,
      cover_photo_path: 'https://example.com/cover_path.jpg'
    } as any

    const context: CoverBuilderContext = {
      trip: tripWithCover,
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = buildCoverSection(context)

    expect(html).toContain('cover_path.jpg')
  })

  it('fallback sur première photo de step si pas de cover_photo', () => {
    const tripWithSteps = {
      ...mockTrip,
      steps: [
        { 
          id: 10, 
          name: 'Étape 1', 
          lat: 0, 
          lon: 0, 
          start_time: mockTrip.start_date,
          country: 'France',
          country_code: 'fr',
          weather_condition: 'clear',
          weather_temperature: 20,
          description: '',
          slug: 'etape-1'
        }
      ]
    }

    const context: CoverBuilderContext = {
      trip: tripWithSteps,
      photosMapping: {
        10: {
          1: { path: 'assets/images/photos/first.jpg', index: 1, ratio: 'LANDSCAPE' }
        }
      },
      photoDataUrlMap: {}
    }

    const html = buildCoverSection(context)

    expect(html).toContain('first.jpg')
  })

  it('utilise data URL si disponible dans photoDataUrlMap', () => {
    const context: CoverBuilderContext = {
      trip: {
        ...mockTrip,
        cover_photo_path: 'assets/images/photos/test.jpg'
      } as any,
      photosMapping: {},
      photoDataUrlMap: {
        'assets/images/photos/test.jpg': 'data:image/jpeg;base64,ABC123'
      }
    }

    const html = buildCoverSection(context)

    expect(html).toContain('data:image/jpeg;base64,ABC123')
  })

  it('utilise un fond de couleur thème si aucune photo disponible', () => {
    const context: CoverBuilderContext = {
      trip: mockTrip,
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = buildCoverSection(context)

    expect(html).toContain('var(--theme-color)')
  })

  it('échappe les caractères HTML dans le titre', () => {
    const tripWithSpecialChars = {
      ...mockTrip,
      name: 'Voyage <script>alert("XSS")</script> & Test'
    }

    const context: CoverBuilderContext = {
      trip: tripWithSpecialChars,
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = buildCoverSection(context)

    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&amp; Test')
  })

  it('retourne une chaîne vide en cas d\'erreur', () => {
    // Force une erreur en passant null comme trip
    const context: any = {
      trip: null,
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = buildCoverSection(context)

    expect(html).toBe('')
  })
})
