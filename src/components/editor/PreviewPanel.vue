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
        <div v-if="isGenerating" class="preview-overlay">
          <span class="overlay-spinner"></span>
          <p>Génération en cours…</p>
        </div>
        <iframe
          v-else
          class="preview-frame"
          :style="frameStyles"
          :srcdoc="previewContent"
          title="Prévisualisation du travel book"
        ></iframe>
      </div>
    </div>

    <div class="preview-status">
      <p :class="['status-message', `type-${previewStatus.type}`]">
        {{ previewStatus.message }}
      </p>
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
  containerStyles,
  content: previewContent,
  stats: previewStats,
  setMode: setPreviewMode,
  dimensions
} = usePreview({
  trip: computed(() => editorStore.currentTrip),
  generatedHtml: computed(() => editorStore.previewHtml),
  initialMode: editorStore.previewMode
})

const activeMode = computed(() => editorStore.previewMode)

const switchMode = (mode: 'mobile' | 'desktop' | 'pdf') => {
  editorStore.setPreviewMode(mode)
  setPreviewMode(mode)
}

const frameStyles = computed(() => ({
  width: `${dimensions.value.width}px`,
  height: `${dimensions.value.height}px`,
  border: 'none',
  background: 'white'
}))

const isGenerating = computed(() => editorStore.isPreviewLoading)

const previewStatus = computed(() => {
  if (editorStore.previewError) {
    return {
      type: 'error' as const,
      message: editorStore.previewError
    }
  }

  if (editorStore.previewUpdatedAt) {
    const formatted = editorStore.previewUpdatedAt.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    if (editorStore.isPreviewStale) {
      return {
        type: 'warning' as const,
        message: `Aperçu généré le ${formatted}. Modifications en attente d'une nouvelle génération.`
      }
    }

    return {
      type: 'success' as const,
      message: `Aperçu généré le ${formatted}.`
    }
  }

  return {
    type: 'hint' as const,
    message: 'Cliquez sur « Prévisualiser » pour générer un premier rendu.'
  }
})

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

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: var(--radius-md, 8px);
  background: white;
}

.preview-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md, 16px);
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  border-radius: var(--radius-md, 8px);
  color: var(--color-text-primary, #333);
  font-weight: var(--font-weight-medium, 500);
}

.overlay-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--color-primary, #FF6B6B);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.preview-status {
  padding: 0 var(--spacing-lg, 24px) var(--spacing-lg, 24px);
  background: white;
  border-top: 1px solid var(--color-border, #e0e0e0);
}

.status-message {
  margin: 0;
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #666);
}

.status-message.type-success {
  color: #2a9d4b;
}

.status-message.type-warning {
  color: #e9a700;
}

.status-message.type-error {
  color: #d1433c;
}

.status-message.type-hint {
  color: var(--color-text-secondary, #666);
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
