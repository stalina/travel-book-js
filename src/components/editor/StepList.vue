<template>
  <div class="step-list">
    <div v-if="!hasSteps" class="empty-state">
      <p>Aucune étape</p>
      <p class="hint">Importez un voyage pour commencer</p>
    </div>
    <StepItem
      v-for="(step, index) in steps"
      :key="step.id"
      :step="step"
      :index="index"
      :is-active="index === currentStepIndex"
      :is-dragged="isItemDragged(index)"
      :is-drag-over="isItemDraggedOver(index)"
      @select="selectStep(index)"
      @dragstart="handleDragStart($event, index)"
      @dragover="handleDragOver($event, index)"
      @dragenter="handleDragEnter($event, index)"
      @dragleave="handleDragLeave($event)"
      @drop="handleDrop($event, index)"
      @dragend="handleDragEnd($event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '../../stores/editor.store'
import { useDragAndDrop } from '../../composables/useDragAndDrop'
import StepItem from './StepItem.vue'

const editorStore = useEditorStore()

const steps = computed(() => editorStore.currentTrip?.steps || [])
const hasSteps = computed(() => steps.value.length > 0)
const currentStepIndex = computed(() => editorStore.currentStepIndex)

// Drag & Drop
const { 
  handleDragStart, 
  handleDragOver, 
  handleDragEnter,
  handleDragLeave,
  handleDrop, 
  handleDragEnd,
  isItemDragged,
  isItemDraggedOver
} = useDragAndDrop(steps, (newOrder) => {
  editorStore.reorderSteps(newOrder)
})

const selectStep = (index: number) => {
  editorStore.setCurrentStep(index)
}
</script>

<style scoped>
.step-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 8px);
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl, 32px) var(--spacing-md, 16px);
  color: var(--color-text-secondary, #666);
}

.empty-state p {
  margin: 0;
}

.empty-state .hint {
  font-size: var(--font-size-sm, 14px);
  margin-top: var(--spacing-xs, 4px);
  opacity: 0.7;
}
</style>
