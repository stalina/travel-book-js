import { describe, it, expect } from 'vitest'
import { createApp } from 'vue'
import ViewerHeader from '../src/components/ViewerHeader.vue'

describe('ViewerHeader.vue composant (navigation anchor)', () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const app = createApp(ViewerHeader)
  app.mount(container)
  const link = container.querySelector('a.new-book-btn') as HTMLAnchorElement | null

  it('rend le lien nouveau travel book', () => {
    expect(link).not.toBeNull()
  })

  it('texte correct', () => {
    expect(link!.textContent).toBe('Nouveau travel book')
  })

  it('href correct', () => {
    expect(link!.getAttribute('href')).toBe('/index.html')
  })

  it('accessibilité: role & aria-label', () => {
    expect(link!.getAttribute('role')).toBe('button')
    expect(link!.getAttribute('aria-label')).toBe('Démarrer un nouveau travel book')
  })

  it('classe new-book-btn présente', () => {
    expect(link!.classList.contains('new-book-btn')).toBe(true)
  })
})
