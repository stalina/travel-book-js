import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EditorHeader from '../../src/components/editor/EditorHeader.vue'
import { useEditorStore } from '../../src/stores/editor.store'
import type { Trip } from '../../src/models/types'

describe('EditorHeader', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders logo and project title input', () => {
    const wrapper = mount(EditorHeader)
    
    expect(wrapper.find('.logo').text()).toContain('Travel Book')
    expect(wrapper.find('.project-title').exists()).toBe(true)
  })

  it('displays save status indicator', () => {
    const wrapper = mount(EditorHeader)
    
    expect(wrapper.find('.save-status').exists()).toBe(true)
    expect(wrapper.find('.save-indicator').exists()).toBe(true)
  })

  it('renders action buttons', () => {
    const wrapper = mount(EditorHeader)
    const buttons = wrapper.findAllComponents({ name: 'BaseButton' })
    
    expect(buttons.length).toBeGreaterThanOrEqual(3)
  })

  it('shows correct save status text', async () => {
    const wrapper = mount(EditorHeader)
    const store = useEditorStore()
    
    // Initial: idle
    expect(wrapper.find('.save-status').text()).toBe('')
    
    // Saving
    store.autoSaveStatus = 'saving'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.save-status').text()).toContain('Enregistrement')
    
    // Saved
    store.autoSaveStatus = 'saved'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.save-status').text()).toContain('Enregistré')
  })

  it('updates project title in store on blur', async () => {
    const wrapper = mount(EditorHeader)
    const store = useEditorStore()
    
    // Créer un voyage de test
    const mockTrip: Trip = {
      id: 1,
      name: 'Voyage initial',
      start_date: 1234567890,
      end_date: 1234567890,
      steps: []
    } as Trip
    store.setTrip(mockTrip)
    await wrapper.vm.$nextTick()
    
    const input = wrapper.find('.project-title')
    await input.setValue('Nouveau titre')
    await input.trigger('blur')
    
    expect(store.currentTrip?.name).toBe('Nouveau titre')
  })

  it('applies correct CSS class for save status', async () => {
    const wrapper = mount(EditorHeader)
    const store = useEditorStore()
    
    const indicator = wrapper.find('.save-indicator')
    
    // Idle
    expect(indicator.classes()).toContain('idle')
    
    // Saving
    store.autoSaveStatus = 'saving'
    await wrapper.vm.$nextTick()
    expect(indicator.classes()).toContain('saving')
    
    // Saved
    store.autoSaveStatus = 'saved'
    await wrapper.vm.$nextTick()
    expect(indicator.classes()).toContain('saved')
  })
})
