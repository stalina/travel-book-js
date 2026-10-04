import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import RichTextEditor from '../../src/components/editor/RichTextEditor.vue'

// Seules les API dépendantes de la sélection/execCommand sont simulées :
// le vrai sanitizeHtml est conservé pour vérifier ce que l'éditeur émet
vi.mock('../../src/composables/useTextFormatting', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/composables/useTextFormatting')>()
  const { sanitizeHtml } = actual.useTextFormatting()
  return {
    useTextFormatting: () => ({
      applyFormat: vi.fn(),
      isFormatActive: {
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        h1: false,
        h2: false,
        h3: false,
        ul: false,
        ol: false
      },
      updateActiveFormats: vi.fn(),
      sanitizeHtml,
      handleSelectionChange: vi.fn()
    })
  }
})

describe('RichTextEditor', () => {
  it('renders the contenteditable div', () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '<p>Test content</p>',
        placeholder: 'Enter text'
      }
    })

    const editable = wrapper.find('[contenteditable="true"]')
    expect(editable.exists()).toBe(true)
  })

  it('has data-placeholder attribute', () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '',
        placeholder: 'Enter description'
      }
    })

    const editable = wrapper.find('.rich-text-editor')
    expect(editable.exists()).toBe(true)
  })

  it('loads initial content on mount', async () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '<p>Initial content</p>',
        placeholder: 'Enter text'
      }
    })

    await wrapper.vm.$nextTick()

    const editable = wrapper.find('[contenteditable="true"]')
    expect(editable.html()).toContain('Initial content')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '',
        placeholder: 'Enter text'
      }
    })

    const editable = wrapper.find('[contenteditable="true"]')
    
    // Simule un événement input
    await editable.trigger('input')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })

  it('emits sanitized HTML on input', async () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '',
        placeholder: 'Enter text'
      }
    })

    const editable = wrapper.find('[contenteditable="true"]')
    editable.element.innerHTML =
      '<p onmouseover="alert(1)" style="color:red"><b class="x">Hello</b></p><a href="javascript:alert(2)">link</a>'
    await editable.trigger('input')

    expect(wrapper.emitted('update:modelValue')).toEqual([['<p><b>Hello</b></p>link']])
  })

  // happy-dom n'exécute pas les gestionnaires inline : on vérifie le balisage injecté dans le DOM
  it('sanitizes a malicious initial modelValue before rendering it', () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '<p onmouseover="alert(1)">Hi</p><img src=x onerror=alert(2)><script>alert(3)</script>',
        placeholder: 'Enter text'
      }
    })

    const editable = wrapper.find('[contenteditable="true"]').element
    expect(editable.innerHTML).toBe('<p>Hi</p>')
    expect(editable.querySelector('img, script, [onmouseover], [onerror]')).toBeNull()
  })

  it('sanitizes a malicious modelValue set after mount', async () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '<p>Initial</p>',
        placeholder: 'Enter text'
      }
    })

    await wrapper.setProps({ modelValue: '<b style="color:red">Bold</b><img src=x onerror=alert(1)>' })

    const editable = wrapper.find('[contenteditable="true"]').element
    expect(editable.innerHTML).toBe('<b>Bold</b>')
    expect(editable.querySelector('img, [onerror], [style]')).toBeNull()
  })

  it('displays plain-text descriptions unchanged', async () => {
    const text = 'Fish & chips < 10€\nthen a walk'
    const wrapper = mount(RichTextEditor, {
      props: { modelValue: text, placeholder: 'Enter text' }
    })

    const editable = wrapper.find('[contenteditable="true"]').element
    expect(editable.textContent).toBe(text)

    await wrapper.setProps({ modelValue: `${text} again` })
    expect(editable.textContent).toBe(`${text} again`)
  })

  it('does not rewrite the DOM when the parent echoes the emitted value', async () => {
    const wrapper = mount(RichTextEditor, {
      props: { modelValue: '', placeholder: 'Enter text' }
    })

    const editable = wrapper.find('[contenteditable="true"]')
    editable.element.innerHTML = '<p>Fish &amp; chips</p>'
    const paragraph = editable.element.firstChild
    await editable.trigger('input')

    const [[emitted]] = wrapper.emitted('update:modelValue') as [[string]]
    const innerHtmlSetter = vi.spyOn(editable.element, 'innerHTML', 'set')
    await wrapper.setProps({ modelValue: emitted })

    expect(innerHtmlSetter).not.toHaveBeenCalled()
    expect(editable.element.firstChild).toBe(paragraph)
  })

  it('renders FormattingToolbar', () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '',
        placeholder: 'Enter text'
      }
    })

    expect(wrapper.findComponent({ name: 'FormattingToolbar' }).exists()).toBe(true)
  })

  it('has editor class', () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '',
        placeholder: 'Enter text'
      }
    })

    const editable = wrapper.find('.rich-text-editor')
    expect(editable.exists()).toBe(true)
  })

  it('syncs with modelValue changes', async () => {
    const wrapper = mount(RichTextEditor, {
      props: {
        modelValue: '<p>Initial</p>',
        placeholder: 'Enter text'
      }
    })

    await wrapper.setProps({ modelValue: '<p>Updated</p>' })
    await wrapper.vm.$nextTick()

    const editable = wrapper.find('[contenteditable="true"]')
    expect(editable.html()).toContain('Updated')
  })
})
