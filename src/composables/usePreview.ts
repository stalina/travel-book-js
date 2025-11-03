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
  const { trip, initialMode = 'desktop' } = options
  
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
    maxWidth: '100%',
    transform: `scale(${dimensions.value.scale})`,
    transformOrigin: 'top center',
    transition: 'all 0.3s ease'
  }))
  
  /**
   * Génère le contenu HTML de la preview
   */
  const generatePreviewContent = (): string => {
    if (!trip.value) {
      return '<div class="empty-preview">Aucun voyage chargé</div>'
    }
    
    const { name, steps } = trip.value
    
    let html = `
      <div class="preview-trip">
        <h1 class="trip-title">${name || 'Sans titre'}</h1>
        <div class="trip-steps">
    `
    
    if (steps && steps.length > 0) {
      steps.forEach((step, index) => {
        html += `
          <div class="preview-step">
            <div class="step-number">${index + 1}</div>
            <h2 class="step-name">${step.name}</h2>
            <p class="step-location">${step.city || ''}, ${step.country || ''}</p>
          </div>
        `
      })
    } else {
      html += '<p class="no-steps">Aucune étape</p>'
    }
    
    html += `
        </div>
      </div>
    `
    
    return html
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
    trip,
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
