import { ref, watch } from 'vue'

/**
 * Status de sauvegarde automatique
 */
export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

/**
 * Options pour l'auto-save
 */
export interface AutoSaveOptions {
  /** Délai de debounce en ms (défaut: 1000) */
  debounceMs?: number
  /** Callback de sauvegarde */
  onSave: () => Promise<void> | void
  /** Callback d'erreur */
  onError?: (error: Error) => void
}

/**
 * Composable pour la sauvegarde automatique avec debounce
 * 
 * Détecte les changements et déclenche une sauvegarde après un délai.
 * Fournit un feedback visuel via le status.
 * 
 * @example
 * ```ts
 * const { status, triggerSave } = useAutoSave({
 *   debounceMs: 1000,
 *   onSave: async () => {
 *     await store.saveTrip()
 *   }
 * })
 * 
 * // Déclencher manuellement
 * triggerSave()
 * ```
 */
export function useAutoSave(options: AutoSaveOptions) {
  const { debounceMs = 1000, onSave, onError } = options
  
  const status = ref<SaveStatus>('idle')
  const lastSaveTime = ref<Date | null>(null)
  let debounceTimer: number | null = null
  
  /**
   * Annule le timer de debounce en cours
   */
  const cancelDebounce = (): void => {
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
  }
  
  /**
   * Exécute la sauvegarde
   */
  const executeSave = async (): Promise<void> => {
    try {
      status.value = 'saving'
      await onSave()
      status.value = 'saved'
      lastSaveTime.value = new Date()
      
      // Retour à idle après 2 secondes
      setTimeout(() => {
        if (status.value === 'saved') {
          status.value = 'idle'
        }
      }, 2000)
    } catch (error) {
      status.value = 'error'
      if (onError) {
        onError(error as Error)
      }
      
      // Retour à idle après 3 secondes
      setTimeout(() => {
        if (status.value === 'error') {
          status.value = 'idle'
        }
      }, 3000)
    }
  }
  
  /**
   * Déclenche une sauvegarde avec debounce
   */
  const triggerSave = (): void => {
    // Annuler le timer précédent
    cancelDebounce()
    
    // Passer en état pending
    status.value = 'pending'
    
    // Créer un nouveau timer
    debounceTimer = setTimeout(() => {
      executeSave()
      debounceTimer = null
    }, debounceMs) as unknown as number
  }
  
  /**
   * Sauvegarde immédiate (sans debounce)
   */
  const saveNow = async (): Promise<void> => {
    cancelDebounce()
    await executeSave()
  }
  
  /**
   * Réinitialise le status
   */
  const reset = (): void => {
    cancelDebounce()
    status.value = 'idle'
    lastSaveTime.value = null
  }
  
  /**
   * Watch une ref et déclenche auto-save sur changement
   */
  const watchAndSave = <T>(source: () => T): void => {
    watch(source, () => {
      triggerSave()
    }, { deep: true })
  }
  
  return {
    status,
    lastSaveTime,
    triggerSave,
    saveNow,
    reset,
    watchAndSave
  }
}
