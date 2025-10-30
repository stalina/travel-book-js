import { describe, it, expect, beforeEach } from 'vitest'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ViewerView from '../src/views/ViewerView.vue'

/**
 * Test d'intégration léger de ViewerView:
 * - Monte la vue dans une app Vue + Pinia
 * - Vérifie présence du composant Vue <ViewerHeader /> (racine: header.viewer-header)
 * - Vérifie présence du bouton "Nouveau travel book" dans le header
 * - Vérifie présence des boutons d'action propres à la vue
 */

describe('ViewerView - intégration', () => {
  let root: HTMLElement

  beforeEach(() => {
    root = document.createElement('div')
    document.body.innerHTML = ''
    document.body.appendChild(root)
    const app = createApp(ViewerView)
    app.use(createPinia())
    app.mount(root)
  })

  it('rend le composant header Vue', () => {
    const headerEl = root.querySelector('header.viewer-header')
    expect(headerEl).not.toBeNull()
  })

  it('contient le lien nouveau travel book dans header', () => {
    const link = root.querySelector('header.viewer-header a.new-book-btn') as HTMLAnchorElement | null
    expect(link).not.toBeNull()
    expect(link!.textContent).toBe('Nouveau travel book')
    expect(link!.getAttribute('href')).toBe('/index.html')
  })

  it('affiche les boutons d\'actions de la vue', () => {
    const buttons = Array.from(root.querySelectorAll('button'))
    const labels = buttons.map(b => b.textContent?.trim())
    expect(labels).toContain('Ouvrir dans un nouvel onglet')
    expect(labels).toContain('Télécharger (fichier unique)')
    expect(labels).toContain("Retour à l'édition")
  })
})
