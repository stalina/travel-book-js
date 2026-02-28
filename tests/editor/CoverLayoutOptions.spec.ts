import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CoverLayoutOptions from '../../src/components/editor/CoverLayoutOptions.vue'

describe('CoverLayoutOptions', () => {
  it('renders placeholders for all 4 cover layouts', () => {
    const wrapper = mount(CoverLayoutOptions, {
      props: {
        modelValue: 'text-image'
      }
    })

    const options = wrapper.findAll('[data-test^="layout-option-"]')
    expect(options.length).toBe(4)

    const textImagePreview = options[0].find('.cover-preview.text-image')
    expect(textImagePreview.exists()).toBe(true)
    expect(textImagePreview.findAll('.title-line').length).toBeGreaterThan(0)
    expect(textImagePreview.find('.cover-thumb .img-placeholder').exists()).toBe(true)

    const textOnlyPreview = options[1].find('.cover-preview.text-only')
    expect(textOnlyPreview.exists()).toBe(true)
    expect(textOnlyPreview.findAll('.title-line').length).toBeGreaterThan(0)

    const imageFullPreview = options[2].find('.cover-preview.image-full')
    expect(imageFullPreview.exists()).toBe(true)
    expect(imageFullPreview.findAll('.pv-line').length).toBeGreaterThan(0)

    const imageTwoPreview = options[3].find('.cover-preview.image-two')
    expect(imageTwoPreview.exists()).toBe(true)
    expect(imageTwoPreview.findAll('.pv-line').length).toBeGreaterThan(0)
  })
})
