import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SelectedGrid from '../../src/components/editor/SelectedGrid.vue'

describe('SelectedGrid (replacement for PhotoGrid tests)', () => {
  it('renders empty selection when no slots', () => {
    const wrapper = mount(SelectedGrid, {
      props: {
        slots: [],
        selectedCount: 0,
        capacity: 0
      }
    })

    expect(wrapper.find('.selected-grid').exists()).toBe(true)
    // no SelectedSlot children
    expect(wrapper.findAllComponents({ name: 'SelectedSlot' }).length).toBe(0)
  })

  it('renders capacity and selected count in header', () => {
    const wrapper = mount(SelectedGrid, {
      props: {
        slots: [null, null],
        selectedCount: 1,
        capacity: 2
      }
    })

    expect(wrapper.text()).toContain('(1 / 2)')
    expect(wrapper.find('.selected-grid').exists()).toBe(true)
  })
})
