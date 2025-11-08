<template>
  <article
    class="photo-card"
    :class="[{ selected }, variant]"
    @click="$emit('toggle-selection')"
  >
    <div class="thumb" :style="thumbStyle">
      <img
        :src="photo.objectUrl"
        :alt="photo.stepName"
        :style="imageStyle"
      />
      <div class="badges">
        <span v-if="photo.aiFavorite" class="badge ai">⭐ Coup de cœur IA</span>
        <span v-if="photo.customFavorite" class="badge user">❤️ Favori</span>
        <span
          v-for="insight in photo.qualityInsights"
          :key="insight.message"
          class="badge warning"
        >⚠️ {{ insight.message }}</span>
      </div>
      <div class="palette" v-if="photo.palette.length">
        <span v-for="color in photo.palette" :key="color" :style="{ background: color }"></span>
      </div>
      <div class="overlay">
        <label class="checkbox" @click.stop>
          <input type="checkbox" :checked="selected" />
        </label>
        <div class="overlay-actions">
          <button class="icon" title="Éditer" @click.stop="$emit('open-editor')">✏️</button>
          <button class="icon" title="Basculer favori" @click.stop="$emit('toggle-favorite')">⭐</button>
        </div>
      </div>
    </div>
    <footer class="meta">
      <div class="title" :title="photo.file.name">{{ photo.file.name }}</div>
      <div class="details">
        <span>{{ formattedDate }}</span>
        <span>•</span>
        <span>{{ photo.location }}</span>
        <span>•</span>
        <span>{{ formattedSize }}</span>
      </div>
      <div class="tags">
        <span v-for="tag in displayTags" :key="tag" class="tag">#{{ tag }}</span>
      </div>
    </footer>
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
  },
  variant: {
    type: String as () => 'grid' | 'compact',
    default: 'grid'
  }
})

defineEmits(['toggle-selection', 'open-editor', 'toggle-favorite'])

const formattedDate = computed(() => {
  return new Date(props.photo.stepDate * 1000).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
})

const formattedSize = computed(() => {
  const sizeMb = props.photo.fileSize / (1024 * 1024)
  return `${sizeMb.toFixed(2)} Mo`
})

const displayTags = computed(() => props.photo.tags.slice(0, 3).map(tag => tag.split(':').pop() ?? tag))

const aspectRatio = computed(() => {
  if (props.photo.crop.ratio === 'original') {
    return props.photo.width / props.photo.height
  }
  if (props.photo.crop.ratio === '16:9') return 16 / 9
  if (props.photo.crop.ratio === '4:3') return 4 / 3
  if (props.photo.crop.ratio === '1:1') return 1
  if (props.photo.crop.ratio === '9:16') return 9 / 16
  return props.photo.width / props.photo.height
})

const thumbStyle = computed(() => ({
  aspectRatio: aspectRatio.value.toFixed(3)
}))

const imageStyle = computed(() => ({
  filter: props.cssFilter,
  transform: `scale(${props.photo.crop.zoom}) translate(${props.photo.crop.offsetX}%, ${props.photo.crop.offsetY}%) rotate(${props.photo.rotation}deg)`,
  transformOrigin: 'center'
}))
</script>

<style scoped>
.photo-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
}

.photo-card.compact {
  flex-direction: row;
  align-items: stretch;
}

.photo-card.selected {
  box-shadow: 0 0 0 3px var(--color-primary, #FF6B6B), 0 8px 24px rgba(255, 107, 107, 0.4);
}

.photo-card:hover {
  transform: translateY(-4px);
}

.thumb {
  position: relative;
  background: #111;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.photo-card:hover .thumb img {
  transform: scale(1.02);
}

.badges {
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.badge {
  backdrop-filter: blur(6px);
  background: rgba(0,0,0,0.45);
  color: white;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
}

.badge.ai {
  background: linear-gradient(90deg, #FFD700, #FF8A00);
  color: #2f1a00;
}

.badge.user {
  background: rgba(255, 107, 107, 0.9);
}

.badge.warning {
  background: rgba(209, 67, 60, 0.85);
}

.palette {
  position: absolute;
  right: 8px;
  top: 8px;
  display: flex;
  gap: 4px;
}

.palette span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.2);
}

.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-sm);
  pointer-events: none;
}

.checkbox {
  pointer-events: auto;
  background: rgba(255,255,255,0.9);
  padding: 4px 10px;
  border-radius: 999px;
}

.checkbox input {
  width: 16px;
  height: 16px;
}

.overlay-actions {
  pointer-events: auto;
  display: flex;
  gap: var(--spacing-sm);
}

.overlay-actions .icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.6);
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.overlay-actions .icon:hover {
  transform: scale(1.1);
}

.meta {
  padding: 0 var(--spacing-md) var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.title {
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-primary, #222);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text-secondary, #666);
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  background: rgba(0,0,0,0.05);
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 11px;
}

.photo-card.compact .thumb {
  flex: 0 0 160px;
}

.photo-card.compact .meta {
  padding: var(--spacing-md);
}
</style>
