<template>
  <div class="gallery-view" v-if="ready">
    <GalleryHeader
      :stats="stats"
      :view-mode="viewMode"
      :can-restore="canRestoreRemoval"
      @back="goBack"
      @change-view-mode="changeViewMode"
      @restore="galleryStore.restoreLastRemoval"
    />

    <GalleryFilters />

    <GallerySuggestionsPanel
      v-if="suggestions.length"
      :suggestions="suggestions"
      :photos="photos"
      @preview="onSuggestionPreview"
    />

    <GalleryResults
      :photos="filteredPhotos"
      :view-mode="viewMode"
      :selection="selection"
      :css-preview="cssPreview"
      @toggle-selection="galleryStore.toggleSelection"
      @open-editor="galleryStore.setEditorPhoto"
      @toggle-favorite="galleryStore.toggleFavorite"
    />

    <GallerySelectionBar
      :count="selection.size"
      :total-size="selectionSize"
      @favorite="galleryStore.markSelectionAsFavorite"
      @download="galleryStore.downloadSelection"
      @delete="galleryStore.deleteSelection"
      @clear="galleryStore.clearSelection"
    />

    <PhotoEditorModal
      v-if="editorPhoto"
      :photo="editorPhoto"
      @close="() => galleryStore.setEditorPhoto(null)"
    />
  </div>
  <div v-else class="missing-data">
    <p>Aucun voyage chargé. Importez un export Polarsteps pour accéder à la galerie.</p>
    <BaseButton variant="primary" @click="router.push('/home')">Importer un voyage</BaseButton>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseButton from '../components/BaseButton.vue'
import GalleryHeader from '../components/gallery/GalleryHeader.vue'
import GalleryFilters from '../components/gallery/GalleryFilters.vue'
import GalleryResults from '../components/gallery/GalleryResults.vue'
import GallerySelectionBar from '../components/gallery/GallerySelectionBar.vue'
import GallerySuggestionsPanel from '../components/gallery/GallerySuggestionsPanel.vue'
import PhotoEditorModal from '../components/gallery/PhotoEditorModal.vue'
import { usePhotoGalleryStore } from '../stores/photo-gallery.store'
import { useTripStore } from '../stores/trip.store'
import { useGallerySelectionShortcuts } from '../composables/useGallerySelectionShortcuts'
import type { LayoutSuggestion } from '../models/gallery.types'

const router = useRouter()
const tripStore = useTripStore()
const galleryStore = usePhotoGalleryStore()

const {
  photos,
  filteredPhotos,
  selection,
  stats,
  suggestions,
  viewMode,
  cssPreview,
  editorPhoto,
  canRestoreRemoval,
  initialized
} = storeToRefs(galleryStore)

const ready = computed(() => initialized.value || !!tripStore.parsedTrip)

const selectionSize = computed(() => {
  let total = 0
  for (const photo of photos.value) {
    if (selection.value.has(photo.id)) {
      total += photo.fileSize
    }
  }
  return total
})

const changeViewMode = (mode: string) => {
  if (mode === 'grid' || mode === 'compact' || mode === 'list') {
    galleryStore.setViewMode(mode)
  }
}

const goBack = () => {
  router.push('/editor')
}

const onSuggestionPreview = (suggestion: LayoutSuggestion) => {
  galleryStore.setSelection(suggestion.photoIds)
}

useGallerySelectionShortcuts()

onMounted(async () => {
  if (!tripStore.parsedTrip) {
    router.replace('/home')
    return
  }

  const parsed = (window as any).__parsedTrip as { trip: typeof tripStore.parsedTrip; stepPhotos: Record<number, File[]> } | undefined
  if (!parsed?.stepPhotos) {
    return
  }

  if (!initialized.value || !photos.value.length) {
    await galleryStore.initialize({
      trip: tripStore.parsedTrip!,
      stepPhotos: parsed.stepPhotos
    })
  }
})
</script>

<style scoped>
.gallery-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #f1f5f9 0%, #ffffff 50%, #f9fafb 100%);
}

.missing-data {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-md);
  color: var(--color-text-secondary, #555);
}
</style>
