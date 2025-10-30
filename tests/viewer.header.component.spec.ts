import { describe, it, expect, vi } from 'vitest'
import { createApp } from 'vue'
import ViewerHeader from '../src/components/ViewerHeader.vue'

// Polyfill confirm si absent dans l'environnement de test (happy-dom)
if (typeof window.confirm !== 'function') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).confirm = () => true
}

describe('ViewerHeader.vue confirmation navigation', () => {
  function mount(): HTMLElement {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const app = createApp(ViewerHeader)
    app.mount(container)
    return container.querySelector('header.viewer-header') as HTMLElement
  }

  it('affiche une boîte de confirmation avant de naviguer', () => {
    const header = mount()
    const link = header.querySelector('a.new-book-btn') as HTMLAnchorElement
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    const defaultPreventedBefore = clickEvent.defaultPrevented
    link.dispatchEvent(clickEvent)
    expect(confirmSpy).toHaveBeenCalledOnce()
    expect(defaultPreventedBefore).toBe(false)
    expect(clickEvent.defaultPrevented).toBe(true)
    confirmSpy.mockRestore()
  })

  it('bypass la confirmation si data-no-confirm présent', () => {
    const header = mount()
    const link = header.querySelector('a.new-book-btn') as HTMLAnchorElement
    link.setAttribute('data-no-confirm', 'true')
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => { throw new Error('Ne devrait pas être appelé') })
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true })
    link.dispatchEvent(clickEvent)
    expect(confirmSpy).not.toHaveBeenCalled()
    expect(clickEvent.defaultPrevented).toBe(false)
    confirmSpy.mockRestore()
  })
})
