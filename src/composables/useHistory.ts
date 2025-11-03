import { ref, onMounted, onUnmounted } from 'vue'

/**
 * Action dans l'historique
 */
export interface HistoryAction<T = any> {
  /** État avant l'action */
  before: T
  /** État après l'action */
  after: T
  /** Timestamp de l'action */
  timestamp: number
  /** Description optionnelle */
  description?: string
}

/**
 * Options pour l'historique
 */
export interface HistoryOptions<T> {
  /** Taille maximale de l'historique (défaut: 20) */
  maxSize?: number
  /** État initial */
  initialState: T
  /** Callback pour appliquer un état */
  onApply: (state: T) => void
}

/**
 * Composable pour gérer l'historique undo/redo
 * 
 * Gère une pile d'actions avec undo/redo et raccourcis clavier.
 * 
 * @example
 * ```ts
 * const { canUndo, canRedo, undo, redo, record } = useHistory({
 *   maxSize: 20,
 *   initialState: { text: '' },
 *   onApply: (state) => {
 *     editor.value = state.text
 *   }
 * })
 * 
 * // Enregistrer une action
 * record(oldState, newState, 'Edit title')
 * 
 * // Undo/Redo
 * undo()
 * redo()
 * ```
 */
export function useHistory<T>(options: HistoryOptions<T>) {
  const { maxSize = 20, initialState, onApply } = options
  
  // Stack d'actions (undo)
  const undoStack = ref<HistoryAction<T>[]>([])
  
  // Stack de redo
  const redoStack = ref<HistoryAction<T>[]>([])
  
  // État actuel
  const currentState = ref<T>(initialState) as { value: T }
  
  /**
   * Vérifie si undo est possible
   */
  const canUndo = ref(false)
  
  /**
   * Vérifie si redo est possible
   */
  const canRedo = ref(false)
  
  /**
   * Met à jour les flags can*
   */
  const updateFlags = (): void => {
    canUndo.value = undoStack.value.length > 0
    canRedo.value = redoStack.value.length > 0
  }
  
  /**
   * Enregistre une nouvelle action dans l'historique
   */
  const record = (before: T, after: T, description?: string): void => {
    const action: HistoryAction<T> = {
      before,
      after,
      timestamp: Date.now(),
      description
    }
    
    // Ajouter à la stack undo
    undoStack.value.push(action)
    
    // Limiter la taille
    if (undoStack.value.length > maxSize) {
      undoStack.value.shift()
    }
    
    // Vider la stack redo
    redoStack.value = []
    
    // Mettre à jour l'état
    currentState.value = after
    
    updateFlags()
  }
  
  /**
   * Annule la dernière action (undo)
   */
  const undo = (): void => {
    if (undoStack.value.length === 0) {
      return
    }
    
    const action = undoStack.value.pop()!
    
    // Ajouter à la stack redo
    redoStack.value.push(action)
    
    // Appliquer l'état before
    currentState.value = action.before
    onApply(action.before)
    
    updateFlags()
  }
  
  /**
   * Refait la dernière action annulée (redo)
   */
  const redo = (): void => {
    if (redoStack.value.length === 0) {
      return
    }
    
    const action = redoStack.value.pop()!
    
    // Ajouter à la stack undo
    undoStack.value.push(action)
    
    // Appliquer l'état after
    currentState.value = action.after
    onApply(action.after)
    
    updateFlags()
  }
  
  /**
   * Efface tout l'historique
   */
  const clear = (): void => {
    undoStack.value = []
    redoStack.value = []
    updateFlags()
  }
  
  /**
   * Gestionnaire de raccourcis clavier
   */
  const handleKeyboard = (event: KeyboardEvent): void => {
    // Ctrl+Z ou Cmd+Z pour undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
      event.preventDefault()
      undo()
    }
    
    // Ctrl+Shift+Z ou Cmd+Shift+Z pour redo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) {
      event.preventDefault()
      redo()
    }
    
    // Ctrl+Y ou Cmd+Y pour redo (alternative)
    if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
      event.preventDefault()
      redo()
    }
  }
  
  // Enregistrer les raccourcis clavier
  onMounted(() => {
    window.addEventListener('keydown', handleKeyboard)
  })
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyboard)
  })
  
  return {
    canUndo,
    canRedo,
    currentState,
    undoStack,
    redoStack,
    record,
    undo,
    redo,
    clear
  }
}
