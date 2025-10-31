import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseCard from '../src/components/BaseCard.vue'

describe('BaseCard', () => {
  it('renders default slot content', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '<p>Card content</p>'
      }
    })
    
    expect(wrapper.html()).toContain('Card content')
    expect(wrapper.find('.card-body').exists()).toBe(true)
  })

  it('renders header slot when provided', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        header: '<h2>Card Header</h2>',
        default: '<p>Content</p>'
      }
    })
    
    expect(wrapper.find('.card-header').exists()).toBe(true)
    expect(wrapper.html()).toContain('Card Header')
  })

  it('renders footer slot when provided', () => {
    const wrapper = mount(BaseCard, {
      slots: {
        default: '<p>Content</p>',
        footer: '<button>Action</button>'
      }
    })
    
    expect(wrapper.find('.card-footer').exists()).toBe(true)
    expect(wrapper.html()).toContain('Action')
  })

  it('adds hoverable class when prop is true', () => {
    const wrapper = mount(BaseCard, {
      props: { hoverable: true },
      slots: { default: 'Content' }
    })
    
    expect(wrapper.classes()).toContain('is-hoverable')
  })

  it('adds clickable class when prop is true', () => {
    const wrapper = mount(BaseCard, {
      props: { clickable: true },
      slots: { default: 'Content' }
    })
    
    expect(wrapper.classes()).toContain('is-clickable')
  })

  it('emits click event when clickable', async () => {
    const wrapper = mount(BaseCard, {
      props: { clickable: true },
      slots: { default: 'Content' }
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('does not emit click when not clickable', async () => {
    const wrapper = mount(BaseCard, {
      props: { clickable: false },
      slots: { default: 'Content' }
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
