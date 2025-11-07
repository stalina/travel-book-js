import { ref, Ref } from 'vue'

/**
 * Composable pour gérer le drag & drop d'éléments
 * 
 * @template T - Type des éléments à réorganiser
 * @param items - Ref vers le tableau d'éléments
 * @param onReorder - Callback appelé après réorganisation avec le nouvel ordre
 * @returns Méthodes et état pour le drag & drop
 */
export function useDragAndDrop<T>(
  items: Ref<T[]>,
  onReorder: (newOrder: T[]) => void
) {
  const draggedIndex = ref<number | null>(null)
  const dragOverIndex = ref<number | null>(null)
  const isDragging = ref(false)

  /**
   * Commence le drag d'un élément
   */
  const handleDragStart = (event: DragEvent, index: number) => {
    draggedIndex.value = index
    isDragging.value = true
    
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/html', String(index))
    }

    // Ajouter classe au prochain tick pour permettre l'animation
    setTimeout(() => {
      if (event.target instanceof HTMLElement) {
        event.target.classList.add('dragging')
      }
    }, 0)
  }

  /**
   * Gère le survol d'un élément pendant le drag
   */
  const handleDragOver = (event: DragEvent, index: number) => {
    event.preventDefault()
    
    if (draggedIndex.value === null || draggedIndex.value === index) {
      return
    }

    dragOverIndex.value = index

    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move'
    }
  }

  /**
   * Gère l'entrée dans une zone de drop
   */
  const handleDragEnter = (event: DragEvent, index: number) => {
    event.preventDefault()
    
    if (draggedIndex.value !== null && draggedIndex.value !== index) {
      dragOverIndex.value = index
    }
  }

  /**
   * Gère la sortie d'une zone de drop
   */
  const handleDragLeave = (event: DragEvent) => {
    // Ne reset que si on quitte vraiment l'élément (pas ses enfants)
    if (event.target === event.currentTarget) {
      dragOverIndex.value = null
    }
  }

  /**
   * Finalise le drop et réorganise les éléments
   */
  const handleDrop = (event: DragEvent, dropIndex: number) => {
    event.preventDefault()

    if (draggedIndex.value === null || draggedIndex.value === dropIndex) {
      resetDragState()
      return
    }

    // Réorganiser le tableau
    const newItems = [...items.value]
    const [draggedItem] = newItems.splice(draggedIndex.value, 1)
    newItems.splice(dropIndex, 0, draggedItem)

    // Notifier le changement
    onReorder(newItems)

    resetDragState()
  }

  /**
   * Gère la fin du drag (qu'il y ait eu drop ou non)
   */
  const handleDragEnd = (event: DragEvent) => {
    if (event.target instanceof HTMLElement) {
      event.target.classList.remove('dragging')
    }
    resetDragState()
  }

  /**
   * Reset l'état du drag
   */
  const resetDragState = () => {
    draggedIndex.value = null
    dragOverIndex.value = null
    isDragging.value = false
  }

  /**
   * Vérifie si un index est en train d'être draggé
   */
  const isItemDragged = (index: number): boolean => {
    return draggedIndex.value === index
  }

  /**
   * Vérifie si un index est la cible du drag over
   */
  const isItemDraggedOver = (index: number): boolean => {
    return dragOverIndex.value === index && draggedIndex.value !== index
  }

  return {
    // State
    draggedIndex,
    dragOverIndex,
    isDragging,
    // Handlers
    handleDragStart,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    // Helpers
    isItemDragged,
    isItemDraggedOver
  }
}
