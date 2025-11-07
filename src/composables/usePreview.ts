import { ref, computed, watch, type Ref } from 'vue'
import type { Trip } from '../models/types'

/**
 * Mode de preview
 */
export type PreviewMode = 'mobile' | 'desktop' | 'pdf'

/**
 * Dimensions de la preview selon le mode
 */
export interface PreviewDimensions {
  width: number
  height: number
  scale: number
}

/**
 * Options pour le composable usePreview
 */
export interface PreviewOptions {
  /** Trip à prévisualiser */
  trip: Ref<Trip | null>
  /** HTML généré (single file) à utiliser pour la preview */
  generatedHtml?: Ref<string | null>
  /** Mode initial */
  initialMode?: PreviewMode
}

/**
 * Composable pour gérer la preview en temps réel
 * 
 * Synchronise automatiquement les changements du Trip avec la preview
 * et calcule les dimensions/scale selon le mode sélectionné.
 * 
 * @example
 * ```ts
 * const { mode, dimensions, content, setMode } = usePreview({
 *   trip: computed(() => editorStore.currentTrip),
 *   initialMode: 'desktop'
 * })
 * ```
 */
export function usePreview(options: PreviewOptions) {
  const { trip, generatedHtml, initialMode = 'desktop' } = options
  
  const mode = ref<PreviewMode>(initialMode)
  const content = ref<string>('')
  const lastUpdate = ref<Date>(new Date())
  
  /**
   * Dimensions selon le mode
   */
  const dimensions = computed<PreviewDimensions>(() => {
    switch (mode.value) {
      case 'mobile':
        return {
          width: 375,
          height: 667,
          scale: 0.5
        }
      case 'desktop':
        return {
          width: 1200,
          height: 800,
          scale: 0.3
        }
      case 'pdf':
        return {
          width: 794, // A4 width en px à 96dpi (210mm)
          height: 1123, // A4 height en px à 96dpi (297mm)
          scale: 0.4
        }
      default:
        return {
          width: 1200,
          height: 800,
          scale: 0.3
        }
    }
  })
  
  /**
   * Styles CSS pour le conteneur de preview
   */
  const containerStyles = computed(() => ({
    width: `${dimensions.value.width}px`,
    height: `${dimensions.value.height}px`,
    maxWidth: '100%',
    transform: `scale(${dimensions.value.scale})`,
    transformOrigin: 'top center',
    transition: 'all 0.3s ease'
  }))
  
  /**
   * Génère le contenu HTML de la preview
   */
  const escapeHtml = (value: string): string => {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  const buildPlaceholderDocument = (): string => {
    const currentTrip = trip.value
    const title = currentTrip?.name ? escapeHtml(currentTrip.name) : 'Aucun voyage sélectionné'
    const steps = currentTrip?.steps ?? []

    const stepsMarkup = steps.length
      ? steps
          .map((step, index) => `
            <li class="placeholder-step">
              <span class="step-badge">${index + 1}</span>
              <div class="step-infos">
                <h3>${escapeHtml(step.name || 'Étape sans titre')}</h3>
                <p>${escapeHtml([step.city, step.country].filter(Boolean).join(', ') || 'Localisation inconnue')}</p>
              </div>
            </li>
          `)
          .join('')
      : '<p class="placeholder-empty">Ajoutez des étapes pour générer votre travel book.</p>'

    return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <style>
      :root { color-scheme: light; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        margin: 0;
        padding: 32px;
        background: #f6f7fb;
        color: #1f2933;
      }
      .placeholder-wrapper {
        max-width: 640px;
        margin: 0 auto;
        background: white;
        border-radius: 16px;
        padding: 32px;
        box-shadow: 0 18px 60px rgba(15, 23, 42, 0.12);
      }
      h1 {
        font-size: 24px;
        margin: 0 0 12px;
        color: #ff6b6b;
        text-align: center;
      }
      p.description {
        text-align: center;
        margin: 0 0 24px;
        color: #52606d;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 16px;
      }
      .placeholder-step {
        display: flex;
        gap: 16px;
        align-items: center;
        padding: 16px;
        border-radius: 12px;
        background: #f8fafc;
        border: 1px solid #e3e8ee;
      }
      .step-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 12px;
        background: linear-gradient(135deg, #ff6b6b, #f5576c);
        color: white;
        font-weight: 700;
      }
      .step-infos h3 {
        margin: 0 0 4px;
        font-size: 18px;
      }
      .step-infos p {
        margin: 0;
        color: #8692a6;
        font-size: 14px;
      }
      .placeholder-empty {
        margin: 0;
        padding: 24px;
        text-align: center;
        color: #8692a6;
        border: 1px dashed #cbd2d9;
        border-radius: 12px;
        background: #f8fafc;
      }
    </style>
  </head>
  <body>
    <div class="placeholder-wrapper">
      <h1>${title || 'Travel Book'}</h1>
      <p class="description">Cliquez sur « Prévisualiser » pour générer l'aperçu complet.</p>
      <ul>${stepsMarkup}</ul>
    </div>
  </body>
</html>`
  }

  const generatePreviewContent = (): string => {
    if (generatedHtml?.value && generatedHtml.value.trim().length > 0) {
      return generatedHtml.value
    }
    return buildPlaceholderDocument()
  }
  
  /**
   * Met à jour le contenu de la preview
   */
  const updatePreview = (): void => {
    content.value = generatePreviewContent()
    lastUpdate.value = new Date()
  }
  
  /**
   * Change le mode de preview
   */
  const setMode = (newMode: PreviewMode): void => {
    mode.value = newMode
  }
  
  /**
   * Calcul des statistiques temps réel
   */
  const stats = computed(() => {
    if (!trip.value) {
      return {
        photos: 0,
        steps: 0,
        days: 0,
        pages: 0
      }
    }
    
    const steps = trip.value.steps?.length || 0
    const days = trip.value.start_date && trip.value.end_date
      ? Math.ceil((trip.value.end_date - trip.value.start_date) / (60 * 60 * 24))
      : 0
    
    // Estimation: 1 couverture + 1 stats + 1 carte + 2-3 pages par étape
    const pages = Math.ceil(3 + steps * 2.5)
    
    // TODO: Calculer photos depuis photosMapping quand disponible
    const photos = 0
    
    return {
      photos,
      steps,
      days,
      pages
    }
  })
  
  // Watch le trip et met à jour la preview automatiquement
  watch(
    [trip, generatedHtml ?? ref(null)],
    () => {
      updatePreview()
    },
    { deep: true, immediate: true }
  )
  
  // Watch le mode et met à jour la preview
  watch(
    mode,
    () => {
      updatePreview()
    }
  )
  
  return {
    mode,
    dimensions,
    containerStyles,
    content,
    lastUpdate,
    stats,
    setMode,
    updatePreview
  }
}
