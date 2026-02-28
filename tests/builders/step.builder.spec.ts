import { describe, it, expect, beforeAll, vi } from 'vitest'
import { StepBuilder } from '../../src/services/builders/step.builder'
import type { Step, Trip } from '../../src/models/types'

describe('step.builder - StepBuilder', () => {
  beforeAll(() => {
    // Mock getPositionPercentage et elevationService
    vi.mock('../../src/services/map.service', () => ({
      getPositionPercentage: vi.fn(() => Promise.resolve({ top: 50, left: 50 }))
    }))
    vi.mock('../../src/services/elevation.service', () => ({
      elevationService: {
        getElevation: vi.fn(() => Promise.resolve(350))
      },
      // Rétrocompatibilité
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
    const builder = new StepBuilder(
      mockTrip,
      mockTrip.steps[0],
      {},
      {}
    )

    const html = await builder.build()

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

    const builder = new StepBuilder(
      mockTrip,
      shortDesc,
      {
        10: {
          1: { path: 'cover.jpg', index: 1, ratio: 'PORTRAIT' }
        }
      },
      {}
    )

    const html = await builder.build()

    expect(html).toContain('step-with-photo')
    expect(html).toContain('cover.jpg')
  })

  it('pas de photo de couverture si description longue', async () => {
    const longDesc: Step = {
      ...mockTrip.steps[0],
      description: 'a'.repeat(900)
    }

    const builder = new StepBuilder(
      mockTrip,
      longDesc,
      {
        10: {
          1: { path: 'photo.jpg', index: 1, ratio: 'LANDSCAPE' }
        }
      },
      {}
    )

    const html = await builder.build()

    // La photo n'est pas utilisée comme couverture
    expect(html).not.toContain('step-with-photo')
  })

  it('génère des pages de photos avec pagination automatique', async () => {
    const stepWithoutCover: Step = {
      ...mockTrip.steps[0],
      description: 'a'.repeat(900)
    }

    const builder = new StepBuilder(
      { ...mockTrip, steps: [stepWithoutCover] },
      stepWithoutCover,
      {
        10: {
          1: { path: 'p1.jpg', index: 1, ratio: 'LANDSCAPE' },
          2: { path: 'p2.jpg', index: 2, ratio: 'LANDSCAPE' },
          3: { path: 'p3.jpg', index: 3, ratio: 'LANDSCAPE' },
          4: { path: 'p4.jpg', index: 4, ratio: 'LANDSCAPE' }
        }
      },
      {}
    )

    const html = await builder.build()

    // 4 photos landscape = 1 page de 4 photos
    expect(html).toContain('layout-grid-2x2')
    expect(html).toContain('p1.jpg')
    expect(html).toContain('p4.jpg')
  })

  it('respecte le plan utilisateur si fourni', async () => {
    const builder = new StepBuilder(
      mockTrip,
      mockTrip.steps[0],
      {
        10: {
          1: { path: 'p1.jpg', index: 1, ratio: 'LANDSCAPE' },
          2: { path: 'p2.jpg', index: 2, ratio: 'PORTRAIT' },
          3: { path: 'p3.jpg', index: 3, ratio: 'LANDSCAPE' }
        }
      },
      {},
      {
        cover: 1,
        pages: [
          {
            layout: 'hero-plus-2',
            photoIndices: [2, 3]
          }
        ]
      }
    )

    const html = await builder.build()

    // Photo 1 en couverture
    expect(html).toContain('step-with-photo')
    expect(html).toContain('p1.jpg')
    
    // Photos 2 et 3 sur une page
    expect(html).toContain('p2.jpg')
    expect(html).toContain('p3.jpg')
    expect(html).toContain('layout-hero-plus-2')
  })

  it('affiche les statistiques de l\'étape (date, météo, altitude)', async () => {
    const builder = new StepBuilder(
      mockTrip,
      mockTrip.steps[0],
      {},
      {}
    )

    const html = await builder.build()

    expect(html).toContain('step-stats')
    expect(html).toContain('°C')
    expect(html).toContain('METRES D\'ALTITUDE')
  })

  it('affiche le drapeau et la carte du pays', async () => {
    const builder = new StepBuilder(
      mockTrip,
      mockTrip.steps[0],
      {},
      {}
    )

    const html = await builder.build()

    expect(html).toContain('flag-emoji')
    expect(html).toContain('assets/images/maps/fr.svg')
  })

  it('affiche la barre de progression du voyage', async () => {
    const builder = new StepBuilder(
      mockTrip,
      mockTrip.steps[0],
      {},
      {}
    )

    const html = await builder.build()

    expect(html).toContain('step-days-bar')
    expect(html).toContain('Jour ')
  })

  it('agencement image-full : génère step-cover-image-full avec une photo et sans description', async () => {
    const step: Step = { ...mockTrip.steps[0], description: 'Description qui ne devrait pas apparaître' }
    const photos = { 10: { 1: { path: 'full.jpg', index: 1, ratio: 'PORTRAIT' as const } } }

    const builder = new StepBuilder(
      mockTrip,
      step,
      photos,
      {},
      { coverFormat: 'image-full', cover: 1, pages: [] }
    )

    const html = await builder.build()

    expect(html).toContain('step-cover-image-full')
    expect(html).toContain('step-cover-image-full__photo')
    expect(html).toContain('full.jpg')
    // Les infos step sont présentes
    expect(html).toContain('Paris')
    expect(html).toContain('step-stats')
    // La description n'est PAS affichée
    expect(html).not.toContain('step-description')
  })

  it('agencement image-two : génère step-cover-image-two avec 2 photos et sans description', async () => {
    const step: Step = { ...mockTrip.steps[0], description: 'Description cachée' }
    const photos = {
      10: {
        1: { path: 'photo1.jpg', index: 1, ratio: 'PORTRAIT' as const },
        2: { path: 'photo2.jpg', index: 2, ratio: 'LANDSCAPE' as const }
      }
    }

    const builder = new StepBuilder(
      mockTrip,
      step,
      photos,
      {},
      { coverFormat: 'image-two', cover: 1, cover2: 2, pages: [] }
    )

    const html = await builder.build()

    expect(html).toContain('step-cover-image-two')
    expect(html).toContain('step-cover-image-two__photos')
    expect(html).toContain('photo1.jpg')
    expect(html).toContain('photo2.jpg')
    // Les infos step sont présentes
    expect(html).toContain('Paris')
    expect(html).toContain('step-stats')
    // La description n'est PAS affichée
    expect(html).not.toContain('step-description')
  })

  it('agencement text-only : pas de photo de couverture, description affichée', async () => {
    const step: Step = { ...mockTrip.steps[0], description: 'Ma description' }
    const photos = { 10: { 1: { path: 'photo.jpg', index: 1, ratio: 'PORTRAIT' as const } } }

    const builder = new StepBuilder(
      mockTrip,
      step,
      photos,
      {},
      { coverFormat: 'text-only', pages: [] }
    )

    const html = await builder.build()

    expect(html).not.toContain('step-cover-image-full')
    expect(html).not.toContain('step-with-photo')
    expect(html).toContain('step-description')
    expect(html).toContain('Ma description')
  })
})
