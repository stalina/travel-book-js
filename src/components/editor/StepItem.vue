<template>
  <div 
    :class="['step-item', { 
      active: isActive, 
      dragging: isDragged,
      'drag-over': isDragOver
    }]"
    draggable="true"
    @click="$emit('select')"
    @dragstart="$emit('dragstart', $event)"
    @dragover="$emit('dragover', $event)"
    @dragenter="$emit('dragenter', $event)"
    @dragleave="$emit('dragleave', $event)"
    @drop="$emit('drop', $event)"
    @dragend="$emit('dragend', $event)"
  >
    <div class="drag-handle">⋮⋮</div>
    <div class="step-content">
      <div class="step-header">
        <span class="step-number">{{ index + 1 }}</span>
        <span class="step-name">{{ step.name }}</span>
      </div>
      <div class="step-meta">
        <span class="meta-item">
          <span class="meta-icon">🌍</span>
          {{ step.city || step.country }}
        </span>
        <span class="meta-item">
          <span class="meta-icon">📅</span>
          {{ formattedDate }}
        </span>
        <span v-if="photosCount" class="meta-item">
          <span class="meta-icon">📷</span>
          {{ photosCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Step } from '../../models/types'

interface Props {
  step: Step
  index: number
  isActive: boolean
  isDragged?: boolean
  isDragOver?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isDragged: false,
  isDragOver: false
})

defineEmits<{
  select: []
  dragstart: [event: DragEvent]
  dragover: [event: DragEvent]
  dragenter: [event: DragEvent]
  dragleave: [event: DragEvent]
  drop: [event: DragEvent]
  dragend: [event: DragEvent]
}>()

const formattedDate = computed(() => {
  if (!props.step.start_time) return ''
  const date = new Date(props.step.start_time * 1000)
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
})

// TODO: photosCount sera calculé depuis photosMapping dans une version future
const photosCount = computed(() => 0)
</script>

<style scoped>
.step-item {
  display: flex;
  align-items: stretch;
  background: white;
  border-radius: var(--radius-md, 8px);
  border: 2px solid var(--color-border, #e0e0e0);
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.step-item:hover {
  border-color: var(--color-primary, #FF6B6B);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.step-item.active {
  border-color: var(--color-primary, #FF6B6B);
  background: linear-gradient(to right, #fff5f5, white);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.2);
}

/* Drag & Drop styles */
.step-item.dragging {
  opacity: 0.5;
  transform: rotate(2deg) scale(0.98);
  cursor: grabbing;
  box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}

.step-item.drag-over {
  border-color: var(--color-secondary, #4ECDC4);
  background: linear-gradient(to right, #f0fffe, white);
  border-style: dashed;
  transform: translateY(-4px);
}

.step-item.dragging .drag-handle {
  cursor: grabbing;
}

.drag-handle {
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-sm, 8px);
  background: var(--color-background, #f5f5f5);
  color: var(--color-text-secondary, #666);
  font-size: var(--font-size-xs, 12px);
  cursor: grab;
  user-select: none;
  border-right: 1px solid var(--color-border, #e0e0e0);
}

.drag-handle:active {
  cursor: grabbing;
}

.step-content {
  flex: 1;
  padding: var(--spacing-md, 16px);
}

.step-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  margin-bottom: var(--spacing-xs, 4px);
}

.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-primary, #FF6B6B);
  color: white;
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-bold, 700);
}

.step-name {
  font-size: var(--font-size-base, 16px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-primary, #333);
}

.step-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md, 16px);
  margin-top: var(--spacing-sm, 8px);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #666);
}

.meta-icon {
  font-size: var(--font-size-sm, 14px);
}
</style>
