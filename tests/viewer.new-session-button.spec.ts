import { describe, it, expect } from 'vitest'
import { createApp } from 'vue'
import ViewerHeader from '../src/components/ViewerHeader.vue'

/**
 * Test de présence et attributs du bouton "Nouveau travel book" dans viewer.html
 */

describe('ViewerHeader.vue composant nouveau travel book bouton', () => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  const app = createApp(ViewerHeader)
  app.mount(container)
  const link = container.querySelector('a.new-book-btn') as HTMLAnchorElement | null

  it('contient un lien avec classe new-book-btn', () => {
    expect(link).not.toBeNull()
    expect(link!.classList.contains('new-book-btn')).toBe(true)
  })

  it('texte explicite Nouveau travel book', () => {
    expect(link!.textContent).toBe('Nouveau travel book')
  })

  it('redirige vers index.html via href relatif', () => {
    expect(link!.getAttribute('href')).toBe('/index.html')
  })

  it('accessibilité: role et aria-label présents', () => {
    expect(link!.getAttribute('role')).toBe('button')
    expect(link!.getAttribute('aria-label')).toBe('Démarrer un nouveau travel book')
  })
})
