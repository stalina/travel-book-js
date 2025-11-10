import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PagesStrip from '../../src/components/editor/PagesStrip.vue'

describe('PagesStrip', () => {
  it('renders empty message when no pages', () => {
    const wrapper = mount(PagesStrip, {
      props: {
        pages: [],
        activePageId: '',
        coverFormat: 'text-image',
        previewClassFor: {},
        canMoveLeft: false,
        canMoveRight: false,
        hasActive: false
      }
    })

    expect(wrapper.find('.empty-msg').exists()).toBe(true)
  })

  it('renders pages and buttons when pages present', async () => {
    const pages = [ { id: 'p1', layout: 'full-page', photoIndices: [] }, { id: 'p2', layout: 'grid-2x2', photoIndices: [] } ]
    const wrapper = mount(PagesStrip, {
      props: {
        pages,
        activePageId: 'p1',
        coverFormat: 'text-image',
        previewClassFor: { 'grid-2x2': 'grid-2x2' },
        canMoveLeft: false,
        canMoveRight: true,
        hasActive: true
      }
    })

    expect(wrapper.findAll('.page-thumb').length).toBe(2)
    expect(wrapper.find('[data-test="add-page"]').exists()).toBe(true)
  })

  it('displays cover and layout thumbnails with structural classes', () => {
    const pages = [
      { id: 'cover', layout: 'full-page', photoIndices: [] },
      { id: 'p2', layout: 'grid-2x2', photoIndices: [] }
    ]
    const wrapper = mount(PagesStrip, {
      props: {
        pages,
        activePageId: 'cover',
        coverFormat: 'text-image',
        previewClassFor: { 'grid-2x2': 'grid-2x2', 'full-page': 'full-page' },
        canMoveLeft: false,
        canMoveRight: true,
        hasActive: true
      }
    })

    const thumbs = wrapper.findAll('.page-thumb')
    expect(thumbs[0].find('.cover-preview.text-image').exists()).toBe(true)
    expect(thumbs[0].findAll('.title-line').length).toBeGreaterThan(0)

    const layoutPreview = thumbs[1].find('.mini-layout .layout-preview.grid-2x2')
    expect(layoutPreview.exists()).toBe(true)
    expect(layoutPreview.findAll('.layout-block').length).toBe(4)
  })
})
