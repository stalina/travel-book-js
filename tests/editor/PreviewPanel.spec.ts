import { describe, it, expect, beforeEach, vi } from 'vitest'
// Mock the generation composable so opening the panel doesn't perform heavy work
const previewMock = vi.fn(() => Promise.resolve(null))
vi.mock('../../src/composables/useEditorGeneration', () => ({
  useEditorGeneration: () => ({
    previewTravelBook: previewMock,
    openPreviewInViewer: vi.fn(),
    exportTravelBook: vi.fn()
  })
}))
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PreviewPanel from '../../src/components/editor/PreviewPanel.vue'
import { useEditorStore } from '../../src/stores/editor.store'
import type { Trip, Step } from '../../src/models/types'

const buildStep = (id: number, overrides: Partial<Step> = {}): Step => ({
  id,
  name: `Étape ${id}`,
  description: `Description pour l'étape ${id}`,
  city: 'Paris',
  country: 'France',
  country_code: 'FR',
  weather_condition: 'Ensoleillé',
  weather_temperature: 20,
  start_time: 1_609_459_200 + id * 86_400,
  lat: 48.8566,
  lon: 2.3522,
  slug: `etape-${id}`,
  ...overrides
})

describe('PreviewPanel', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('renders preview modes buttons', async () => {
    const wrapper = mount(PreviewPanel)
    // Simulate toggle event to open the panel
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
    const modeButtons = wrapper.findAll('.mode-button')
    expect(modeButtons.length).toBe(3)
    expect(modeButtons[0].text()).toBe('📱')
    expect(modeButtons[1].text()).toBe('💻')
    expect(modeButtons[2].text()).toBe('📄')
  })

  it('renders stats cards', () => {
    const wrapper = mount(PreviewPanel)
    // Stats cards moved to header; panel should not contain them
    const statCards = wrapper.findAll('.stat-card')
    expect(statCards.length).toBe(0)
  })

  it('switches preview mode on button click', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    // Open the panel
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
    const modeButtons = wrapper.findAll('.mode-button')

    // Initial mode: desktop
    expect(store.previewMode).toBe('desktop')
    expect(modeButtons[1].classes()).toContain('active')

    // Switch to mobile
    await modeButtons[0].trigger('click')
    await wrapper.vm.$nextTick()
    expect(store.previewMode).toBe('mobile')
    expect(modeButtons[0].classes()).toContain('active')

    // Switch to PDF
    await modeButtons[2].trigger('click')
    await wrapper.vm.$nextTick()
    expect(store.previewMode).toBe('pdf')
    expect(modeButtons[2].classes()).toContain('active')
  })

  it('displays correct stats from store', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    
    const mockTrip: Trip = {
		id: 1,
		name: 'Test Trip',
		start_date: 1_609_372_800,
		end_date: 1_609_459_200,
		steps: [buildStep(1), buildStep(2)],
		cover_photo: null,
		summary: 'Résumé'
	}

	await store.setTrip(mockTrip)
    await wrapper.vm.$nextTick()
    
    // The stats are rendered in the header component; here we assert store values
    expect(store.totalPhotos).toBeDefined()
    expect(store.totalSteps).toBe(2)
    expect(store.totalDays).toBeGreaterThan(0)
    expect(store.estimatedPages).toBeGreaterThan(0)
  })

  it('shows preview content', async () => {
    const wrapper = mount(PreviewPanel)
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
    const frame = wrapper.find('iframe.preview-frame')
    // When expanded the class may be different (preview-frame-expanded); accept either
    const frameExpanded = wrapper.find('iframe.preview-frame-expanded')
    expect(frame.exists() || frameExpanded.exists()).toBe(true)
  })

  it('does not mount iframe when collapsed and mounts after opening', async () => {
    const wrapper = mount(PreviewPanel)
    // Initially collapsed: no iframe should be present
    await wrapper.vm.$nextTick()
    const initiallyMounted = wrapper.find('iframe.preview-frame').exists() || wrapper.find('iframe.preview-frame-expanded').exists()
    expect(initiallyMounted).toBe(false)

    // Open the panel and expect the iframe to appear
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
    const mountedAfterOpen = wrapper.find('iframe.preview-frame').exists() || wrapper.find('iframe.preview-frame-expanded').exists()
    expect(mountedAfterOpen).toBe(true)
  })

  it('clicking the collapsed toggle button triggers preview generation', async () => {
    // Ensure previewMock call count resets
    previewMock.mockReset()
    const wrapper = mount(PreviewPanel)

    // Find the collapsed toggle button and click it
    const toggle = wrapper.find('button.preview-toggle')
    expect(toggle.exists()).toBe(true)
    await toggle.trigger('click')
    // nextTick to let handlers run
    await wrapper.vm.$nextTick()

    expect(previewMock).toHaveBeenCalledTimes(1)
  })

  it('applies correct CSS class for preview mode', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    // Open the panel so .preview-content is present
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
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
    // Open panel
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
    store.setPreviewHtml('<!DOCTYPE html><html><head></head><body><p>Preview</p></body></html>')
    await wrapper.vm.$nextTick()

    const status = wrapper.find('.status-message')
    expect(status.classes()).toContain('type-success')
    expect(status.text()).toContain('Aperçu généré le')
  })

  it('shows loading overlay while generating', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    // Open panel
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
    store.setPreviewLoading(true)
    await wrapper.vm.$nextTick()

    const overlay = wrapper.find('.preview-overlay')
    expect(overlay.exists()).toBe(true)
  })

  it('shows error status when preview fails', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()
    // Open panel
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
    store.setPreviewError('Erreur de génération')
    await wrapper.vm.$nextTick()

    const status = wrapper.find('.status-message')
    expect(status.classes()).toContain('type-error')
    expect(status.text()).toContain('Erreur de génération')
  })

  it('renders print button and triggers print when clicked', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()

    // Open panel and provide preview content
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
    store.setPreviewHtml('<!DOCTYPE html><html><body><p>Preview</p></body></html>')
    await wrapper.vm.$nextTick()

    if (typeof (window as any).print !== 'function') {
      ;(window as any).print = vi.fn()
    }
    const printSpy = vi.spyOn(window as any, 'print').mockImplementation(() => undefined as any)

    const btn = wrapper.find('button.print-button')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')

    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })

  it('renders open-in-new-tab button and opens a new window when clicked', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()

    // Open panel and provide preview content
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
    store.setPreviewHtml('<!DOCTYPE html><html><body><p>Preview</p></body></html>')
    await wrapper.vm.$nextTick()

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => ({ document: { open: () => {}, write: () => {}, close: () => {} } } as any))

    const btn = wrapper.find('button.open-button')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')

    expect(openSpy).toHaveBeenCalled()
    openSpy.mockRestore()
  })

  it('renders download HTML button and triggers download when clicked', async () => {
    const wrapper = mount(PreviewPanel)
    const store = useEditorStore()

    // Open panel and provide preview content
    window.dispatchEvent(new CustomEvent('toggle-preview', { detail: { open: true } }))
    await wrapper.vm.$nextTick()
    store.setPreviewHtml('<!DOCTYPE html><html><body><p>Preview</p></body></html>')
    await wrapper.vm.$nextTick()

    const createSpy = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:fake')
    // spy on anchor click via prototype
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined as any)

    const btn = wrapper.find('button.download-button')
    expect(btn.exists()).toBe(true)
    await btn.trigger('click')

    expect(createSpy).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()

  clickSpy.mockRestore()
  createSpy.mockRestore()
  })
})
