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
})
