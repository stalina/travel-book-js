import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import BaseButton from '../src/components/BaseButton.vue'

describe('BaseButton', () => {
  it('renders with default props', () => {
    const wrapper = mount(BaseButton, {
      slots: {
        default: 'Click me'
      }
    })
    
    expect(wrapper.text()).toContain('Click me')
    expect(wrapper.classes()).toContain('variant-primary')
    expect(wrapper.classes()).toContain('size-md')
  })

  it('renders with different variants', () => {
    const variants = ['primary', 'secondary', 'outline', 'ghost'] as const
    
    variants.forEach((variant) => {
      const wrapper = mount(BaseButton, {
        props: { variant },
        slots: { default: 'Button' }
      })
      
      expect(wrapper.classes()).toContain(`variant-${variant}`)
    })
  })

  it('renders with different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    
    sizes.forEach((size) => {
      const wrapper = mount(BaseButton, {
        props: { size },
        slots: { default: 'Button' }
      })
      
      expect(wrapper.classes()).toContain(`size-${size}`)
    })
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(BaseButton, {
      slots: { default: 'Click me' }
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(BaseButton, {
      props: { disabled: true },
      slots: { default: 'Disabled' }
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('shows loading state', () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true },
      slots: { default: 'Loading' }
    })
    
    expect(wrapper.classes()).toContain('is-loading')
    expect(wrapper.find('.spinner').exists()).toBe(true)
    expect(wrapper.find('.content-hidden').exists()).toBe(true)
  })

  it('does not emit click when loading', async () => {
    const wrapper = mount(BaseButton, {
      props: { loading: true },
      slots: { default: 'Loading' }
    })
    
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })

  it('renders with correct type attribute', () => {
    const types = ['button', 'submit', 'reset'] as const
    
    types.forEach((type) => {
      const wrapper = mount(BaseButton, {
        props: { type },
        slots: { default: 'Button' }
      })
      
      expect(wrapper.attributes('type')).toBe(type)
    })
  })
})
