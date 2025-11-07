import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PreviewPanel from '../../src/components/editor/PreviewPanel.vue'
import { useEditorStore } from '../../src/stores/editor.store'
import type { Trip } from '../../src/models/types'

describe('PreviewPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders preview modes buttons', () => {
    const wrapper = mount(PreviewPanel)
    const modeButtons = wrapper.findAll('.mode-button')
    
    expect(modeButtons.length).toBe(3)
    expect(modeButtons[0].text()).toBe('📱')
    expect(modeButtons[1].text()).toBe('💻')
    expect(modeButtons[2].text()).toBe('📄')
  })

  it('renders stats cards', () => {
    const wrapper = mount(PreviewPanel)
    const statCards = wrapper.findAll('.stat-card')
    
    expect(statCards.length).toBe(4)
    expect(statCards[0].text()).toContain('Photos')
    expect(statCards[1].text()).toContain('Étapes')
    expect(statCards[2].text()).toContain('Jours')
    expect(statCards[3].text()).toContain('Pages')
  })

  it('switches preview mode on button click', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    const modeButtons = wrapper.findAll('.mode-button')
    
    // Initial mode: desktop
    expect(store.previewMode).toBe('desktop')
    expect(modeButtons[1].classes()).toContain('active')
    
    // Switch to mobile
    await modeButtons[0].trigger('click')
    expect(store.previewMode).toBe('mobile')
    expect(modeButtons[0].classes()).toContain('active')
    
    // Switch to PDF
    await modeButtons[2].trigger('click')
    expect(store.previewMode).toBe('pdf')
    expect(modeButtons[2].classes()).toContain('active')
  })

  it('displays correct stats from store', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
      id: 1,
      name: 'Test Trip',
      start_date: 1234567890, // Jan 1970
      end_date: 1235000000,   // ~5 jours plus tard
      steps: [
        { id: 1, name: 'Step 1' } as any,
        { id: 2, name: 'Step 2' } as any
      ]
    } as Trip
    
    store.setTrip(mockTrip)
    await wrapper.vm.$nextTick()
    
    const statValues = wrapper.findAll('.stat-value')
    // Photos: 0 (TODO future)
    expect(statValues[0].text()).toBe('0')
    // Steps: 2
    expect(statValues[1].text()).toBe('2')
    // Days: calculé
    expect(parseInt(statValues[2].text())).toBeGreaterThan(0)
    // Pages: estimé
    expect(parseInt(statValues[3].text())).toBeGreaterThan(0)
  })

  it('shows preview content', () => {
    const wrapper = mount(PreviewPanel)
    const frame = wrapper.find('iframe.preview-frame')

    expect(frame.exists()).toBe(true)
  })

  it('applies correct CSS class for preview mode', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    const content = wrapper.find('.preview-content')
    
    // Desktop
    expect(content.classes()).toContain('mode-desktop')
    
    // Mobile
    store.setPreviewMode('mobile')
    await wrapper.vm.$nextTick()
    expect(content.classes()).toContain('mode-mobile')
    
    // PDF
    store.setPreviewMode('pdf')
    await wrapper.vm.$nextTick()
    expect(content.classes()).toContain('mode-pdf')
  })

  it('shows success status when preview is generated', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    store.setPreviewHtml('<!DOCTYPE html><html><head></head><body><p>Preview</p></body></html>')
    await wrapper.vm.$nextTick()

    const status = wrapper.find('.status-message')
    expect(status.classes()).toContain('type-success')
    expect(status.text()).toContain('Aperçu généré le')
  })

  it('shows loading overlay while generating', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    store.setPreviewLoading(true)
    await wrapper.vm.$nextTick()

    const overlay = wrapper.find('.preview-overlay')
    expect(overlay.exists()).toBe(true)
  })

  it('shows error status when preview fails', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    store.setPreviewError('Erreur de génération')
    await wrapper.vm.$nextTick()

    const status = wrapper.find('.status-message')
    expect(status.classes()).toContain('type-error')
    expect(status.text()).toContain('Erreur de génération')
  })
})
