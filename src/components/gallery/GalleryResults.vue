<template>
  <section class="gallery-results" :data-view="viewMode">
    <p v-if="!photos.length" class="empty-state">
      Aucune photo ne correspond à vos filtres.
    </p>

    <div v-if="viewMode !== 'list'" class="results-grid">
      <GalleryPhotoCard
        v-for="photo in photos"
        :key="photo.id"
        :photo="photo"
        :css-filter="cssFilter(photo.id)"
        :selected="selection.has(photo.id)"
        :variant="viewMode === 'compact' ? 'compact' : 'grid'"
        @toggle-selection="$emit('toggle-selection', photo.id)"
        @open-editor="$emit('open-editor', photo.id)"
        @toggle-favorite="$emit('toggle-favorite', photo.id)"
      />
    </div>

    <div v-else class="results-list">
      <GalleryPhotoRow
        v-for="photo in photos"
        :key="photo.id"
        :photo="photo"
        :css-filter="cssFilter(photo.id)"
        :selected="selection.has(photo.id)"
        @toggle-selection="$emit('toggle-selection', photo.id)"
        @open-editor="$emit('open-editor', photo.id)"
        @toggle-favorite="$emit('toggle-favorite', photo.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { GalleryPhoto } from '../../models/gallery.types'
import type { GalleryViewMode } from '../../stores/photo-gallery.store'
import GalleryPhotoCard from './GalleryPhotoCard.vue'
import GalleryPhotoRow from './GalleryPhotoRow.vue'

const props = defineProps({
  photos: {
    type: Array as () => GalleryPhoto[],
    required: true
  },
  viewMode: {
    type: String as () => GalleryViewMode,
    required: true
  },
  selection: {
    type: Object as () => Set<string>,
    required: true
  },
  cssPreview: {
    type: Object as () => Map<string, string>,
    required: true
  }
})

defineEmits(['toggle-selection', 'open-editor', 'toggle-favorite'])

const cssFilter = (id: string): string => props.cssPreview.get(id) ?? ''
</script>

<style scoped>
.gallery-results {
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--spacing-xl);
}

.gallery-results[data-view='compact'] .results-grid {
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
}

.results-list {
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: var(--spacing-xxl);
  text-align: center;
  color: var(--color-text-secondary, #777);
  background: rgba(255,255,255,0.6);
  border-radius: var(--radius-lg);
  border: 1px dashed rgba(0,0,0,0.1);
}
</style>
