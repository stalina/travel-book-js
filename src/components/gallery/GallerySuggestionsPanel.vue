<template>
  <aside class="suggestions" v-if="suggestions.length">
    <header class="suggestions-header">
      <h2>Suggestions intelligentes</h2>
      <span>{{ subtitle }}</span>
    </header>
    <div class="suggestion-list">
      <article
        v-for="suggestion in suggestions"
        :key="suggestion.id"
        class="suggestion-card"
      >
        <div class="card-head">
          <div>
            <h3>{{ suggestion.title }}</h3>
            <p>{{ suggestion.description }}</p>
          </div>
          <BaseButton variant="ghost" size="sm" @click="$emit('preview', suggestion)">
            Voir détails
          </BaseButton>
        </div>
        <div class="thumbs">
          <div
            v-for="photoId in suggestion.photoIds"
            :key="photoId"
            class="thumb"
          >
            <img :src="photoById(photoId)?.objectUrl" :alt="photoById(photoId)?.stepName" />
          </div>
        </div>
        <footer>
          <small>{{ suggestion.rationale }}</small>
        </footer>
      </article>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '../BaseButton.vue'
import type { GalleryPhoto, LayoutSuggestion } from '../../models/gallery.types'

const props = defineProps({
  suggestions: {
    type: Array as () => LayoutSuggestion[],
    default: () => []
  },
  photos: {
    type: Array as () => GalleryPhoto[],
    default: () => []
  }
})

defineEmits(['preview'])

const photoMap = computed(() => {
  const map = new Map<string, GalleryPhoto>()
  for (const photo of props.photos) {
    map.set(photo.id, photo)
  }
  return map
})

const photoById = (id: string): GalleryPhoto | undefined => photoMap.value.get(id)

const subtitle = computed(() =>
  props.suggestions.length > 1
    ? `${props.suggestions.length} propositions générées` 
    : 'Suggestion personnalisée'
)
</script>

<style scoped>
.suggestions {
  padding: var(--spacing-xl);
  background: rgba(255, 255, 255, 0.6);
  border-radius: var(--radius-xl);
  margin: var(--spacing-xl);
  border: 1px solid rgba(0,0,0,0.05);
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--spacing-lg);
}

.suggestions-header h2 {
  margin: 0;
  font-size: var(--font-size-xl, 20px);
}

.suggestions-header span {
  color: var(--color-text-secondary, #666);
}

.suggestion-list {
  display: grid;
  gap: var(--spacing-lg);
}

.suggestion-card {
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  background: white;
  box-shadow: 0 12px 32px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--spacing-md);
}

.card-head h3 {
  margin: 0;
}

.card-head p {
  margin: 4px 0 0;
  color: var(--color-text-secondary, #555);
  font-size: var(--font-size-sm, 14px);
}

.thumbs {
  display: flex;
  gap: var(--spacing-sm);
}

.thumb {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #111;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

footer {
  font-size: 12px;
  color: var(--color-text-secondary, #666);
}
</style>
