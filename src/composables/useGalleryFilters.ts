import { computed } from 'vue'
import type { GalleryFilters } from '../models/gallery.types'
import { usePhotoGalleryStore } from '../stores/photo-gallery.store'

export function useGalleryFilters() {
  const store = usePhotoGalleryStore()

  const filters = computed(() => store.filters)

  const locationOptions = computed(() =>
    store.availableLocations.map(location => ({ label: location, value: location }))
  )

  const tagOptions = computed(() =>
    store.availableTags.map(tag => ({ label: tag.split(':').pop() ?? tag, value: tag }))
  )

  const updateFilter = <K extends keyof GalleryFilters>(key: K, value: GalleryFilters[K]): void => {
    store.setFilters({ [key]: value } as Partial<GalleryFilters>)
  }

  const reset = (): void => {
    store.resetFilters()
  }

  return {
    filters,
    locationOptions,
    tagOptions,
    hasActiveFilters: store.hasActiveFilters,
    updateFilter,
    reset
  }
}
