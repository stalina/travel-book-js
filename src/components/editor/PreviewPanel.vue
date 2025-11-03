<template>
  <aside class="preview-panel">
    <div class="preview-header">
      <div class="preview-modes">
        <button 
          v-for="mode in modes" 
          :key="mode.id"
          :class="['mode-button', { active: activeMode === mode.id }]"
          :title="mode.label"
          @click="switchMode(mode.id)"
        >
          {{ mode.icon }}
        </button>
      </div>
    </div>
    
    <div class="preview-content" :class="`mode-${activeMode}`">
      <div 
        class="preview-container"
        :style="containerStyles"
      >
        <div 
          class="preview-render"
          v-html="previewContent"
        ></div>
      </div>
    </div>
    
    <div class="preview-stats">
      <div class="stat-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)">
        <div class="stat-value">{{ totalPhotos }}</div>
        <div class="stat-label">Photos</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%)">
        <div class="stat-value">{{ totalSteps }}</div>
        <div class="stat-label">Étapes</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)">
        <div class="stat-value">{{ totalDays }}</div>
        <div class="stat-label">Jours</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)">
        <div class="stat-value">{{ estimatedPages }}</div>
        <div class="stat-label">Pages</div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '../../stores/editor.store'
import { usePreview } from '../../composables/usePreview'

const editorStore = useEditorStore()

const modes = [
  { id: 'mobile' as const, label: 'Mobile', icon: '📱' },
  { id: 'desktop' as const, label: 'Desktop', icon: '💻' },
  { id: 'pdf' as const, label: 'PDF', icon: '📄' }
]

// Utiliser usePreview pour la synchronisation temps réel
const {
  mode: previewMode,
  containerStyles,
  content: previewContent,
  stats: previewStats,
  setMode: setPreviewMode
} = usePreview({
  trip: computed(() => editorStore.currentTrip),
  initialMode: editorStore.previewMode
})

const activeMode = computed(() => editorStore.previewMode)

const switchMode = (mode: 'mobile' | 'desktop' | 'pdf') => {
  editorStore.setPreviewMode(mode)
  setPreviewMode(mode)
}

// Utiliser les stats du composable usePreview (temps réel)
const totalPhotos = computed(() => previewStats.value.photos)
const totalSteps = computed(() => previewStats.value.steps)
const totalDays = computed(() => previewStats.value.days)
const estimatedPages = computed(() => previewStats.value.pages)
</script>

<style scoped>
.preview-panel {
  grid-area: preview;
  background: var(--color-background, #f5f5f5);
  border-left: 1px solid var(--color-border, #e0e0e0);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.preview-header {
  background: white;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  padding: var(--spacing-md, 16px);
}

.preview-modes {
  display: flex;
  gap: var(--spacing-sm, 8px);
  justify-content: center;
}

.mode-button {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md, 8px);
  border: 2px solid var(--color-border, #e0e0e0);
  background: white;
  font-size: var(--font-size-xl, 20px);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mode-button:hover {
  border-color: var(--color-primary, #FF6B6B);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.mode-button.active {
  border-color: var(--color-primary, #FF6B6B);
  background: var(--color-primary, #FF6B6B);
  transform: scale(1.1);
}

.preview-content {
  flex: 1;
  padding: var(--spacing-lg, 24px);
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.preview-container {
  background: white;
  border-radius: var(--radius-md, 8px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  overflow: hidden;
  margin: 0 auto;
}

.preview-render {
  padding: var(--spacing-lg, 24px);
  min-height: 200px;
}

/* Styles pour le contenu de preview */
.preview-render :deep(.empty-preview) {
  text-align: center;
  color: var(--color-text-secondary, #666);
  padding: var(--spacing-xl, 32px);
  font-size: var(--font-size-base, 16px);
}

.preview-render :deep(.trip-title) {
  font-size: var(--font-size-2xl, 24px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-primary, #FF6B6B);
  margin-bottom: var(--spacing-lg, 24px);
  text-align: center;
}

.preview-render :deep(.preview-step) {
  padding: var(--spacing-md, 16px);
  margin-bottom: var(--spacing-sm, 8px);
  border-left: 3px solid var(--color-primary, #FF6B6B);
  background: var(--color-background, #f5f5f5);
  border-radius: var(--radius-sm, 4px);
  display: flex;
  gap: var(--spacing-md, 16px);
  align-items: center;
}

.preview-render :deep(.step-number) {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary, #FF6B6B);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-bold, 700);
  flex-shrink: 0;
}

.preview-render :deep(.step-name) {
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
}

.preview-render :deep(.step-location) {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #666);
  margin: var(--spacing-xs, 4px) 0 0 0;
}

.preview-render :deep(.no-steps) {
  text-align: center;
  color: var(--color-text-secondary, #666);
  padding: var(--spacing-lg, 24px);
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-lg, 24px);
  background: white;
  border-top: 1px solid var(--color-border, #e0e0e0);
}

.stat-card {
  padding: var(--spacing-md, 16px);
  border-radius: var(--radius-lg, 12px);
  color: white;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: var(--font-size-2xl, 24px);
  font-weight: var(--font-weight-bold, 700);
  margin-bottom: var(--spacing-xs, 4px);
}

.stat-label {
  font-size: var(--font-size-sm, 14px);
  opacity: 0.9;
}

@media (max-width: 1200px) {
  .preview-panel {
    display: none;
  }
}
</style>
