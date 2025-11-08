<template>
  <div>
    <!-- When collapsed show only a small fixed toggle button. All preview UI is hidden to let editor take full width. -->
    <button
      v-if="!expanded"
      class="preview-toggle"
      aria-label="Ouvrir la prévisualisation"
      @click="openPanel"
    >
      👁️
    </button>

    <div v-if="expanded" class="preview-panel expanded">
      <div class="preview-controls">
        <button class="mode-button" :class="{ active: mode === 'mobile' }" @click="setMode('mobile')">📱</button>
        <button class="mode-button" :class="{ active: mode === 'desktop' }" @click="setMode('desktop')">💻</button>
        <button class="mode-button" :class="{ active: mode === 'pdf' }" @click="setMode('pdf')">📄</button>

        <div class="status-message" :class="statusClass">
          <template v-if="previewError">
            <span class="status-text">{{ previewError }}</span>
          </template>
          <template v-else-if="previewContent && previewContent.trim().length">
            <span class="status-text">Aperçu généré le {{ previewUpdatedAtString }}</span>
          </template>
          <template v-else-if="isGenerating">
            <span class="status-text">Génération en cours…</span>
          </template>
          <template v-else>
            <span class="status-text">Aucun aperçu disponible</span>
          </template>
        </div>
      </div>

      <div :class="['preview-content', `mode-${mode ?? 'desktop'}`]">
        <div v-if="isGenerating" class="preview-overlay">
          <span class="overlay-spinner"></span>
          <p>Génération en cours…</p>
        </div>

        <div class="preview-overlay-panel" role="dialog" aria-label="Aperçu">
      <div class="preview-overlay-header">
        <div class="preview-overlay-title">Aperçu (PDF)</div>
        <div class="preview-overlay-actions">
          <button class="close-button" @click="closePanel" aria-label="Fermer">✕</button>
        </div>
      </div>

      <div class="preview-overlay-content">
        <div v-if="isGenerating" class="preview-loading-overlay">
          <span class="overlay-spinner"></span>
          <p>Génération en cours…</p>
        </div>
        <iframe
          v-else
          class="preview-frame-expanded"
          sandbox=""
          :srcdoc="previewContent"
          title="Aperçu du travel book"
        ></iframe>
      </div>

            <div class="preview-overlay-footer">
              <!-- Footer intentionally minimal; stats live in header -->
              <div class="preview-actions-footer">
                <button class="close-button" @click="closePanel" aria-label="Fermer">Fermer</button>
              </div>
            </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useEditorStore } from '../../stores/editor.store'
import { usePreview } from '../../composables/usePreview'

const editorStore = useEditorStore()
const expanded = ref(false)

const openPanel = () => {
  editorStore.setPreviewMode('desktop')
  expanded.value = true
}

const closePanel = () => {
  expanded.value = false
}

const { content: previewContent, setMode, mode } = usePreview({
  trip: computed(() => editorStore.currentTrip),
  generatedHtml: computed(() => editorStore.previewHtml),
  initialMode: 'desktop'
})

onMounted(() => {
  editorStore.setPreviewMode('desktop')
  setMode('desktop')
  const onToggle = (ev: any) => {
    expanded.value = !!ev.detail?.open
  }
  window.addEventListener('toggle-preview', onToggle)
  // Remove listener on unmount to avoid leaks in long-running app
  onUnmounted(() => {
    window.removeEventListener('toggle-preview', onToggle)
  })
})

const isGenerating = computed(() => editorStore.isPreviewLoading)


const previewError = computed(() => editorStore.previewError)
const previewUpdatedAtString = computed(() => {
  return editorStore.previewUpdatedAt ? new Date(editorStore.previewUpdatedAt).toLocaleString() : ''
})

const statusClass = computed(() => {
  if (previewError.value) return 'type-error'
  if (editorStore.previewHtml && editorStore.previewHtml.trim().length) return 'type-success'
  if (isGenerating.value) return 'type-loading'
  return 'type-none'
})

// Watch composable mode and sync with store
watch(mode, (m) => {
  if (m) {
    editorStore.setPreviewMode(m)
  }
})

// Watch store previewMode and sync composable mode (so external changes update UI)
watch(
  () => editorStore.previewMode,
  (m) => {
    if (m && m !== mode.value) {
      setMode(m as any)
    }
  }
)
</script>
  <style scoped>
  /* Collapsed toggle */
  .preview-toggle {
    position: fixed;
    right: 8px;
    top: calc(var(--header-height, 64px) + 8px);
    transform: none;
    z-index: 1040;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: 999px;
    padding: 10px 14px;
    box-shadow: var(--shadow-md);
    cursor: pointer;
  }

  /* When the preview panel is collapsed, the editor should occupy the full width.
     We don't directly manipulate editor markup here, but ensure the toggle doesn't
     overlap important UI and stays small. */
  .preview-panel { display: block; }
  .preview-panel:not(.expanded) .preview-content, .preview-panel:not(.expanded) iframe.preview-frame { display: none; }

  /* Overlay panel when expanded */
  .preview-overlay-panel {
    position: fixed;
    right: 0;
    top: var(--header-height, 64px); /* start below the header */
    height: calc(100vh - var(--header-height, 64px));
    width: 75vw;
    max-width: 1200px;
    background: white;
    box-shadow: var(--shadow-2xl);
    z-index: 1050;
    display: flex;
    flex-direction: column;
  }

  .preview-overlay-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-border);
  }

  .preview-overlay-title {
    font-weight: var(--font-weight-semibold);
    color: var(--color-text-primary);
  }

  .close-button {
    background: transparent;
    border: none;
    font-size: 20px;
    cursor: pointer;
  }

  .preview-overlay-content {
    flex: 1;
    padding: var(--spacing-lg);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-frame-expanded {
    width: calc(100% - 48px);
    height: calc(100vh - var(--header-height, 64px) - 96px);
    border: none;
    border-radius: var(--radius-md);
    background: white;
    box-shadow: var(--shadow-lg);
  }

  .preview-loading-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-md);
  }

  .overlay-spinner {
    width: 36px;
    height: 36px;
    border: 4px solid rgba(0,0,0,0.08);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .preview-overlay-footer {
    padding: var(--spacing-md);
    border-top: 1px solid var(--color-border);
  }

  /* stat-cards moved to header; styles removed from panel */

  @media (max-width: 1200px) {
    .preview-toggle { right: 4px; }
    .preview-frame-expanded { width: calc(100% - 32px); height: calc(100vh - var(--header-height, 64px) - 80px); }
  }

  </style>
  
