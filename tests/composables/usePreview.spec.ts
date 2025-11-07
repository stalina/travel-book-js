import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { usePreview } from '../../src/composables/usePreview'
import type { Trip } from '../../src/models/types'

describe('usePreview', () => {
  const createMockTrip = (): Trip => ({
    id: 1,
    name: 'Voyage Test',
    start_date: 1609459200, // 2021-01-01
    end_date: 1609545600, // 2021-01-02 (1 jour)
    steps: [
      {
        id: 1,
        name: 'Paris',
        city: 'Paris',
        country: 'France',
        country_code: 'FR',
        description: 'Description',
        weather_condition: 'sunny',
        lat: 48.8566,
        lng: 2.3522,
        date: 1609459200
      },
      {
        id: 2,
        name: 'Lyon',
        city: 'Lyon',
        country: 'France',
        country_code: 'FR',
        description: 'Description',
        weather_condition: 'sunny',
        lat: 45.7640,
        lng: 4.8357,
        date: 1609545600
      }
    ],
    cover_photo: {
      path: '/test.jpg',
      caption: 'Test'
    }
  } as unknown as Trip)

  it('initializes with desktop mode by default', () => {
    const trip = ref<Trip | null>(null)
    const { mode } = usePreview({ trip })

    expect(mode.value).toBe('desktop')
  })

  it('uses initial mode if provided', () => {
    const trip = ref<Trip | null>(null)
    const { mode } = usePreview({ 
      trip,
      initialMode: 'mobile'
    })

    expect(mode.value).toBe('mobile')
  })

  it('calculates dimensions for mobile mode', () => {
    const trip = ref<Trip | null>(null)
    const { setMode, dimensions } = usePreview({ trip })

    setMode('mobile')

    expect(dimensions.value.width).toBe(375)
    expect(dimensions.value.height).toBe(667)
    expect(dimensions.value.scale).toBe(0.5)
  })

  it('calculates dimensions for desktop mode', () => {
    const trip = ref<Trip | null>(null)
    const { setMode, dimensions } = usePreview({ trip })

    setMode('desktop')

    expect(dimensions.value.width).toBe(1200)
    expect(dimensions.value.height).toBe(800)
    expect(dimensions.value.scale).toBe(0.3)
  })

  it('calculates dimensions for PDF mode', () => {
    const trip = ref<Trip | null>(null)
    const { setMode, dimensions } = usePreview({ trip })

    setMode('pdf')

    expect(dimensions.value.width).toBe(794)
    expect(dimensions.value.height).toBe(1123)
    expect(dimensions.value.scale).toBe(0.4)
  })

  it('generates container styles', () => {
    const trip = ref<Trip | null>(null)
    const { containerStyles } = usePreview({ trip })

    expect(containerStyles.value).toHaveProperty('width')
    expect(containerStyles.value).toHaveProperty('transform')
    expect(containerStyles.value.transformOrigin).toBe('top center')
  })

  it('shows empty preview when no trip', () => {
    const trip = ref<Trip | null>(null)
    const { content } = usePreview({ trip })

    expect(content.value).toContain('Aucun voyage sélectionné')
    expect(content.value).toContain('Cliquez sur « Prévisualiser »')
    expect(content.value.startsWith('<!DOCTYPE html>')).toBe(true)
  })

  it('generates preview content for trip', async () => {
    const trip = ref<Trip | null>(createMockTrip())
    const { content } = usePreview({ trip })

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(content.value).toContain('Voyage Test')
    expect(content.value).toContain('Paris')
    expect(content.value).toContain('Lyon')
  })

  it('updates preview when trip changes', async () => {
    const trip = ref<Trip | null>(null)
    const { content } = usePreview({ trip })

    expect(content.value).toContain('Aucun voyage sélectionné')

    trip.value = createMockTrip()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(content.value).toContain('Voyage Test')
  })

  it('calculates stats correctly', () => {
    const trip = ref<Trip | null>(createMockTrip())
    const { stats } = usePreview({ trip })

    expect(stats.value.steps).toBe(2)
    expect(stats.value.days).toBe(1)
    expect(stats.value.pages).toBeGreaterThan(0)
    expect(stats.value.photos).toBe(0) // TODO: implement with photosMapping
  })

  it('updates stats when trip changes', async () => {
    const trip = ref<Trip | null>(null)
    const { stats } = usePreview({ trip })

    expect(stats.value.steps).toBe(0)

    trip.value = createMockTrip()
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(stats.value.steps).toBe(2)
  })

  it('updates lastUpdate timestamp', async () => {
    const trip = ref<Trip | null>(null)
    const { lastUpdate, updatePreview } = usePreview({ trip })

    const initialTime = lastUpdate.value
    
    await new Promise(resolve => setTimeout(resolve, 10))

    trip.value = createMockTrip()
    await new Promise(resolve => setTimeout(resolve, 10))

    // Le lastUpdate devrait être différent
    expect(lastUpdate.value).not.toBe(initialTime)
  })
})
