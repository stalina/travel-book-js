<template>
  <div class="photo-grid">
    <div
      v-for="(photo, index) in photos"
      :key="index"
      class="photo-item"
      @mouseenter="hoveredIndex = index"
      @mouseleave="hoveredIndex = null"
    >
      <img :src="photo.url" :alt="photo.alt || `Photo ${index + 1}`" class="photo-img" />
      <div v-if="hoveredIndex === index" class="photo-overlay">
        <button class="photo-action" title="Éditer" @click="$emit('edit', index)">
          ✏️
        </button>
        <button class="photo-action" title="Réorganiser" @click="$emit('reorder', index)">
          ↕️
        </button>
        <button class="photo-action" title="Supprimer" @click="$emit('delete', index)">
          🗑️
        </button>
      </div>
    </div>

    <div class="photo-add" @click="$emit('add')">
      <div class="add-icon">+</div>
      <div class="add-text">Ajouter une photo</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Photo {
  url: string
  alt?: string
}

interface Props {
  photos: Photo[]
}

defineProps<Props>()

defineEmits<{
  add: []
  edit: [index: number]
  reorder: [index: number]
  delete: [index: number]
}>()

const hoveredIndex = ref<number | null>(null)
</script>

<style scoped>
.photo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md, 16px);
  margin-bottom: var(--spacing-xl, 32px);
}

.photo-item {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
}

.photo-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm, 8px);
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.photo-action {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: white;
  font-size: var(--font-size-lg, 18px);
  cursor: pointer;
  transition: transform 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-action:hover {
  transform: scale(1.1);
}

.photo-add {
  aspect-ratio: 4 / 3;
  border: 2px dashed var(--color-border, #e0e0e0);
  border-radius: var(--radius-lg, 12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm, 8px);
  cursor: pointer;
  transition: all 0.2s;
  background: var(--color-background, #f5f5f5);
}

.photo-add:hover {
  border-color: var(--color-primary, #FF6B6B);
  background: white;
  transform: scale(1.02);
}

.add-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-primary, #FF6B6B);
  color: white;
  font-size: var(--font-size-3xl, 30px);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold, 700);
}

.add-text {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #666);
  font-weight: var(--font-weight-medium, 500);
}

@media (max-width: 768px) {
  .photo-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>
