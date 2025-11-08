import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import JSZip from 'jszip'
import type {
  GalleryFilters,
  GalleryInitializationPayload,
  GalleryPhoto,
  LayoutSuggestion,
  PhotoAdjustments,
  PhotoFilterPreset
} from '../models/gallery.types'
import { photoMetadataService } from '../services/photo-metadata.service'
import { generateLayoutSuggestions } from '../utils/gallery-suggestions'
import { buildCssFilter, clampAdjustment } from '../utils/photo-filters'

export type GalleryViewMode = 'grid' | 'compact' | 'list'

interface PhotoEditSnapshot {
  filterPreset: PhotoFilterPreset
  adjustments: PhotoAdjustments
  rotation: number
  crop: GalleryPhoto['crop']
}

interface PhotoEditHistory {
  past: PhotoEditSnapshot[]
  future: PhotoEditSnapshot[]
}

const createDefaultFilters = (): GalleryFilters => ({
  search: '',
  locations: [],
  tags: [],
  startDate: null,
  endDate: null,
  sortBy: 'date',
  sortDirection: 'desc'
})

const toSnapshot = (photo: GalleryPhoto): PhotoEditSnapshot => ({
  filterPreset: photo.filterPreset,
  adjustments: { ...photo.adjustments },
  rotation: photo.rotation,
  crop: { ...photo.crop }
})

const applySnapshot = (photo: GalleryPhoto, snapshot: PhotoEditSnapshot): void => {
  photo.filterPreset = snapshot.filterPreset
  photo.adjustments = { ...snapshot.adjustments }
  photo.rotation = snapshot.rotation
  photo.crop = { ...snapshot.crop }
}

export const usePhotoGalleryStore = defineStore('photoGallery', () => {
  const photos = ref<GalleryPhoto[]>([])
  const initialized = ref(false)
  const filters = ref<GalleryFilters>(createDefaultFilters())
  const viewMode = ref<GalleryViewMode>('grid')
  const selection = ref<Set<string>>(new Set())
  const histories = reactive<Record<string, PhotoEditHistory>>({})
  const hiddenHistory = ref<string[][]>([])
  const suggestions = ref<LayoutSuggestion[]>([])
  const editorPhotoId = ref<string | null>(null)

  const availableLocations = computed(() => {
    const set = new Set<string>()
    for (const photo of photos.value) {
      if (!photo.hidden && photo.location) {
        set.add(photo.location)
      }
    }
    return Array.from(set).sort()
  })

  const availableTags = computed(() => {
    const set = new Set<string>()
    for (const photo of photos.value) {
      if (!photo.hidden) {
        for (const tag of photo.tags) {
          set.add(tag)
        }
      }
    }
    return Array.from(set).sort()
  })

  const filteredPhotos = computed(() => {
    const { search, locations, tags, startDate, endDate, sortBy, sortDirection } = filters.value
    const searchLower = search.trim().toLowerCase()
    const start = startDate ? new Date(startDate).getTime() : null
    const end = endDate ? new Date(endDate).getTime() : null

    const filtered = photos.value.filter(photo => {
      if (photo.hidden) {
        return false
      }

      if (searchLower) {
        const haystack = `${photo.stepName} ${photo.location} ${photo.file.name}`.toLowerCase()
        if (!haystack.includes(searchLower)) {
          return false
        }
      }

      if (locations.length && !locations.includes(photo.location)) {
        return false
      }

      if (tags.length) {
        const hasAll = tags.every(tag => photo.tags.includes(tag))
        if (!hasAll) {
          return false
        }
      }

      if (start || end) {
        const dateMs = photo.stepDate * 1000
        if (start && dateMs < start) {
          return false
        }
        if (end && dateMs > end) {
          return false
        }
      }

      return true
    })

    const sorted = filtered.sort((a, b) => {
      let compare = 0
      switch (sortBy) {
        case 'name':
          compare = a.file.name.localeCompare(b.file.name)
          break
        case 'size':
          compare = a.fileSize - b.fileSize
          break
        case 'score':
          compare = a.aiFavoriteScore - b.aiFavoriteScore
          break
        case 'date':
        default:
          compare = a.stepDate - b.stepDate
          break
      }

      return sortDirection === 'asc' ? compare : -compare
    })

    return sorted
  })

  const selectedPhotos = computed(() => {
    const ids = selection.value
    return photos.value.filter(photo => ids.has(photo.id))
  })

  const stats = computed(() => {
    const total = photos.value.length
    const visible = filteredPhotos.value.length
    const selected = selection.value.size
    const aiFavorites = photos.value.filter(photo => photo.aiFavorite).length
    const customFavorites = photos.value.filter(photo => photo.customFavorite).length
    const warnings = photos.value.filter(photo => photo.qualityInsights.length > 0).length

    return {
      total,
      visible,
      selected,
      aiFavorites,
      customFavorites,
      warnings
    }
  })

  const cssPreview = computed(() => {
    const map = new Map<string, string>()
    for (const photo of photos.value) {
      map.set(photo.id, buildCssFilter(photo.adjustments, photo.filterPreset))
    }
    return map
  })

  const hasActiveFilters = computed(() => {
    const current = filters.value
    return Boolean(
      current.search ||
      current.locations.length ||
      current.tags.length ||
      current.startDate ||
      current.endDate ||
      current.sortBy !== 'date' ||
      current.sortDirection !== 'desc'
    )
  })

  const canRestoreRemoval = computed(() => hiddenHistory.value.length > 0)

  const editorPhoto = computed(() => {
    if (!editorPhotoId.value) {
      return null
    }
    return photos.value.find(photo => photo.id === editorPhotoId.value) ?? null
  })

  const initialize = async (payload: GalleryInitializationPayload): Promise<void> => {
    if (initialized.value) {
      photoMetadataService.cleanup(photos.value)
    }

    const dataset = await photoMetadataService.buildGalleryPhotos(payload)
    photos.value = dataset
    filters.value = createDefaultFilters()
    selection.value = new Set()
    hiddenHistory.value = []
    Object.keys(histories).forEach(key => delete histories[key])
    suggestions.value = generateLayoutSuggestions(photos.value, selection.value)
    initialized.value = true
  }

  const dispose = (): void => {
    photoMetadataService.cleanup(photos.value)
    photos.value = []
    selection.value = new Set()
    filters.value = createDefaultFilters()
    suggestions.value = []
    editorPhotoId.value = null
    Object.keys(histories).forEach(key => delete histories[key])
    initialized.value = false
  }

  const setViewMode = (mode: GalleryViewMode): void => {
    viewMode.value = mode
  }

  const setFilters = (next: Partial<GalleryFilters>): void => {
    filters.value = {
      ...filters.value,
      ...next
    }
  }

  const resetFilters = (): void => {
    filters.value = createDefaultFilters()
  }

  const toggleSelection = (photoId: string): void => {
    const current = new Set(selection.value)
    if (current.has(photoId)) {
      current.delete(photoId)
    } else {
      current.add(photoId)
    }
    selection.value = current
    suggestions.value = generateLayoutSuggestions(photos.value, selection.value)
  }

  const clearSelection = (): void => {
    selection.value = new Set()
    suggestions.value = generateLayoutSuggestions(photos.value, selection.value)
  }

  const selectAll = (): void => {
    const ids = new Set<string>()
    for (const photo of filteredPhotos.value) {
      ids.add(photo.id)
    }
    selection.value = ids
    suggestions.value = generateLayoutSuggestions(photos.value, selection.value)
  }

  const setSelection = (ids: string[]): void => {
    selection.value = new Set(ids)
    suggestions.value = generateLayoutSuggestions(photos.value, selection.value)
  }

  const toggleFavorite = (photoId: string): void => {
    const photo = photos.value.find(item => item.id === photoId)
    if (!photo) {
      return
    }
    photo.customFavorite = !photo.customFavorite
    suggestions.value = generateLayoutSuggestions(photos.value, selection.value)
  }

  const markSelectionAsFavorite = (): void => {
    for (const photo of selectedPhotos.value) {
      photo.customFavorite = true
    }
    suggestions.value = generateLayoutSuggestions(photos.value, selection.value)
  }

  const deleteSelection = (): void => {
    if (!selection.value.size) {
      return
    }
    const removed: string[] = []
    for (const photo of photos.value) {
      if (selection.value.has(photo.id)) {
        photo.hidden = true
        removed.push(photo.id)
      }
    }
    if (removed.length) {
      hiddenHistory.value = [...hiddenHistory.value, removed]
    }
    clearSelection()
  }

  const restoreLastRemoval = (): void => {
    const history = hiddenHistory.value
    const last = history[history.length - 1]
    if (!last) {
      return
    }
    for (const photoId of last) {
      const photo = photos.value.find(item => item.id === photoId)
      if (photo) {
        photo.hidden = false
      }
    }
    hiddenHistory.value = history.slice(0, -1)
    suggestions.value = generateLayoutSuggestions(photos.value, selection.value)
  }

  const downloadSelection = async (): Promise<void> => {
    if (typeof document === 'undefined' || !selection.value.size) {
      return
    }

    const zip = new JSZip()
    for (const photo of selectedPhotos.value) {
      zip.file(photo.file.name, photo.file)
    }

    const blob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `travel-book-photos-${new Date().toISOString().slice(0, 10)}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const ensureHistory = (photoId: string): PhotoEditHistory => {
    if (!histories[photoId]) {
      histories[photoId] = { past: [], future: [] }
    }
    return histories[photoId]
  }

  const applyAdjustments = (photoId: string, payload: Partial<PhotoEditSnapshot>): void => {
    const photo = photos.value.find(item => item.id === photoId)
    if (!photo) {
      return
    }

    const history = ensureHistory(photoId)
    history.past.push(toSnapshot(photo))
    history.future = []

    if (payload.filterPreset) {
      photo.filterPreset = payload.filterPreset
    }

    if (payload.adjustments) {
      photo.adjustments = {
        brightness: clampAdjustment(payload.adjustments.brightness ?? photo.adjustments.brightness),
        contrast: clampAdjustment(payload.adjustments.contrast ?? photo.adjustments.contrast),
        saturation: clampAdjustment(payload.adjustments.saturation ?? photo.adjustments.saturation),
        warmth: clampAdjustment(payload.adjustments.warmth ?? photo.adjustments.warmth)
      }
    }

    if (payload.rotation !== undefined) {
      photo.rotation = payload.rotation
    }

    if (payload.crop) {
      photo.crop = { ...payload.crop }
    }
  }

  const undoAdjustments = (photoId: string): void => {
    const photo = photos.value.find(item => item.id === photoId)
    if (!photo) {
      return
    }

    const history = ensureHistory(photoId)
    const previous = history.past.pop()
    if (!previous) {
      return
    }

    history.future.unshift(toSnapshot(photo))
    applySnapshot(photo, previous)
  }

  const redoAdjustments = (photoId: string): void => {
    const photo = photos.value.find(item => item.id === photoId)
    if (!photo) {
      return
    }

    const history = ensureHistory(photoId)
    const next = history.future.shift()
    if (!next) {
      return
    }

    history.past.push(toSnapshot(photo))
    applySnapshot(photo, next)
  }

  const setEditorPhoto = (photoId: string | null): void => {
    editorPhotoId.value = photoId
  }

  return {
    photos,
    filters,
    viewMode,
    selection,
    suggestions,
    editorPhotoId,
    editorPhoto,
    stats,
    filteredPhotos,
    selectedPhotos,
    availableLocations,
    availableTags,
    cssPreview,
    hasActiveFilters,
    canRestoreRemoval,
    initialized,
    initialize,
    dispose,
    setViewMode,
    setFilters,
    resetFilters,
    toggleSelection,
    clearSelection,
    selectAll,
    setSelection,
    toggleFavorite,
    markSelectionAsFavorite,
    deleteSelection,
    restoreLastRemoval,
    downloadSelection,
    applyAdjustments,
    undoAdjustments,
    redoAdjustments,
    setEditorPhoto
  }
})
