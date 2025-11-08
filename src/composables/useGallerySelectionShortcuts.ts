import { onBeforeUnmount, onMounted } from 'vue'
import { usePhotoGalleryStore } from '../stores/photo-gallery.store'

const SELECT_ALL_KEY = 'a'

export function useGallerySelectionShortcuts(): void {
  const store = usePhotoGalleryStore()

  const handler = (event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === SELECT_ALL_KEY) {
      event.preventDefault()
      store.selectAll()
      return
    }

    if (event.key === 'Escape') {
      store.clearSelection()
      return
    }
  }

  onMounted(() => window.addEventListener('keydown', handler))
  onBeforeUnmount(() => window.removeEventListener('keydown', handler))
}
