import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SaveStatus from '../../src/components/editor/SaveStatus.vue'

describe('SaveStatus', () => {
  it('shows nothing when idle', () => {
    const wrapper = mount(SaveStatus, {
      props: {
        status: 'idle'
      }
    })

    const element = wrapper.find('.save-status')
    expect(element.classes()).toContain('status-idle')
  })

  it('shows pending status', () => {
    const wrapper = mount(SaveStatus, {
      props: {
        status: 'pending'
      }
    })

    expect(wrapper.find('.status-text').text()).toContain('attente')
    expect(wrapper.find('.status-icon').text()).toBe('⏳')
  })

  it('shows saving status with pulse animation', () => {
    const wrapper = mount(SaveStatus, {
      props: {
        status: 'saving'
      }
    })

    expect(wrapper.find('.status-text').text()).toContain('en cours')
    expect(wrapper.find('.status-icon').text()).toBe('💾')
    expect(wrapper.find('.save-status').classes()).toContain('status-saving')
  })

  it('shows saved status', () => {
    const wrapper = mount(SaveStatus, {
      props: {
        status: 'saved'
      }
    })

    expect(wrapper.find('.status-text').text()).toContain('Sauvegardé')
    expect(wrapper.find('.status-icon').text()).toBe('✓')
  })

  it('shows error status', () => {
    const wrapper = mount(SaveStatus, {
      props: {
        status: 'error'
      }
    })

    expect(wrapper.find('.status-text').text()).toContain('Erreur')
    expect(wrapper.find('.status-icon').text()).toBe('⚠️')
  })

  it('accepts lastSaveTime prop', () => {
    const now = new Date()
    const wrapper = mount(SaveStatus, {
      props: {
        status: 'saved',
        lastSaveTime: now
      }
    })

    expect(wrapper.vm).toBeDefined()
  })
})
