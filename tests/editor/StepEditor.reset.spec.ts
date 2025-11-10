import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StepEditor from '../../src/components/editor/StepEditor.vue'
import { createPinia, setActivePinia } from 'pinia'
import { useEditorStore } from '../../src/stores/editor.store'
import { StepBuilder } from '../../src/services/builders/step.builder'

// Polyfill confirm dialog usage in happy-dom environment
if (typeof window.confirm !== 'function') {
  ;(window as any).confirm = () => true
}

const createStep = (overrides = {}) => ({ id: 1, name: 'Étape Test', description: 'desc', country: 'X', country_code: 'X', weather_condition: '', weather_temperature: 0, start_time: 0, lat: 0, lon: 0, slug: '', ...overrides })
const createTrip = (overrides = {}) => ({ id: 10, name: 'Voyage', start_date: 0, end_date: 0, steps: [createStep()], cover_photo: null, ...overrides })

describe('StepEditor reset flow', () => {
  it('opens confirm dialog and calls resetStep', async () => {
    setActivePinia(createPinia())
    // mock StepBuilder.build called during preview generation
    vi.spyOn(StepBuilder.prototype, 'build').mockResolvedValue('<div/>')

    const wrapper = mount(StepEditor, {
      global: {
        plugins: []
      }
    })

    const store = useEditorStore()

    // set parsedTrip to supply photos (store.prepareStepPhotosForTrip reads it)
    ;(window as any).__parsedTrip = { stepPhotos: { 1: [] }, trip: createTrip() }

    const trip = createTrip()
    await store.setTrip(trip)
    store.setCurrentStep(0)
    await flushPromises()

    const resetSpy = vi.spyOn(store, 'resetStep')

    const button = wrapper.find('[data-test="proposal-reset"]')
    expect(button.exists()).toBe(true)
    await button.trigger('click')

    await flushPromises()
    const dialog = wrapper.findComponent({ name: 'ConfirmDialog' })
    expect(dialog.exists()).toBe(true)

    await dialog.vm.$emit('confirm')

    expect(resetSpy).toHaveBeenCalled()
  })
})
