<template>
  <section class="section preview-section">
    <div class="preview-head">
      <h4>Aperçu à l'impression</h4>
      <div class="preview-actions">
        <BaseButton size="sm" variant="ghost" data-test="preview-refresh" @click="$emit('refresh')">Rafraîchir</BaseButton>
        <BaseButton size="sm" variant="secondary" @click="$emit('print')" :disabled="!previewHtml">Imprimer</BaseButton>
      </div>
    </div>

    <div v-if="isLoading" class="preview-loading">Génération en cours…</div>
    <div v-else class="preview-scaler-wrapper" ref="wrapperRef">
      <div class="preview-scaler" :style="scalerStyle">
        <iframe
          ref="iframeRef"
          class="preview-frame"
          :srcdoc="adjustedHtml"
          :style="iframeStyle"
          sandbox="allow-same-origin"
          title="Aperçu à l'impression"
          @load="onIframeLoad"
        ></iframe>
      </div>
    </div>

    <div class="preview-updated" v-if="previewUpdatedAt != null">Mis à jour: {{ formatDate(previewUpdatedAt) }}</div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import BaseButton from '../BaseButton.vue'

/** A4 landscape width at 96 dpi (297mm) */
const A4_WIDTH = 1123
/** A4 landscape height at 96 dpi (210mm) */
const A4_HEIGHT = 794
/** Page height minus the default padding (100vh - 40px in original CSS) */
const PAGE_INNER = A4_HEIGHT - 40

const props = defineProps({
  previewHtml: { type: String, default: '' },
  isLoading: { type: Boolean, default: false },
  previewUpdatedAt: { type: [Number, String, Date], default: null }
})

const emit = defineEmits(['refresh', 'print'])

const wrapperRef = ref<HTMLDivElement | null>(null)
const iframeRef = ref<HTMLIFrameElement | null>(null)
const scaleFactor = ref(0.5)
/** Actual content height inside the iframe (defaults to one A4 page) */
const iframeHeight = ref(A4_HEIGHT)

/**
 * Maximum scale factor. We allow up to 1.0 so the page fills
 * the available width, but computeScale() also caps it to fit
 * one full A4-page height inside the wrapper.
 */
const MAX_SCALE = 1.0

/**
 * Compute the scale factor so the A4 iframe fits inside the container,
 * showing at least one full A4 page proportionally.
 */
const computeScale = () => {
  if (!wrapperRef.value) return
  const containerWidth = wrapperRef.value.clientWidth
  const containerHeight = wrapperRef.value.clientHeight || 700
  // Scale to fit width AND ensure one full page fits in the visible height
  const scaleByWidth = containerWidth / A4_WIDTH
  const scaleByHeight = containerHeight / A4_HEIGHT
  scaleFactor.value = Math.min(scaleByWidth, scaleByHeight, MAX_SCALE)
}

/**
 * Read the actual scrollHeight of the iframe document so all pages are visible.
 */
const measureIframeContent = () => {
  try {
    const doc = iframeRef.value?.contentDocument
    if (doc?.body) {
      const h = doc.body.scrollHeight
      if (h > 0) iframeHeight.value = h
    }
  } catch {
    // cross-origin or not ready — keep default
  }
}

const onIframeLoad = () => {
  measureIframeContent()
  // Recompute scale now that we know the real content height
  nextTick(computeScale)
}

const iframeStyle = computed(() => ({
  width: `${A4_WIDTH}px`,
  height: `${iframeHeight.value}px`,
  transform: `scale(${scaleFactor.value})`,
  transformOrigin: 'top left',
}))

const scalerStyle = computed(() => ({
  height: `${Math.ceil(iframeHeight.value * scaleFactor.value)}px`,
  width: `${Math.ceil(A4_WIDTH * scaleFactor.value)}px`,
  maxWidth: '100%',
}))

let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  nextTick(computeScale)
  if (wrapperRef.value) {
    resizeObserver = new ResizeObserver(computeScale)
    resizeObserver.observe(wrapperRef.value)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

// Recompute when previewHtml changes (new content may appear)
watch(() => props.previewHtml, () => {
  // Reset height before new content loads
  iframeHeight.value = A4_HEIGHT
  nextTick(computeScale)
})



/**
 * CSS overrides injected into the preview HTML so that elements using 100vh
 * inside the iframe get a fixed A4-page height instead of the iframe's total
 * scroll height (which grows with content).
 */
const previewCssOverrides = `
<style data-preview-fix>
  /* Force page-sized containers to use fixed A4 height instead of 100vh */
  .step-with-photo { height: ${PAGE_INNER}px !important; }
  .cover-page { height: ${PAGE_INNER}px !important; }
  .photo-columns { height: ${PAGE_INNER}px !important; }
  .step-layout { height: ${PAGE_INNER}px !important; gap: 10px !important; }
  .stats-layout { height: ${PAGE_INNER}px !important; }
  .stats-right { min-height: ${PAGE_INNER}px !important; }
  .map-page { height: ${A4_HEIGHT}px !important; min-height: ${A4_HEIGHT}px !important; }
  .layout-full-page .layout-photo.full { min-height: ${PAGE_INNER - 40}px !important; }

  /* Constrain ALL images to their container width */
  img {
    max-width: 100% !important;
    height: auto !important;
    object-fit: contain;
  }

  /* Ensure images inside step containers preserve aspect ratio */
  .step-with-photo img {
    object-fit: cover !important;
    max-height: 100% !important;
  }

  .layout-photo-image {
    object-fit: cover !important;
  }

  .photo-container {
    overflow: hidden !important;
  }

  /* Force body to exact A4 width including padding */
  body {
    width: ${A4_WIDTH}px !important;
    max-width: ${A4_WIDTH}px !important;
    overflow-x: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    background: white !important;
  }

  /* Remove wrapper max-width that conflicts with A4 sizing */
  .step-preview-wrapper {
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* Constrain break-after sections to page width */
  .break-after {
    margin-bottom: 20px;
    box-sizing: border-box;
    width: 100% !important;
    max-width: ${A4_WIDTH}px !important;
    overflow: hidden !important;
  }

  /* Ensure step and photo layout containers don't overflow */
  .step-with-photo,
  .photo-columns,
  .step-layout {
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
  }

  .step-with-photo > div {
    overflow: hidden !important;
    min-width: 0 !important;
  }

  .step-title {
    word-break: break-word;
    overflow-wrap: break-word;
    max-width: 100%;
  }

  .step-description {
    word-break: break-word;
    overflow-wrap: break-word;
  }
</style>
`

/**
 * Injects CSS overrides into the preview HTML to fix vh-based sizing.
 */
const adjustedHtml = computed(() => {
  const html = props.previewHtml
  if (!html) return html
  // Insert overrides just before </head> if possible, else before </body>
  if (html.includes('</head>')) {
    return html.replace('</head>', previewCssOverrides + '</head>')
  }
  if (html.includes('</body>')) {
    return html.replace('</body>', previewCssOverrides + '</body>')
  }
  return html + previewCssOverrides
})

const formatDate = (ts: number | string | Date) => {
  if (!ts) return ''
  const d = typeof ts === 'number' ? new Date(ts) : ts instanceof Date ? ts : new Date(ts)
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
</script>

<style scoped>
.section { margin-bottom:24px; background:#fff; border-radius:8px; padding:16px }
.preview-section { padding:12px }
.preview-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px }
.preview-actions { display:flex; gap:8px }

/* Outer wrapper — shows the scaled A4 page proportionally */
.preview-scaler-wrapper {
  width: 100%;
  max-height: 700px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #f3f4f6;
  display: flex;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
}

/* Inner container whose size matches the scaled iframe exactly */
.preview-scaler {
  overflow: hidden;
  position: relative;
  flex-shrink: 0;
}

.preview-frame {
  border: none;
  display: block;
  background: white;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
}

.preview-loading { padding:24px; text-align:center; color:#6b7280 }
.preview-updated { margin-top:8px; color:#6b7280; font-size: 0.85em }
</style>