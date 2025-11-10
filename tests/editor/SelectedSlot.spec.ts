import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SelectedSlot from '../../src/components/editor/SelectedSlot.vue'

describe('SelectedSlot', () => {
  it('renders empty slot with open library button', async () => {
    const wrapper = mount(SelectedSlot, {
      props: { photo: null, slotIndex: 0, slotNumber: 1 }
    })

    expect(wrapper.find('.selected-card.empty').exists()).toBe(true)
    const openBtn = wrapper.find('[data-test="page-photo-open-1"]')
    expect(openBtn.exists()).toBe(true)
    await openBtn.trigger('click')
    expect(wrapper.emitted('openLibrary')).toBeTruthy()
  })

  it('renders photo slot with edit and clear actions', async () => {
    const fakePhoto = { id: 'p1', index: 2, url: 'data://img', name: 'p1.jpg' } as any
    const wrapper = mount(SelectedSlot, {
      props: { photo: fakePhoto, slotIndex: 1, slotNumber: 2 }
    })

    expect(wrapper.find('img').attributes('src')).toBe('data://img')
    const editBtn = wrapper.find(`[data-test="page-photo-edit-${fakePhoto.index}"]`)
    const clearBtn = wrapper.find(`[data-test="page-photo-toggle-${fakePhoto.index}"]`)
    expect(editBtn.exists()).toBe(true)
    expect(clearBtn.exists()).toBe(true)

    await editBtn.trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()

    await clearBtn.trigger('click')
    expect(wrapper.emitted('clear')).toBeTruthy()
  })
})
