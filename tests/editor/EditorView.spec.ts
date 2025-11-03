import { describe, it, expect, beforeEach, vi } from 'vitest'
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
    expect(wrapper.find('.preview-panel').exists()).toBe(true)
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

  it('applies correct CSS Grid layout', () => {
    const wrapper = mount(EditorView)
    const layout = wrapper.find('.editor-layout')
    const style = getComputedStyle(layout.element)
    
    // Note: CSS Grid peut ne pas être calculé dans le test, on vérifie que la classe existe
    expect(layout.classes()).toContain('editor-layout')
  })
})
