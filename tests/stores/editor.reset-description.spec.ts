import { describe, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEditorStore } from '../../src/stores/editor.store'
import { StepBuilder } from '../../src/services/builders/step.builder'

describe('editor.store resetStep description', () => {
  it('restores the original description after resetStep (fallback to originalTrip)', async () => {
    setActivePinia(createPinia())

    // Mock external builders/services used during setTrip/regeneration
  vi.spyOn(StepBuilder.prototype, 'build').mockResolvedValue('<div/>')

    const store = useEditorStore()

    const originalDesc = 'La description originale'
    const step = { id: 42, name: 'Step', description: originalDesc, country: '', country_code: '', weather_condition: '', weather_temperature: 0, start_time: 0, lat: 0, lon: 0, slug: '' }
    const trip = { id: 1, name: 'Trip', start_date: 0, end_date: 0, steps: [step], cover_photo: null }

    // Ensure no parsedTrip is present so fallback to originalTrip is used
    try { delete (window as any).__parsedTrip } catch {}

    await store.setTrip(trip as any)
    store.setCurrentStep(0)

    // initial description should match
    expect(store.currentStep?.description).toBe(originalDesc)

    // modify description
    store.updateStepDescription(0, 'modified desc')
    expect(store.currentStep?.description).toBe('modified desc')

    // reset
    await store.resetStep(42)

    // should be restored to original
    expect(store.currentStep?.description).toBe(originalDesc)
  })
})
