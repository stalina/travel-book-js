import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CoverLayoutOptions from '../../src/components/editor/CoverLayoutOptions.vue'

describe('CoverLayoutOptions', () => {
  it('renders placeholders for both cover layouts', () => {
    const wrapper = mount(CoverLayoutOptions, {
      props: {
        modelValue: 'text-image'
      }
    })

    const options = wrapper.findAll('[data-test^="layout-option-"]')
    expect(options.length).toBe(2)

    const textImagePreview = options[0].find('.cover-preview.text-image')
    expect(textImagePreview.exists()).toBe(true)
    expect(textImagePreview.findAll('.title-line').length).toBeGreaterThan(0)
    expect(textImagePreview.find('.cover-thumb .img-placeholder').exists()).toBe(true)

    const textOnlyPreview = options[1].find('.cover-preview.text-only')
    expect(textOnlyPreview.exists()).toBe(true)
    expect(textOnlyPreview.findAll('.title-line').length).toBeGreaterThan(0)
    expect(options[1].findAll('.subtitle-line').length).toBeGreaterThan(0)
  })
})
