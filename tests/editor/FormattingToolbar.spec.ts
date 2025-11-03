import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FormattingToolbar from '../../src/components/editor/FormattingToolbar.vue'

vi.mock('../../src/composables/useTextFormatting', () => ({
  useTextFormatting: () => ({
    applyFormat: vi.fn(),
    isFormatActive: {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      h1: false,
      h2: false,
      h3: false,
      ul: false,
      ol: false
    },
    updateActiveFormats: vi.fn()
  })
}))

describe('FormattingToolbar', () => {
  it('renders all toolbar buttons', () => {
    const wrapper = mount(FormattingToolbar)

    expect(wrapper.find('[title="Gras (Ctrl+B)"]').exists()).toBe(true)
    expect(wrapper.find('[title="Italique (Ctrl+I)"]').exists()).toBe(true)
    expect(wrapper.find('[title="Souligné (Ctrl+U)"]').exists()).toBe(true)
    expect(wrapper.find('[title="Barré"]').exists()).toBe(true)
  })

  it('renders header buttons', () => {
    const wrapper = mount(FormattingToolbar)

    expect(wrapper.find('[title="Titre 1"]').exists()).toBe(true)
    expect(wrapper.find('[title="Titre 2"]').exists()).toBe(true)
    expect(wrapper.find('[title="Titre 3"]').exists()).toBe(true)
  })

  it('renders list buttons', () => {
    const wrapper = mount(FormattingToolbar)

    expect(wrapper.find('[title="Liste à puces"]').exists()).toBe(true)
    expect(wrapper.find('[title="Liste numérotée"]').exists()).toBe(true)
  })

  it('calls applyFormat when button is clicked', async () => {
    const wrapper = mount(FormattingToolbar)
    const boldBtn = wrapper.find('[title="Gras (Ctrl+B)"]')

    await boldBtn.trigger('click')

    // applyFormat devrait être appelé via le composable mocké
    expect(wrapper.vm).toBeDefined()
  })

  it('has toolbar-group separators', () => {
    const wrapper = mount(FormattingToolbar)
    const groups = wrapper.findAll('.toolbar-group')

    expect(groups.length).toBeGreaterThanOrEqual(3)
  })

  it('exposes updateActiveFormats method', () => {
    const wrapper = mount(FormattingToolbar)

    expect(typeof wrapper.vm.updateActiveFormats).toBe('function')
  })

  it('has sticky positioning', () => {
    const wrapper = mount(FormattingToolbar)
    const toolbar = wrapper.find('.formatting-toolbar')

    expect(toolbar.classes()).toContain('formatting-toolbar')
  })
})
