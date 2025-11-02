import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import StepList from '../../src/components/editor/StepList.vue'
import { useEditorStore } from '../../src/stores/editor.store'
import type { Trip, Step } from '../../src/models/types'

describe('StepList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows empty state when no steps', () => {
    const wrapper = mount(StepList)
    
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('Aucune étape')
  })

  it('renders steps when trip is loaded', async () => {
    const wrapper = mount(StepList)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
      id: 1,
      name: 'Test Trip',
      start_date: 1234567890,
      end_date: 1234567890,
      steps: [
        {
          id: 1,
          name: 'Étape 1',
          country: 'France',
          country_code: 'FR',
          description: 'Description 1',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'sunny',
          latitude: 48.8566,
          longitude: 2.3522
        } as unknown as Step,
        {
          id: 2,
          name: 'Étape 2',
          country: 'Espagne',
          country_code: 'ES',
          description: 'Description 2',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'cloudy',
          latitude: 40.4168,
          longitude: -3.7038
        } as unknown as Step
      ]
    } as Trip
    
    store.setTrip(mockTrip)
    await wrapper.vm.$nextTick()
    
    const stepItems = wrapper.findAllComponents({ name: 'StepItem' })
    expect(stepItems.length).toBe(2)
  })

  it('emits select event when step is clicked', async () => {
    const wrapper = mount(StepList)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
      id: 1,
      name: 'Test Trip',
      start_date: 1234567890,
      end_date: 1234567890,
      steps: [
        {
          id: 1,
          name: 'Étape 1',
          country: 'France',
          country_code: 'FR',
          description: 'Desc',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'sunny',
          latitude: 48.8566,
          longitude: 2.3522
        } as unknown as Step
      ]
    } as Trip
    
    store.setTrip(mockTrip)
    await wrapper.vm.$nextTick()
    
    const stepItems = wrapper.findAllComponents({ name: 'StepItem' })
    await stepItems[0].vm.$emit('select')
    
    // Vérifier que le store a bien changé
    expect(store.currentStepIndex).toBe(0)
  })

  it('highlights active step', async () => {
    const wrapper = mount(StepList)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
      id: 1,
      name: 'Test Trip',
      start_date: 1234567890,
      end_date: 1234567890,
      steps: [
        {
          id: 1,
          name: 'Étape 1',
          country: 'France',
          country_code: 'FR',
          description: 'Desc',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'sunny',
          latitude: 48.8566,
          longitude: 2.3522
        } as unknown as Step,
        {
          id: 2,
          name: 'Étape 2',
          country: 'Espagne',
          country_code: 'ES',
          description: 'Desc',
          start_time: 1234567890,
          end_time: 1234567890,
          weather_condition: 'cloudy',
          latitude: 40.4168,
          longitude: -3.7038
        } as unknown as Step
      ]
    } as Trip
    
    store.setTrip(mockTrip)
    store.setCurrentStep(1)
    await wrapper.vm.$nextTick()
    
    const stepItems = wrapper.findAllComponents({ name: 'StepItem' })
    expect(stepItems[1].props('isActive')).toBe(true)
    expect(stepItems[0].props('isActive')).toBe(false)
  })
})
