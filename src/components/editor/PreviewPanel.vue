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
      <div class="preview-placeholder">
        <p v-if="!hasTrip">Aucun voyage chargé</p>
        <p v-else>Preview {{ activeMode }}</p>
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

const editorStore = useEditorStore()

const modes = [
  { id: 'mobile' as const, label: 'Mobile', icon: '📱' },
  { id: 'desktop' as const, label: 'Desktop', icon: '💻' },
  { id: 'pdf' as const, label: 'PDF', icon: '📄' }
]

const activeMode = computed(() => editorStore.previewMode)

const switchMode = (mode: 'mobile' | 'desktop' | 'pdf') => {
  editorStore.setPreviewMode(mode)
}

const hasTrip = computed(() => !!editorStore.currentTrip)
const totalPhotos = computed(() => editorStore.totalPhotos)
const totalSteps = computed(() => editorStore.totalSteps)
const totalDays = computed(() => editorStore.totalDays)
const estimatedPages = computed(() => editorStore.estimatedPages)
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
  align-items: center;
  justify-content: center;
}

.preview-placeholder {
  text-align: center;
  color: var(--color-text-secondary, #666);
  font-size: var(--font-size-base, 16px);
}

.preview-content.mode-mobile {
  max-width: 375px;
  margin: 0 auto;
}

.preview-content.mode-desktop {
  max-width: 100%;
}

.preview-content.mode-pdf {
  max-width: 210mm; /* A4 width */
  margin: 0 auto;
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
