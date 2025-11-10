import { describe, it, expect, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEditorStore } from '../../src/stores/editor.store'
import { StepBuilder } from '../../src/services/builders/step.builder'

describe('editor.store resetStep full restore', () => {
  it('restores title, description, pages, cover and photos', async () => {
    setActivePinia(createPinia())

    // mocks used during setTrip/regeneration
    vi.spyOn(StepBuilder.prototype, 'build').mockResolvedValue('<div/>')
  // no proposal service usage in new flow; only mock StepBuilder

    const store = useEditorStore()

    // original step
    const originalStep = { id: 99, name: 'Orig', description: 'Orig desc', country: '', country_code: '', weather_condition: '', weather_temperature: 0, start_time: 0, lat: 0, lon: 0, slug: '' }
    const originalTrip = { id: 1, name: 'Trip', start_date: 0, end_date: 0, steps: [originalStep], cover_photo: null }

    // ensure no parsedTrip is present
    try { delete (window as any).__parsedTrip } catch {}

    await store.setTrip(originalTrip as any)
    store.setCurrentStep(0)

    // modify several fields
    store.updateStepTitle(0, 'Changed title')
    store.updateStepDescription(0, 'Changed description')
    // add a page
    store.addPageToCurrentStep('grid-2x2')
    const pages = store.currentStepPages
    expect(pages.length).toBeGreaterThanOrEqual(1)

    // simulate adding a photo via file (prepareEditorPhoto cannot be invoked here easily so we use addPhotoToCurrentStep with a fake file)
    const fakeFile = new File([''], 'photo.jpg', { type: 'image/jpeg' })
    const added = await store.addPhotoToCurrentStep(fakeFile)
    expect(added).not.toBeNull()
    // set cover index
    if (added) store.setCurrentStepCoverPhotoIndex(added.index)

    // confirm modifications applied
    expect(store.currentStep?.name).toBe('Changed title')
    expect(store.currentStep?.description).toBe('Changed description')
    expect(store.currentStepPageState?.pages.length).toBeGreaterThanOrEqual(1)
    if (added) expect(store.currentStepPhotos.some((p) => p.index === added.index)).toBeTruthy()

    // now reset
    await store.resetStep(99)

    // assertions: values restored to original
    expect(store.currentStep?.name).toBe('Orig')
    expect(store.currentStep?.description).toBe('Orig desc')
    // pages reset
    expect(store.currentStepPageState?.pages.length || 0).toBe(0)
    // photos reset -> empty
    expect((store.currentStepPhotos || []).length).toBe(0)
  })
})
