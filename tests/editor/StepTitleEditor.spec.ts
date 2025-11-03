import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import StepTitleEditor from '../../src/components/editor/StepTitleEditor.vue'

describe('StepTitleEditor', () => {
  it('renders the title input', () => {
    const wrapper = mount(StepTitleEditor, {
      props: {
        modelValue: 'Test Title'
      }
    })

    const input = wrapper.find('input[type="text"]')
    expect(input.exists()).toBe(true)
    expect(input.element.value).toBe('Test Title')
  })

  it('emits update:modelValue on valid blur', async () => {
    const wrapper = mount(StepTitleEditor, {
      props: {
        modelValue: 'Initial Title'
      }
    })

    const input = wrapper.find('input')
    await input.setValue('New Title')
    await input.trigger('blur')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['New Title'])
  })

  it('shows error when title is empty', async () => {
    const wrapper = mount(StepTitleEditor, {
      props: {
        modelValue: 'Valid Title'
      }
    })

    const input = wrapper.find('input')
    await input.setValue('')
    await input.trigger('blur')

    expect(wrapper.find('.title-error').exists()).toBe(true)
    expect(wrapper.find('.title-error').text()).toContain('requis')
  })

  it('shows error when title exceeds max length', async () => {
    const wrapper = mount(StepTitleEditor, {
      props: {
        modelValue: 'Valid Title'
      }
    })

    const longTitle = 'a'.repeat(101)
    const input = wrapper.find('input')
    await input.setValue(longTitle)
    await input.trigger('blur')

    expect(wrapper.find('.title-error').exists()).toBe(true)
    expect(wrapper.find('.title-error').text()).toContain('100')
  })

  it('restores previous value when validation fails', async () => {
    const wrapper = mount(StepTitleEditor, {
      props: {
        modelValue: 'Valid Title'
      }
    })

    const input = wrapper.find('input')
    await input.setValue('')
    await input.trigger('blur')

    expect(input.element.value).toBe('Valid Title')
  })

  it('triggers blur on Enter key', async () => {
    const wrapper = mount(StepTitleEditor, {
      props: {
        modelValue: 'Test Title'
      }
    })

    const input = wrapper.find('input')
    const blurSpy = vi.spyOn(input.element, 'blur')
    
    await input.trigger('keydown.enter')

    expect(blurSpy).toHaveBeenCalled()
  })

  it('emits trimmed value on blur', async () => {
    const wrapper = mount(StepTitleEditor, {
      props: {
        modelValue: 'Same Title'
      }
    })

    const input = wrapper.find('input')
    await input.trigger('blur')

    // Le composant émet toujours la valeur trimmed
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Same Title'])
  })

  it('clears error message when user types valid input', async () => {
    const wrapper = mount(StepTitleEditor, {
      props: {
        modelValue: 'Valid Title'
      }
    })

    const input = wrapper.find('input')
    
    // First create an error
    await input.setValue('')
    await input.trigger('blur')
    expect(wrapper.find('.title-error').exists()).toBe(true)

    // Then type valid input
    await input.setValue('New Valid Title')
    await input.trigger('blur')

    expect(wrapper.find('.title-error').exists()).toBe(false)
  })
})
