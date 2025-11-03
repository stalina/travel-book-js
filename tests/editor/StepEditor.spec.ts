import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StepEditor from '../../src/components/editor/StepEditor.vue'
import { useEditorStore } from '../../src/stores/editor.store'
import type { Trip, Step } from '../../src/models/types'

describe('StepEditor', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows empty state when no step is selected', () => {
    const wrapper = mount(StepEditor)
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('Sélectionnez une étape')
  })

  it('shows editor content when step is selected', async () => {
    const wrapper = mount(StepEditor)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
      id: 1,
      name: 'Test Trip',
      start_date: 1234567890,
      end_date: 1234567890,
      steps: [
        {
          id: 1,
          name: 'Paris',
          description: 'Visite de Paris',
          country: 'France',
          country_code: 'FR',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'sunny',
          weather_temperature: 25,
          latitude: 48.8566,
          longitude: 2.3522,
          lat: 48.8566,
          lon: 2.3522,
          slug: 'paris'
        } as unknown as Step
      ]
    } as Trip
    
    store.setTrip(mockTrip)
    store.setCurrentStep(0)
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.empty-state').exists()).toBe(false)
    expect(wrapper.find('.editor-content').exists()).toBe(true)
  })

  it('renders StepTitleEditor with current step name', async () => {
    const wrapper = mount(StepEditor)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
      id: 1,
      name: 'Test Trip',
      start_date: 1234567890,
      end_date: 1234567890,
      steps: [
        {
          id: 1,
          name: 'Lyon',
          description: 'Visite de Lyon',
          country: 'France',
          country_code: 'FR',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'sunny',
          weather_temperature: 22,
          latitude: 45.7640,
          longitude: 4.8357,
          lat: 45.7640,
          lon: 4.8357,
          slug: 'lyon'
        } as unknown as Step
      ]
    } as Trip
    
    store.setTrip(mockTrip)
    store.setCurrentStep(0)
    await wrapper.vm.$nextTick()
    
    const titleEditor = wrapper.findComponent({ name: 'StepTitleEditor' })
    expect(titleEditor.exists()).toBe(true)
    expect(titleEditor.props('modelValue')).toBe('Lyon')
  })

  it('renders PhotoGrid section', async () => {
    const wrapper = mount(StepEditor)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
      id: 1,
      name: 'Test Trip',
      start_date: 1234567890,
      end_date: 1234567890,
      steps: [
        {
          id: 1,
          name: 'Test Step',
          description: 'Test',
          country: 'France',
          country_code: 'FR',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'sunny',
          weather_temperature: 25,
          latitude: 48.8566,
          longitude: 2.3522,
          lat: 48.8566,
          lon: 2.3522,
          slug: 'test'
        } as unknown as Step
      ]
    } as Trip
    
    store.setTrip(mockTrip)
    store.setCurrentStep(0)
    await wrapper.vm.$nextTick()
    
    const photoGrid = wrapper.findComponent({ name: 'PhotoGrid' })
    expect(photoGrid.exists()).toBe(true)
  })

  it('renders RichTextEditor with current step description', async () => {
    const wrapper = mount(StepEditor)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
      id: 1,
      name: 'Test Trip',
      start_date: 1234567890,
      end_date: 1234567890,
      steps: [
        {
          id: 1,
          name: 'Test Step',
          description: 'Ma description de test',
          country: 'France',
          country_code: 'FR',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'sunny',
          weather_temperature: 25,
          latitude: 48.8566,
          longitude: 2.3522,
          lat: 48.8566,
          lon: 2.3522,
          slug: 'test'
        } as unknown as Step
      ]
    } as Trip
    
    store.setTrip(mockTrip)
    store.setCurrentStep(0)
    await wrapper.vm.$nextTick()
    
    const richEditor = wrapper.findComponent({ name: 'RichTextEditor' })
    expect(richEditor.exists()).toBe(true)
    expect(richEditor.props('modelValue')).toBe('Ma description de test')
  })

  it('updates step title when title editor emits update', async () => {
    const wrapper = mount(StepEditor)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
      id: 1,
      name: 'Test Trip',
      start_date: 1234567890,
      end_date: 1234567890,
      steps: [
        {
          id: 1,
          name: 'Original Name',
          description: 'Test',
          country: 'France',
          country_code: 'FR',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'sunny',
          weather_temperature: 25,
          latitude: 48.8566,
          longitude: 2.3522,
          lat: 48.8566,
          lon: 2.3522,
          slug: 'test'
        } as unknown as Step
      ]
    } as Trip
    
    store.setTrip(mockTrip)
    store.setCurrentStep(0)
    await wrapper.vm.$nextTick()
    
    const titleEditor = wrapper.findComponent({ name: 'StepTitleEditor' })
    await titleEditor.vm.$emit('update:modelValue', 'New Name')
    
    expect(store.currentStep?.name).toBe('New Name')
  })

  it('updates step description when rich editor emits update', async () => {
    const wrapper = mount(StepEditor)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
      id: 1,
      name: 'Test Trip',
      start_date: 1234567890,
      end_date: 1234567890,
      steps: [
        {
          id: 1,
          name: 'Test',
          description: 'Original description',
          country: 'France',
          country_code: 'FR',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'sunny',
          weather_temperature: 25,
          latitude: 48.8566,
          longitude: 2.3522,
          lat: 48.8566,
          lon: 2.3522,
          slug: 'test'
        } as unknown as Step
      ]
    } as Trip
    
    store.setTrip(mockTrip)
    store.setCurrentStep(0)
    await wrapper.vm.$nextTick()
    
    const richEditor = wrapper.findComponent({ name: 'RichTextEditor' })
    await richEditor.vm.$emit('update:modelValue', '<p>New description</p>')
    
    expect(store.currentStep?.description).toBe('<p>New description</p>')
  })
})
