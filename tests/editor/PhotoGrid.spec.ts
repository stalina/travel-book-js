import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PhotoGrid from '../../src/components/editor/PhotoGrid.vue'

describe('PhotoGrid', () => {
  it('renders empty grid when no photos', () => {
    const wrapper = mount(PhotoGrid, {
      props: {
        photos: []
      }
    })

    expect(wrapper.find('.photo-grid').exists()).toBe(true)
    expect(wrapper.findAll('.photo-item').length).toBe(0)
  })

  it('renders the add photo button', () => {
    const wrapper = mount(PhotoGrid, {
      props: {
        photos: []
      }
    })

    const addBtn = wrapper.find('.photo-add')
    expect(addBtn.exists()).toBe(true)
  })

  it('emits add event when add button is clicked', async () => {
    const wrapper = mount(PhotoGrid, {
      props: {
        photos: []
      }
    })

    const addBtn = wrapper.find('.photo-add')
    await addBtn.trigger('click')

    expect(wrapper.emitted('add')).toBeTruthy()
  })

  it('renders grid with correct class', () => {
    const wrapper = mount(PhotoGrid, {
      props: {
        photos: []
      }
    })

    expect(wrapper.find('.photo-grid').classes()).toContain('photo-grid')
  })
})
