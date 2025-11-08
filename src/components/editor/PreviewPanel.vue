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
          <button class="download-button" @click="downloadHtml" :disabled="isGenerating || !previewContent" aria-label="Télécharger HTML" title="Télécharger le HTML de l'aperçu">⤓</button>
          <button class="open-button" @click="openInNewTab" :disabled="isGenerating || !previewContent" aria-label="Ouvrir dans un nouvel onglet" title="Ouvrir l'aperçu dans un nouvel onglet">↗️</button>
          <button class="print-button" @click="printPreview" :disabled="isGenerating || !previewContent" aria-label="Imprimer" title="Imprimer l'aperçu">🖨️</button>
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
          ref="previewFrame"
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
import { useEditorGeneration } from '../../composables/useEditorGeneration'

const editorStore = useEditorStore()
const expanded = ref(false)

const { previewTravelBook } = useEditorGeneration()

const openPanel = async () => {
  // Keep existing mode behavior
  editorStore.setPreviewMode('desktop')
  expanded.value = true
  // Trigger preview generation when opening from the panel toggle so
  // the behavior matches the header preview button.
  // We don't await this call deliberately to let the UI open immediately;
  // the store's isPreviewLoading flag will display loading state in the panel.
  void previewTravelBook()
}

const closePanel = () => {
  expanded.value = false
}

// Reference to the iframe element so we can call its contentWindow.print()
const previewFrame = ref<HTMLIFrameElement | null>(null)

const printPreview = () => {
  // Try to print from the iframe's contentWindow if available
  try {
    const iframe = previewFrame.value
    const printed = iframe?.contentWindow && typeof iframe.contentWindow.print === 'function'
    if (printed) {
      iframe!.contentWindow!.focus()
      iframe!.contentWindow!.print()
      return
    }
  } catch (err) {
    // ignore and fallback
  }

  // Fallback: open a new window/tab with the preview HTML and print it
  try {
    const html = previewContent.value || ''
    const w = window.open('', '_blank')
    if (w) {
      // Write the HTML but append a small script that waits for images/tiles to load
      // before calling print(). This helps ensure cover photo and map tiles are
      // available in the print snapshot. If images don't finish loading within
      // the timeout, we still call print to avoid blocking indefinitely.
      const waitAndPrintScript = `
        <script>
          (function(){
            const TIMEOUT = 8000;
            function allImagesLoaded() {
              const imgs = Array.from(document.images || [])
              if (imgs.length === 0) return true
              return imgs.every(i => i.complete && (i.naturalWidth !== 0))
            }
            function onReady() {
              try { window.focus(); window.print(); } catch(e) { /* ignore */ }
            }
            if (allImagesLoaded()) {
              onReady();
            } else {
              let called = false;
              const attempt = () => { if (called) return; if (allImagesLoaded()) { called = true; onReady(); } };
              const timer = setTimeout(() => { if (!called) { called = true; onReady(); } }, TIMEOUT);
              // Listen to load/error on images
              Array.from(document.images || []).forEach(img => {
                img.addEventListener('load', attempt, { once: true })
                img.addEventListener('error', attempt, { once: true })
              })
            }
          })();
        <\/script>
      `

      w.document.open()
      // Insert the wait script just before closing body to ensure all images are present
  const injected = html.replace(/<\/body>/i, waitAndPrintScript + '\n</body>')
      w.document.write(injected)
      w.document.close()
      w.focus()
      // Some test environments (happy-dom/jsdom) return a Window-like object
      // but do not execute the injected script or expose a print method. In
      // that case, fallback to calling the main window.print() so tests and
      // headless environments still trigger a print attempt instead of
      // silently returning.
      if (typeof (w as any).print !== 'function') {
        try { window.print() } catch (e) { /* ignore */ }
      }
      return
    }
  } catch (err) {
    // ignore
  }

  // Last-resort fallback
  window.print()
}

const openInNewTab = () => {
  try {
    const iframe = previewFrame.value
    if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
      // Try to open a new tab and write the iframe's document HTML
      const docHtml = iframe.contentWindow.document.documentElement.outerHTML
      const w = window.open('', '_blank')
      if (w) {
        w.document.open()
        w.document.write(docHtml)
        w.document.close()
        w.focus()
        return
      }
    }
  } catch (err) {
    // ignore and fallback to using previewContent
  }

  // Fallback: open previewContent in a new tab
  try {
    const html = previewContent.value || ''
    const w = window.open('', '_blank')
    if (w) {
      w.document.open()
      w.document.write(html)
      w.document.close()
      w.focus()
      return
    }
  } catch (err) {
    // ignore
  }
}

const downloadHtml = () => {
  try {
    let html = ''
    try {
      const iframe = previewFrame.value
      if (iframe && iframe.contentWindow && iframe.contentWindow.document) {
        html = iframe.contentWindow.document.documentElement.outerHTML
      }
    } catch (err) {
      // ignore and fallback
    }
    if (!html) html = previewContent.value || ''

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'preview.html'
    document.body.appendChild(a)
    a.click()
    a.remove()
    // revoke after a delay to ensure download started
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return
  } catch (err) {
    // ignore
  }
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
  .preview-overlay-actions button {
    margin-left: 8px;
  }

  /* Design-system buttons for actions (download / open / print / close) */
  .preview-overlay-actions button {
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid var(--color-border-2, rgba(0,0,0,0.06));
    background: var(--color-surface, #fff);
    color: var(--color-text-primary, #222);
    cursor: pointer;
    transition: background 120ms ease, box-shadow 120ms ease, transform 60ms ease;
    font-size: 16px;
  }

  /* Color variants */
  .download-button { /* accent / success */
    background: var(--color-accent, #0b9d58);
    color: var(--color-on-accent, #fff);
    border-color: transparent;
  }
  .download-button:hover:not(:disabled) { background: color-mix(in srgb, var(--color-accent, #0b9d58) 88%, black 12%); }

  .open-button { /* primary */
    background: var(--color-primary, #1a73e8);
    color: var(--color-on-primary, #fff);
    border-color: transparent;
  }
  .open-button:hover:not(:disabled) { background: color-mix(in srgb, var(--color-primary, #1a73e8) 88%, black 12%); }

  .print-button { /* neutral */
    background: var(--color-surface, #fff);
    color: var(--color-text-primary, #222);
    border-color: var(--color-border-2, rgba(0,0,0,0.06));
  }
  .print-button:hover:not(:disabled) { background: var(--color-surface-hover, #f5f7fb); }

  .preview-overlay-actions button:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(66,133,244,0.12);
  }

  .preview-overlay-actions button:disabled {
    opacity: 0.45;
    cursor: default;
    transform: none;
  }

  .close-button {
    background: transparent;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: 6px;
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
  
