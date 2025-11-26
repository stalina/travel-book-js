import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LandingView from '../src/views/LandingView.vue'
import LandingHero from '../src/components/landing/LandingHero.vue'
import LandingFeatures from '../src/components/landing/LandingFeatures.vue'
import LandingHowItWorks from '../src/components/landing/LandingHowItWorks.vue'
import LandingCTA from '../src/components/landing/LandingCTA.vue'

describe('LandingView', () => {
  it('renders all main sections', () => {
    const wrapper = mount(LandingView, {
      global: {
        stubs: {
          LandingHero: true,
          LandingFeatures: true,
          LandingHowItWorks: true,
          LandingCTA: true
        }
      }
    })
    
    expect(wrapper.findComponent(LandingHero).exists()).toBe(true)
    expect(wrapper.findComponent(LandingFeatures).exists()).toBe(true)
    expect(wrapper.findComponent(LandingHowItWorks).exists()).toBe(true)
    expect(wrapper.findComponent(LandingCTA).exists()).toBe(true)
  })

  it('renders footer with correct year', () => {
    const wrapper = mount(LandingView, {
      global: {
        stubs: {
          LandingHero: true,
          LandingFeatures: true,
          LandingHowItWorks: true,
          LandingCTA: true
        }
      }
    })
    
    const currentYear = new Date().getFullYear()
    expect(wrapper.find('.landing-footer').exists()).toBe(true)
    expect(wrapper.text()).toContain(currentYear.toString())
  })

  it('scrolls to top when footer link clicked', async () => {
    const scrollToSpy = vi.spyOn(window, 'scrollTo')
    
    const wrapper = mount(LandingView, {
      global: {
        stubs: {
          LandingHero: true,
          LandingFeatures: true,
          LandingHowItWorks: true,
          LandingCTA: true
        }
      }
    })
    
    const footerLink = wrapper.find('.footer-link')
    await footerLink.trigger('click')
    
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    scrollToSpy.mockRestore()
  })
})
