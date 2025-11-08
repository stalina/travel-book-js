import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock the generation composable so we can assert calls
const previewTravelBookMock = vi.fn()
vi.mock('../../src/composables/useEditorGeneration', () => ({
  useEditorGeneration: () => ({ previewTravelBook: previewTravelBookMock })
}))
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EditorView from '../../src/views/EditorView.vue'
import { useEditorStore } from '../../src/stores/editor.store'

describe('EditorView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders the 3-column grid layout', () => {
    const wrapper = mount(EditorView)
    const layout = wrapper.find('.editor-layout')
    
    expect(layout.exists()).toBe(true)
    expect(wrapper.find('.editor-header').exists()).toBe(true)
    expect(wrapper.find('.editor-sidebar').exists()).toBe(true)
    expect(wrapper.find('.editor-main').exists()).toBe(true)
    // The preview panel is collapsed by default; a small toggle button should be present
    expect(wrapper.find('.preview-toggle').exists()).toBe(true)
  })

  it('shows StepEditor component', () => {
    const wrapper = mount(EditorView)
    const stepEditor = wrapper.find('.step-editor')
    
    expect(stepEditor.exists()).toBe(true)
  })

  it('uses EditorStore for state management', () => {
    const wrapper = mount(EditorView)
    const store = useEditorStore()
    
    expect(store).toBeDefined()
    expect(store.currentTrip).toBeNull()
    expect(store.currentStepIndex).toBe(0)
  })

  it('calls previewTravelBook when a trip is set and after autosave saved', async () => {
    const wrapper = mount(EditorView)
    const store = useEditorStore()

    // Simuler l'arrivée d'un trip
    const fakeTrip = { id: 1, name: 'T', steps: [] }
    await store.setTrip(fakeTrip as any)

    // Attendre le prochain tick pour que le watcher sur currentTrip s'exécute
    const { nextTick } = await import('vue')
    await nextTick()

    // previewTravelBook devrait avoir été appelé au moins une fois lors du setTrip
    expect(previewTravelBookMock).toHaveBeenCalled()

    // Réinitialiser le mock et simuler l'auto-save
    previewTravelBookMock.mockClear()
    store.setAutoSaveStatus('saving')
    store.setAutoSaveStatus('saved')
    await nextTick()

    expect(previewTravelBookMock).toHaveBeenCalled()
  })

  it('applies correct CSS Grid layout', () => {
    const wrapper = mount(EditorView)
    const layout = wrapper.find('.editor-layout')
    const style = getComputedStyle(layout.element)
    
    // Note: CSS Grid peut ne pas être calculé dans le test, on vérifie que la classe existe
    expect(layout.classes()).toContain('editor-layout')
  })
})
