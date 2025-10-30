import { buildSingleFileHtml } from '../services/generate.service'
import type { GeneratedArtifacts } from '../services/generate.service'

/**
 * ViewerController - Contrôleur pour la gestion du viewer de travel book
 * Encapsule la logique d'ouverture dans un nouvel onglet et de téléchargement
 */
export class ViewerController {
  /**
   * Ouvre le travel book dans un nouvel onglet
   * @param artifacts - Artefacts générés contenant le manifest
   */
  public async openInNewTab(artifacts: GeneratedArtifacts): Promise<void> {
    const blob = await buildSingleFileHtml(artifacts)
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    // Note: URL non révoqué immédiatement pour ne pas invalider la page ouverte
  }

  /**
   * Télécharge le travel book en tant que fichier HTML autonome
   * @param artifacts - Artefacts générés contenant le manifest
   * @param filename - Nom du fichier à télécharger (défaut: 'travel_book.html')
   */
  public async download(artifacts: GeneratedArtifacts, filename: string = 'travel_book.html'): Promise<void> {
    const blob = await buildSingleFileHtml(artifacts)
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    
    URL.revokeObjectURL(url)
  }

  /**
   * Retourne à l'éditeur de plan photos
   */
  public backToEditor(): void {
    location.hash = '#/generate'
  }
}

// Export singleton instance
export const viewerController = new ViewerController()
