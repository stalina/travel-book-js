import { ref, onMounted, onUnmounted, UnwrapRef } from 'vue'

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
  onApply: (state: UnwrapRef<T>) => void
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
  // Internal stored state type (unwrapped for refs)
  type S = UnwrapRef<T>
  
  // Stack d'actions (undo)
  const undoStack = ref<HistoryAction<S>[]>([])
  
  // Stack de redo
  const redoStack = ref<HistoryAction<S>[]>([])
  
  // État actuel
  const currentState = ref<S>(initialState as unknown as S) as { value: S }
  
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
  const record = (before: S, after: S, description?: string): void => {
    const action: HistoryAction<S> = {
      before,
      after,
      timestamp: Date.now(),
      description
    }
    
    // Ajouter à la stack undo
  // cast forcé pour éviter les incompatibilités de UnwrapRef dans les signatures génériques
  undoStack.value.push(action as unknown as HistoryAction<any>)
    
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
  // Appliquer l'état before (cast pour satisfaire TS)
  currentState.value = action.before as unknown as S
  onApply(action.before as unknown as S)
    
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
  // push vers undo (cast similaire)
  undoStack.value.push(action as unknown as HistoryAction<any>)
    
    // Appliquer l'état after
  // Appliquer l'état after (cast pour satisfaire TS)
  currentState.value = action.after as unknown as S
  onApply(action.after as unknown as S)
    
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
