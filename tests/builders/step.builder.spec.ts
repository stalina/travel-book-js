import { describe, it, expect, beforeAll, vi } from 'vitest'
import { buildStepSection, type StepBuilderContext } from '../../src/services/builders/step.builder'
import type { Step, Trip } from '../../src/models/types'

describe('step.builder', () => {
  beforeAll(() => {
    // Mock getPositionPercentage et getElevation
    vi.mock('../../src/services/map.service', () => ({
      getPositionPercentage: vi.fn(() => Promise.resolve({ top: 50, left: 50 }))
    }))
    vi.mock('../../src/services/elevation.service', () => ({
      getElevation: vi.fn(() => Promise.resolve(350))
    }))
  })

  const mockTrip: Trip = {
    id: 1,
    name: 'Voyage Test',
    start_date: Date.UTC(2024, 0, 1) / 1000,
    end_date: Date.UTC(2024, 0, 10) / 1000,
    steps: [
      {
        id: 10,
        name: 'Paris',
        description: 'Belle ville',
        country: 'France',
        country_code: 'fr',
        lat: 48.8566,
        lon: 2.3522,
        start_time: Date.UTC(2024, 0, 1) / 1000,
        weather_condition: 'clear',
        weather_temperature: 15,
        slug: 'paris',
        city: 'Paris'
      }
    ],
    summary: '',
    cover_photo: null
  }

  it('génère une page d\'étape avec informations de base', async () => {
    const context: StepBuilderContext = {
      trip: mockTrip,
      step: mockTrip.steps[0],
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = await buildStepSection(context)

    expect(html).toContain('class="break-after"')
    expect(html).toContain('Paris')
    expect(html).toContain('Belle ville')
    expect(html).toContain('FRANCE')
  })

  it('utilise une photo de couverture si description courte', async () => {
    const shortDesc: Step = {
      ...mockTrip.steps[0],
      description: 'Court'
    }

    const context: StepBuilderContext = {
      trip: mockTrip,
      step: shortDesc,
      photosMapping: {
        10: {
          1: { path: 'cover.jpg', index: 1, ratio: 'PORTRAIT' }
        }
      },
      photoDataUrlMap: {}
    }

    const html = await buildStepSection(context)

    expect(html).toContain('step-with-photo')
    expect(html).toContain('cover.jpg')
  })

  it('pas de photo de couverture si description longue', async () => {
    const longDesc: Step = {
      ...mockTrip.steps[0],
      description: 'a'.repeat(900)
    }

    const context: StepBuilderContext = {
      trip: mockTrip,
      step: longDesc,
      photosMapping: {
        10: {
          1: { path: 'photo.jpg', index: 1, ratio: 'LANDSCAPE' }
        }
      },
      photoDataUrlMap: {}
    }

    const html = await buildStepSection(context)

    // La photo n'est pas utilisée comme couverture
    expect(html).not.toContain('step-with-photo')
  })

  it('génère des pages de photos avec pagination automatique', async () => {
    const context: StepBuilderContext = {
      trip: mockTrip,
      step: mockTrip.steps[0],
      photosMapping: {
        10: {
          1: { path: 'p1.jpg', index: 1, ratio: 'LANDSCAPE' },
          2: { path: 'p2.jpg', index: 2, ratio: 'LANDSCAPE' },
          3: { path: 'p3.jpg', index: 3, ratio: 'LANDSCAPE' },
          4: { path: 'p4.jpg', index: 4, ratio: 'LANDSCAPE' }
        }
      },
      photoDataUrlMap: {}
    }

    const html = await buildStepSection(context)

    // 4 photos landscape = 1 page de 4 photos
    expect(html).toContain('photo-columns')
    expect(html).toContain('p1.jpg')
    expect(html).toContain('p4.jpg')
  })

  it('respecte le plan utilisateur si fourni', async () => {
    const context: StepBuilderContext = {
      trip: mockTrip,
      step: mockTrip.steps[0],
      photosMapping: {
        10: {
          1: { path: 'p1.jpg', index: 1, ratio: 'LANDSCAPE' },
          2: { path: 'p2.jpg', index: 2, ratio: 'PORTRAIT' },
          3: { path: 'p3.jpg', index: 3, ratio: 'LANDSCAPE' }
        }
      },
      photoDataUrlMap: {},
      stepPlan: {
        cover: 1,
        pages: [[2, 3]]
      }
    }

    const html = await buildStepSection(context)

    // Photo 1 en couverture
    expect(html).toContain('step-with-photo')
    expect(html).toContain('p1.jpg')
    
    // Photos 2 et 3 sur une page
    expect(html).toContain('p2.jpg')
    expect(html).toContain('p3.jpg')
  })

  it('affiche les statistiques de l\'étape (date, météo, altitude)', async () => {
    const context: StepBuilderContext = {
      trip: mockTrip,
      step: mockTrip.steps[0],
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = await buildStepSection(context)

    expect(html).toContain('step-stats')
    expect(html).toContain('°C')
    expect(html).toContain('METRES D\'ALTITUDE')
  })

  it('affiche le drapeau et la carte du pays', async () => {
    const context: StepBuilderContext = {
      trip: mockTrip,
      step: mockTrip.steps[0],
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = await buildStepSection(context)

    expect(html).toContain('flag-emoji')
    expect(html).toContain('assets/images/maps/fr.svg')
  })

  it('affiche la barre de progression du voyage', async () => {
    const context: StepBuilderContext = {
      trip: mockTrip,
      step: mockTrip.steps[0],
      photosMapping: {},
      photoDataUrlMap: {}
    }

    const html = await buildStepSection(context)

    expect(html).toContain('step-days-bar')
    expect(html).toContain('Jour ')
  })
})
