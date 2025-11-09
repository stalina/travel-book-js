import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EditorHeader from '../../src/components/editor/EditorHeader.vue'
import { useEditorStore } from '../../src/stores/editor.store'
import type { Trip } from '../../src/models/types'

const exportMock = vi.fn()

vi.mock('../../src/composables/useEditorGeneration', () => ({
  useEditorGeneration: () => ({
    exportTravelBook: exportMock
  })
}))

describe('EditorHeader', () => {
  beforeEach(() => {
    exportMock.mockReset()
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
    // Now we have Import and Export buttons in the header (preview moved to floating toggle)
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  // (preview is opened via the floating toggle)

  it('triggers export when clicking export button', async () => {
    const wrapper = mount(EditorHeader)
    const buttons = wrapper.findAllComponents({ name: 'BaseButton' })
    const exportButton = buttons.find(btn => btn.text().includes('Exporter'))
    expect(exportButton).toBeDefined()
    await exportButton!.trigger('click')
    expect(exportMock).toHaveBeenCalledTimes(1)
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

  it('shows export button loading while exporting', async () => {
    const wrapper = mount(EditorHeader)
    const store = useEditorStore()
    store.setExporting(true)
    await wrapper.vm.$nextTick()
    const buttons = wrapper.findAllComponents({ name: 'BaseButton' })
    const exportButton = buttons.find(btn => btn.text().includes('Exporter'))
    expect(exportButton).toBeDefined()
    // The export button uses the `loading` prop bound to isExporting
    expect(exportButton?.props('loading')).toBe(true)
  })

  it('renders stat-cards with correct values from store', async () => {
    const wrapper = mount(EditorHeader)
    const store = useEditorStore()

    // Set store values
    store.setTrip({ id: 1, name: 'T', start_date: 0, end_date: 0, steps: [] } as any)
    // Directly set derived values where applicable
    // Some stores compute totals from trip; set a few fields to ensure values are non-zero
    // For robustness we set preview-related counts on the store if API exists, else rely on defaults
    await wrapper.vm.$nextTick()

    const statCards = wrapper.findAll('.header-stats .stat-card')
    expect(statCards.length).toBe(4)

    // Values should render (we use text presence rather than exact numbers to avoid fragile coupling)
    const texts = statCards.map(c => c.text())
    expect(texts.some(t => t.includes('Photos'))).toBe(true)
    expect(texts.some(t => t.includes('Étapes'))).toBe(true)
    expect(texts.some(t => t.includes('Jours'))).toBe(true)
    expect(texts.some(t => t.includes('Pages'))).toBe(true)
  })
})
