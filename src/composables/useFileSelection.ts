import { ref } from 'vue'
import { useTripStore } from '../stores/trip.store'

/**
 * Composable pour la gestion de la sélection de fichiers/dossiers
 * Encapsule la logique de sélection, drag & drop et File System Access API
 */
export function useFileSelection() {
  const store = useTripStore()
  const fileInput = ref<HTMLInputElement | null>(null)

  /**
   * Ouvre le sélecteur de dossier (File System Access API ou fallback)
   */
  function pickDirectory() {
    if ('showDirectoryPicker' in window) {
      store.pickDirectory()
    } else {
      fileInput.value?.click()
    }
  }

  /**
   * Gère la sélection de fichiers via input file
   */
  function onFilesPicked(e: Event) {
    const input = e.target as HTMLInputElement
    if (input.files) {
      store.setFiles(input.files)
    }
  }

  /**
   * Gère le drop de fichiers/dossiers
   */
  function onDrop(e: DragEvent) {
    const items = e.dataTransfer?.items
    if (!items) return
    store.handleDropItems(items)
  }

  return {
    fileInput,
    pickDirectory,
    onFilesPicked,
    onDrop
  }
}
