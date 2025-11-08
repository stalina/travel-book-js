import { computed, ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { EditorStepPhoto, PhotoRatio } from '../models/editor.types'

type RatioFilter = 'all' | PhotoRatio

const normalize = (value: string): string => value.trim().toLowerCase()

export interface UsePhotoLibraryFilter {
  query: Ref<string>
  ratio: Ref<RatioFilter>
  filteredPhotos: Ref<EditorStepPhoto[]>
  setRatio: (next: RatioFilter) => void
  hasResults: Ref<boolean>
}

export const usePhotoLibrary = (photos: Ref<EditorStepPhoto[]>): UsePhotoLibraryFilter => {
  const query = ref('')
  const ratio = ref<RatioFilter>('all')

  const filteredPhotos = computed(() => {
    const normalizedQuery = normalize(query.value)
    const ratioFilter = ratio.value

    return photos.value.filter((photo) => {
      if (ratioFilter !== 'all' && photo.ratio !== ratioFilter) {
        return false
      }
      if (!normalizedQuery) {
        return true
      }
      const haystacks = [photo.name, `#${photo.index}`, photo.id]
      return haystacks.some((entry) => normalize(entry ?? '').includes(normalizedQuery))
    })
  })

  const hasResults = computed(() => filteredPhotos.value.length > 0)

  const setRatio = (next: RatioFilter) => {
    ratio.value = next
  }

  // Reset ratio when there are no photos matching the current ratio selection to avoid empty panel states when new photos arrive.
  watch(photos, (latest) => {
    if (!latest.length) return
    if (ratio.value === 'all') return
    if (!latest.some((photo) => photo.ratio === ratio.value)) {
      ratio.value = 'all'
    }
  })

  return {
    query,
    ratio,
    filteredPhotos,
    setRatio,
    hasResults
  }
}
