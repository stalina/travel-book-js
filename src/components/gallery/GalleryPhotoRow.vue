<template>
  <article class="photo-row" :class="{ selected }" @click="$emit('toggle-selection')">
    <div class="thumbnail">
      <img :src="photo.objectUrl" :alt="photo.stepName" :style="imageStyle" />
    </div>
    <div class="info">
      <div class="name" :title="photo.file.name">{{ photo.file.name }}</div>
      <div class="meta">
        <span>{{ formattedDate }}</span>
        <span>•</span>
        <span>{{ photo.location }}</span>
        <span>•</span>
        <span>{{ formattedSize }}</span>
      </div>
      <div class="qualities">
        <span v-if="photo.aiFavorite" class="badge ai">⭐ IA</span>
        <span v-if="photo.customFavorite" class="badge user">❤️</span>
        <span
          v-for="insight in photo.qualityInsights"
          :key="insight.message"
          class="badge warn"
        >⚠️ {{ insight.type }}</span>
      </div>
    </div>
    <div class="actions">
      <label class="checkbox" @click.stop>
        <input type="checkbox" :checked="selected" />
      </label>
      <button class="icon" title="Éditer" @click.stop="$emit('open-editor')">✏️</button>
      <button class="icon" title="Favori" @click.stop="$emit('toggle-favorite')">⭐</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { GalleryPhoto } from '../../models/gallery.types'

const props = defineProps({
  photo: {
    type: Object as () => GalleryPhoto,
    required: true
  },
  cssFilter: {
    type: String,
    default: ''
  },
  selected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle-selection', 'open-editor', 'toggle-favorite'])

const formattedDate = computed(() => {
  return new Date(props.photo.stepDate * 1000).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const formattedSize = computed(() => {
  const sizeMb = props.photo.fileSize / (1024 * 1024)
  return `${sizeMb.toFixed(2)} Mo`
})

const imageStyle = computed(() => ({
  filter: props.cssFilter,
  transform: `rotate(${props.photo.rotation}deg)`
}))
</script>

<style scoped>
.photo-row {
  display: grid;
  grid-template-columns: 140px 1fr auto;
  gap: var(--spacing-lg);
  align-items: center;
  padding: var(--spacing-md) var(--spacing-lg);
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 24px rgba(15,15,15,0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.photo-row + .photo-row {
  margin-top: var(--spacing-md);
}

.photo-row:hover {
  transform: translateY(-2px);
}

.photo-row.selected {
  border: 2px solid var(--color-primary, #FF6B6B);
}

.thumbnail {
  width: 140px;
  height: 100px;
  overflow: hidden;
  border-radius: var(--radius-md);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.name {
  font-weight: var(--font-weight-medium, 600);
  font-size: var(--font-size-base, 16px);
  color: var(--color-text-primary, #222);
}

.meta {
  display: flex;
  gap: 8px;
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #666);
}

.qualities {
  display: flex;
  gap: 6px;
  align-items: center;
}

.badge {
  padding: 2px 6px;
  border-radius: 999px;
  font-size: 11px;
}

.badge.ai {
  background: rgba(255, 215, 0, 0.2);
  color: #8a5b00;
}

.badge.user {
  background: rgba(255, 107, 107, 0.2);
  color: #a83232;
}

.badge.warn {
  background: rgba(209, 67, 60, 0.2);
  color: #a83232;
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.checkbox {
  background: rgba(0,0,0,0.05);
  padding: 4px 10px;
  border-radius: 999px;
}

.icon {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(0,0,0,0.08);
  cursor: pointer;
}

@media (max-width: 900px) {
  .photo-row {
    grid-template-columns: 120px 1fr;
    grid-template-rows: auto auto;
  }

  .actions {
    grid-column: span 2;
  }
}
</style>
