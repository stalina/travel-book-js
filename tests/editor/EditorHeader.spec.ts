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

  it('renders SaveStatus component', () => {
    const wrapper = mount(EditorHeader)
    
    const saveStatus = wrapper.findComponent({ name: 'SaveStatus' })
    expect(saveStatus.exists()).toBe(true)
  })

  it('renders action buttons', () => {
    const wrapper = mount(EditorHeader)
    const buttons = wrapper.findAllComponents({ name: 'BaseButton' })
    
    expect(buttons.length).toBeGreaterThanOrEqual(3)
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

  it('shows SaveStatus component', async () => {
    const wrapper = mount(EditorHeader)
    
    const saveStatus = wrapper.findComponent({ name: 'SaveStatus' })
    expect(saveStatus.exists()).toBe(true)
  })

  it('passes correct props to SaveStatus', async () => {
    const wrapper = mount(EditorHeader)
    const store = useEditorStore()
    
    store.setAutoSaveStatus('saving')
    await wrapper.vm.$nextTick()
    
    const saveStatus = wrapper.findComponent({ name: 'SaveStatus' })
    expect(saveStatus.props('status')).toBe('saving')
  })
})
