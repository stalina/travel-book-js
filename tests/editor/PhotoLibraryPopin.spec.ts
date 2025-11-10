import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PhotoLibraryPopin from '../../src/components/editor/PhotoLibraryPopin.vue'

const fakePhotos = [
  { id: 'a', index: 1, url: 'data://1', name: '1.jpg' },
  { id: 'b', index: 2, url: 'data://2', name: '2.jpg' }
] as any

describe('PhotoLibraryPopin', () => {
  it('renders counts and search input', () => {
    const wrapper = mount(PhotoLibraryPopin, { props: { filtered: fakePhotos, total: 2, query: '', ratio: 'all', ratioOptions: [] } })
    expect(wrapper.find('.muted').text()).toContain('2 / 2')
    expect(wrapper.find('input.library-search').exists()).toBe(true)
  })

  it('emits select when an item clicked', async () => {
    const wrapper = mount(PhotoLibraryPopin, { props: { filtered: fakePhotos, total: 2, query: '', ratio: 'all', ratioOptions: [] } })
    const item = wrapper.find('.library-item')
    expect(item.exists()).toBe(true)
    await item.trigger('click')
    expect(wrapper.emitted('select')).toBeTruthy()
  })
})
