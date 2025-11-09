<template>
  <div class="step-editor">
    <!-- Empty state -->
    <div v-if="!step" class="empty-state">
      <h2>Sélectionnez une étape</h2>
      <p>Choisissez une étape dans la liste pour commencer l'édition.</p>
    </div>

    <!-- Editor -->
    <div v-else class="editor">
      <!-- Header -->
      <div class="editor-header">
        <StepTitleEditor :model-value="step.name" @update:model-value="updateTitle" />
        <p class="subtitle">{{ proposalSummary }}</p>
      </div>

      <div class="editor-layout">
        <!-- Content principal -->
        <div class="editor-content">
          <!-- Pages -->
          <section class="section">
            <div class="section-head">
              <h3>Pages & mise en page</h3>
              <div class="controls">
                <button class="nav-btn" :disabled="!canMoveLeft" @click="movePage(-1)">◀</button>
                <button class="nav-btn" :disabled="!canMoveRight" @click="movePage(1)">▶</button>
                <BaseButton variant="primary" size="sm" @click="addPage">Ajouter</BaseButton>
                <BaseButton variant="secondary" size="sm" @click="generateDefaultPages">Générer par défaut</BaseButton>
                <BaseButton variant="ghost" size="sm" :disabled="!activePage" @click="removeActivePage">Supprimer</BaseButton>
              </div>
            </div>

            <div v-if="pages.length" class="pages-strip">
              <button
                v-for="(pageItem, idx) in pages"
                :key="pageItem.id"
                class="page-thumb"
                :class="{ active: pageItem.id === activePageId }"
                @click="selectPage(pageItem.id)"
              >
                <div class="thumb-preview">
                  <div v-if="idx === 0" class="thumb-cover">
                    <span>T</span>
                    <span v-if="coverFormat === 'text-image'" class="small">📷</span>
                  </div>
                  <div v-else class="thumb-grid">
                    <div v-for="n in Math.min(getLayoutCapacity(pageItem.layout), 4)" :key="n" class="slot"></div>
                  </div>
                </div>
                <span class="label">{{ idx === 0 ? 'Couverture' : `Page ${idx + 1}` }}</span>
              </button>
            </div>
            <div v-else class="empty-msg">Aucune page. Cliquez sur "Générer par défaut".</div>
          </section>

          <!-- Config page -->
          <section v-if="activePage" class="section">
            <h4>{{ isActivePageCover ? 'Agencement de la couverture' : 'Mise en page' }}</h4>
            
            <!-- Cover format -->
            <div v-if="isActivePageCover" class="options">
              <button
                class="option"
                :class="{ active: coverFormat === 'text-image' }"
                @click="setCoverFormat('text-image')"
              >
                <div class="icon cover-ti"><span>T</span><span class="sm">📷</span></div>
                <span>Texte + Image</span>
              </button>
              <button
                class="option"
                :class="{ active: coverFormat === 'text-only' }"
                @click="setCoverFormat('text-only')"
              >
                <div class="icon cover-to"><span>T</span></div>
                <span>Texte seul</span>
              </button>
            </div>

            <!-- Photo layout -->
            <div v-else class="options">
              <button
                v-for="opt in layoutOptions"
                :key="opt.value"
                class="option"
                :class="{ active: opt.value === activeLayout }"
                @click="selectLayout(opt.value)"
              >
                <div class="icon" :class="`layout-${opt.value}`">
                  <div v-for="n in layoutPreviewBlocks[opt.value]" :key="n" class="block"></div>
                </div>
                <span>{{ opt.label }}</span>
              </button>
            </div>
          </section>

          <!-- Description -->
          <section class="section">
            <RichTextEditor :model-value="step?.description ?? ''" @update:model-value="updateDescription" />
          </section>

          <!-- Aperçu (preview) -->
          <section class="section preview-section">
            <div class="preview-head">
              <h4>Aperçu à l'impression</h4>
              <div class="preview-actions">
                <BaseButton size="sm" variant="ghost" @click="refreshPreview">Rafraîchir</BaseButton>
                <BaseButton size="sm" variant="secondary" @click="printPreview" :disabled="!previewHtml">Imprimer</BaseButton>
              </div>
            </div>

            <div v-if="isPreviewLoading" class="preview-loading">Génération en cours…</div>
            <div v-else class="preview-frame" v-html="previewHtml"></div>

            <div class="preview-updated" v-if="previewUpdatedAt != null">Mis à jour: {{ formatDate(previewUpdatedAt) }}</div>
          </section>

          <!-- Cover photo selection -->
          <section v-if="isActivePageCover && coverFormat === 'text-image'" class="section">
            <h4>Photo de couverture</h4>
            <div class="photo-grid">
              <button
                v-for="photo in libraryPhotos"
                :key="photo.id"
                class="photo-card"
                :class="{ selected: isCover(photo.index) }"
                @click="toggleCover(photo.index)"
              >
                <img :src="photo.url" :alt="photo.name" :style="photoStyle(photo.index)" />
                <span class="badge">#{{ photo.index }}</span>
              </button>
            </div>
          </section>

          <!-- Page photo selection -->
          <section v-if="!isActivePageCover && activePage" class="section">
            <h4>Sélection ({{ selectedPhotoIndices.length }} / {{ layoutCapacity }})</h4>
            <div class="selected-grid">
              <div v-for="(sel, i) in selectedPhotoDetails" :key="sel.photo.index" class="selected-card">
                <img :src="sel.photo.url" :alt="sel.photo.name" :style="photoStyle(sel.photo.index)" />
                <span>Slot {{ i + 1 }}</span>
                <div class="actions">
                  <button @click="openPhotoEditor(sel.photo.index)">✎</button>
                  <button @click="togglePhoto(sel.photo.index)">✕</button>
                </div>
              </div>
              <div v-for="idx in remainingSlots" :key="`empty-${idx}`" class="selected-card empty">
                <span>Slot {{ selectedPhotoDetails.length + idx }}</span>
              </div>
            </div>
          </section>
        </div>

        <!-- Sidebar bibliothèque -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <h4>Bibliothèque</h4>
            <span>{{ filteredPhotos.length }} / {{ libraryPhotos.length }}</span>
            <BaseButton variant="outline" size="sm" @click="openUploadDialog">Importer</BaseButton>
            <input ref="uploadInput" type="file" accept="image/*" style="display: none;" @change="handleUpload" />
          </div>

          <div class="sidebar-filters">
            <input v-model="photoSearch" type="search" placeholder="Rechercher..." />
            <div class="ratio-btns">
              <button
                v-for="opt in ratioOptions"
                :key="opt.value"
                :class="{ active: photoRatio === opt.value }"
                @click="setRatio(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <div v-if="filteredPhotos.length" class="sidebar-photos">
            <button
              v-for="photo in filteredPhotos"
              :key="photo.id"
              class="lib-photo"
              :class="{ selected: selectedPhotoSet.has(photo.index) }"
              @click="togglePhoto(photo.index)"
            >
              <img :src="photo.url" :alt="photo.name" :style="photoStyle(photo.index)" />
              <div class="meta">
                <span>#{{ photo.index }}</span>
                <span>{{ photo.ratio.toLowerCase() }}</span>
              </div>
            </button>
          </div>
          <p v-else class="no-results">Aucun résultat</p>
        </aside>
      </div>
    </div>

    <!-- Modals -->
    <PhotoEditorModal
      v-if="modalPhoto"
      :photo="modalPhoto"
      :history="editedPhotoHistory ?? undefined"
      @apply="handlePhotoEditorApply"
      @close="closePhotoEditor"
    />

    <ConfirmDialog
      :model-value="confirmResetOpen"
      message="Voulez-vous réinitialiser cette étape ?"
      @confirm="handleConfirmReset"
      @cancel="handleCancelReset"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue'
import type { CSSProperties } from 'vue'
import { useEditorStore } from '../../stores/editor.store'
import type { StepPageLayout, PhotoRatio, EditorStepPhoto } from '../../models/editor.types'
import { usePhotoLibrary } from '../../composables/usePhotoLibrary'
import { getLayoutCapacity } from '../../models/layout.constants'
import type { GalleryPhoto, PhotoAdjustments, CropSettings, PhotoFilterPreset } from '../../models/gallery.types'
import { buildCssFilter } from '../../utils/photo-filters'
import BaseButton from '../BaseButton.vue'
import ConfirmDialog from '../ui/ConfirmDialog.vue'

const layoutOptions: Array<{ value: StepPageLayout; label: string }> = [
  { value: 'grid-2x2', label: 'Grille 2×2' },
  { value: 'hero-plus-2', label: 'Héro + 2' },
  { value: 'three-columns', label: 'Trois colonnes' },
  { value: 'full-page', label: 'Plein format' }
]

const layoutPreviewBlocks: Record<StepPageLayout, number> = {
  'grid-2x2': 4,
  'hero-plus-2': 3,
  'three-columns': 3,
  'full-page': 1
}

const ratioOptions: Array<{ value: 'all' | PhotoRatio; label: string }> = [
  { value: 'all', label: 'Toutes' },
  { value: 'LANDSCAPE', label: 'Paysage' },
  { value: 'PORTRAIT', label: 'Portrait' },
  { value: 'UNKNOWN', label: 'Inconnue' }
]

type EditorPhotoSnapshot = {
  filterPreset: PhotoFilterPreset
  adjustments: PhotoAdjustments
  rotation: number
  crop: CropSettings
}

type EditorPhotoHistory = {
  past: EditorPhotoSnapshot[]
  future: EditorPhotoSnapshot[]
}

const StepTitleEditor = defineAsyncComponent(async () => {
  const module = (await import('./StepTitleEditor.vue')) as any
  return module.default ?? module
})

const RichTextEditor = defineAsyncComponent(async () => {
  const module = (await import('./RichTextEditor.vue')) as any
  return module.default ?? module
})

const PhotoEditorModal = defineAsyncComponent(async () => {
  const module = (await import('./PhotoEditorModal.vue')) as any
  return module.default ?? module
})

const editorStore = useEditorStore()
const uploadInput = ref<HTMLInputElement | null>(null)
const confirmResetOpen = ref(false)
const editedPhotoIndex = ref<number | null>(null)

const step = computed(() => editorStore.currentStep)
const gridPhotos = computed(() => editorStore.currentStepPhotos)
const pages = computed(() => editorStore.currentStepPages)
const activePage = computed(() => editorStore.currentStepActivePage)
const activePageId = computed(() => editorStore.currentStepActivePageId)
const libraryPhotos = computed(() => [...gridPhotos.value].sort((a, b) => a.index - b.index))
const activeLayout = computed<StepPageLayout | null>(() => activePage.value?.layout ?? null)
const activePageIndex = computed(() => pages.value.findIndex((page) => page.id === activePageId.value))
const canMoveLeft = computed(() => activePageIndex.value > 0)
const canMoveRight = computed(() => activePageIndex.value >= 0 && activePageIndex.value < pages.value.length - 1)
const coverPhotoIndex = computed(() => editorStore.currentStepPageState?.coverPhotoIndex ?? null)
const selectedPhotoIndices = computed(() => activePage.value?.photoIndices ?? [])
const selectedPhotoSet = computed(() => new Set(selectedPhotoIndices.value))

const proposalSummary = computed(() => {
  const s = step.value
  const trip = editorStore.currentTrip
  if (!s) return ''
  let dayNumber = 1
  if (trip?.start_date && typeof s.start_time === 'number') {
    const tripStart = new Date(trip.start_date * 1000).getTime()
    const stepTime = new Date(s.start_time * 1000).getTime()
    const msPerDay = 24 * 60 * 60 * 1000
    dayNumber = Math.max(1, Math.floor((stepTime - tripStart) / msPerDay) + 1)
  }
  const city = s.city ? s.city.trim() : ''
  const country = s.country ? s.country.trim() : ''
  const location = [city, country].filter(Boolean).join(', ') || city || country || ''
  const dateStr = s.start_time ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(s.start_time * 1000)) : ''
  return `Jour-${dayNumber} : ${location} (${dateStr})`
})

const { query: photoSearch, ratio: photoRatio, filteredPhotos, setRatio } = usePhotoLibrary(libraryPhotos)

const layoutCapacity = computed(() => {
  if (!activeLayout.value) return 0
  return getLayoutCapacity(activeLayout.value)
})

const editedPhoto = computed(() => {
  if (editedPhotoIndex.value == null) return null
  return libraryPhotos.value.find((photo) => photo.index === editedPhotoIndex.value) ?? null
})

const modalPhoto = computed<GalleryPhoto | null>(() => {
  const photo = editedPhoto.value
  const currentStepValue = step.value
  if (!photo || !currentStepValue) return null

  const file = photo.file ?? new File([], photo.name, { type: 'image/jpeg' })
  const orientation = photo.width === photo.height ? 'square' : photo.width > photo.height ? 'landscape' : 'portrait'

  return {
    id: photo.id,
    stepId: currentStepValue.id,
    stepName: currentStepValue.name,
    stepDate: currentStepValue.start_time,
    location: (currentStepValue.city ?? currentStepValue.name) || currentStepValue.name,
    countryCode: currentStepValue.country_code ?? '',
    tags: [],
    file,
    objectUrl: photo.url,
    width: photo.width,
    height: photo.height,
    orientation,
    fileSize: file.size ?? 0,
    filterPreset: photo.filterPreset,
    adjustments: { ...photo.adjustments },
    crop: { ...photo.crop },
    rotation: photo.rotation,
    aiFavoriteScore: 0,
    aiFavorite: false,
    customFavorite: false,
    hidden: false,
    qualityInsights: [],
    palette: []
  }
})

const editedPhotoHistory = computed<EditorPhotoHistory | null>(() => {
  if (!editedPhoto.value) return null
  return editorStore.getCurrentStepPhotoHistory(editedPhoto.value.index)
})

const currentPageState = computed(() => editorStore.currentStepPageState)
const isActivePageCover = computed(() => {
  const state = currentPageState.value
  if (!state || !pages.value.length) return false
  const firstPageId = state.pages[0]?.id
  return activePageId.value === firstPageId
})

const coverFormat = computed(() => currentPageState.value?.coverFormat ?? 'text-image')
const setCoverFormat = (format: 'text-image' | 'text-only') => {
  editorStore.setCurrentStepCoverFormat(format)
}

const computePhotoTransform = (photo: EditorStepPhoto): string => {
  const zoom = Math.max(1, Math.min(3, photo.crop?.zoom ?? 1))
  const offsetX = Math.max(-50, Math.min(50, photo.crop?.offsetX ?? 0))
  const offsetY = Math.max(-50, Math.min(50, photo.crop?.offsetY ?? 0))
  const rotation = photo.rotation ?? 0
  return `scale(${zoom.toFixed(3)}) translate(${offsetX.toFixed(3)}%, ${offsetY.toFixed(3)}%) rotate(${rotation}deg)`
}

const buildPhotoStyle = (photo: EditorStepPhoto): CSSProperties => ({
  filter: buildCssFilter(photo.adjustments, photo.filterPreset),
  transform: computePhotoTransform(photo),
  transformOrigin: 'center'
})

const photoStyleMap = computed(() => {
  const map = new Map<number, CSSProperties>()
  for (const photo of libraryPhotos.value) {
    map.set(photo.index, buildPhotoStyle(photo))
  }
  return map
})

const photoStyle = (index: number): CSSProperties => {
  return photoStyleMap.value.get(index) ?? {}
}

const selectedPhotoDetails = computed(() => {
  if (!selectedPhotoIndices.value.length) return []
  return selectedPhotoIndices.value
    .map((index, position) => ({
      position,
      photo: libraryPhotos.value.find((photo) => photo.index === index) ?? null
    }))
    .filter((entry): entry is { position: number; photo: (typeof libraryPhotos.value)[number] } => entry.photo !== null)
})

const remainingSlots = computed(() => {
  const available = layoutCapacity.value - selectedPhotoIndices.value.length
  return available > 0 ? available : 0
})

const updateTitle = (newTitle: string) => {
  if (!step.value) return
  editorStore.updateStepTitle(editorStore.currentStepIndex, newTitle)
}

const updateDescription = (newDescription: string) => {
  if (!step.value) return
  editorStore.updateStepDescription(editorStore.currentStepIndex, newDescription)
}

const addPage = () => {
  editorStore.addPageToCurrentStep('grid-2x2')
}

const generateDefaultPages = async () => {
  if (!step.value) return
  await editorStore.generateDefaultPagesForStep(step.value.id)
}

const removeActivePage = () => {
  const page = activePage.value
  if (!page) return
  editorStore.removePageFromCurrentStep(page.id)
}

const selectPage = (pageId: string) => {
  editorStore.setCurrentStepActivePage(pageId)
}

const movePage = (direction: number) => {
  const index = activePageIndex.value
  if (index === -1) return
  const target = index + direction
  if (target < 0 || target >= pages.value.length) return

  const orderedIds = pages.value.map((page) => page.id)
  const [moved] = orderedIds.splice(index, 1)
  orderedIds.splice(target, 0, moved)
  editorStore.reorderCurrentStepPages(orderedIds)
  editorStore.setCurrentStepActivePage(orderedIds[target])
}

const selectLayout = (layout: StepPageLayout) => {
  const page = activePage.value
  if (!page) return
  editorStore.setCurrentPageLayout(page.id, layout)
}

const togglePhoto = (photoIndex: number) => {
  const page = activePage.value
  if (!page) return
  const existing = [...(page.photoIndices ?? [])]
  let next: number[]
  if (existing.includes(photoIndex)) {
    next = existing.filter((value) => value !== photoIndex)
  } else {
    next = [...existing, photoIndex]
    const capacity = getLayoutCapacity(page.layout)
    if (Number.isFinite(capacity) && next.length > capacity) {
      next = next.slice(next.length - capacity)
    }
  }
  editorStore.setCurrentPagePhotoIndices(page.id, next)
}

const isCover = (photoIndex: number) => coverPhotoIndex.value === photoIndex

const toggleCover = (photoIndex: number) => {
  if (coverPhotoIndex.value === photoIndex) {
    editorStore.setCurrentStepCoverPhotoIndex(null)
  } else {
    editorStore.setCurrentStepCoverPhotoIndex(photoIndex)
  }
}

const openPhotoEditor = (photoIndex: number) => {
  editedPhotoIndex.value = photoIndex
}

const closePhotoEditor = () => {
  editedPhotoIndex.value = null
}

const handlePhotoEditorApply = (payload: { state: EditorPhotoSnapshot; history?: EditorPhotoHistory | null }) => {
  if (!editedPhoto.value) return
  editorStore.applyAdjustmentsToCurrentPhoto(editedPhoto.value.index, payload.state, payload.history ?? undefined)
  closePhotoEditor()
}

const openUploadDialog = () => {
  uploadInput.value?.click()
}

const handleUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) return
  const file = files[0]
  try {
    const added = await editorStore.addPhotoToCurrentStep(file)
    if (added) {
      photoSearch.value = ''
      setRatio('all')
      if (activePage.value) {
        togglePhoto(added.index)
      }
    }
  } finally {
    input.value = ''
  }
}

const handleConfirmReset = async () => {
  confirmResetOpen.value = false
  if (!step.value) return
  await editorStore.resetStep(step.value.id)
}

const handleCancelReset = () => {
  confirmResetOpen.value = false
}

// --- Preview related bindings ---
const previewHtml = computed(() => editorStore.currentStepPreviewHtml)
const previewUpdatedAt = computed(() => editorStore.currentStepPreviewUpdatedAt)
const isPreviewLoading = computed(() => editorStore.isCurrentStepPreviewLoading)

const refreshPreview = () => {
  void editorStore.regenerateCurrentStepPreview()
}

const printPreview = () => {
  // Open a new window with minimal styles for printing
  const html = previewHtml.value ?? ''
  const w = window.open('', '_blank')
  if (!w) return
  w.document.open()
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Preview</title>')
  // include a basic print style
  w.document.write('<style>body{font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; margin:0; padding:0} .page{page-break-after: always}</style>')
  w.document.write('</head><body>')
  w.document.write(html)
  w.document.write('</body></html>')
  w.document.close()
  // give the window a moment to render, then call print
  setTimeout(() => {
    try { w.focus(); w.print(); } catch (e) { /* ignore */ }
  }, 250)
}

// format date util (used in template)
const formatDate = (ts: number | string | Date) => {
  if (!ts) return ''
  const d = typeof ts === 'number' ? new Date(ts) : ts instanceof Date ? ts : new Date(ts)
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
</script>

<style scoped>
.step-editor {
  height: 100%;
  background: #f9fafb;
}

.empty-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #6b7280;
}

.empty-state h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
}

.empty-state p {
  margin: 0;
}

.editor {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 24px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.editor-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 340px;
  overflow: hidden;
}

.editor-content {
  overflow-y: auto;
  padding: 24px;
}

.section {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-head h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.section h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px;
  color: #1f2937;
}

.controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.nav-btn:hover:not(:disabled) {
  background: #f3f4f6;
}

.nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pages-strip {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0;
}

.page-thumb {
  flex-shrink: 0;
  width: 110px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.page-thumb:hover {
  border-color: #3b82f6;
}

.page-thumb.active {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.thumb-preview {
  width: 100%;
  aspect-ratio: 3/4;
  background: #f3f4f6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumb-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 24px;
  font-weight: bold;
  color: #6b7280;
}

.thumb-cover .small {
  font-size: 14px;
}

.thumb-grid {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  padding: 4px;
}

.thumb-grid .slot {
  background: #d1d5db;
  border-radius: 2px;
}

.page-thumb .label {
  font-size: 11px;
  color: #6b7280;
  text-align: center;
}

.empty-msg {
  padding: 32px;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
}

/* Preview styles */
.preview-section {
  padding: 12px;
}

.preview-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-frame {
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  min-height: 240px;
  padding: 12px;
  overflow: auto;
}

.preview-loading {
  padding: 24px;
  text-align: center;
  color: #6b7280;
}

.options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.option {
  flex: 1;
  min-width: 130px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.option:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option.active {
  border-color: #3b82f6;
  background: #dbeafe;
}

.icon {
  width: 60px;
  height: 45px;
  background: #f3f4f6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #6b7280;
}

.icon.cover-ti {
  flex-direction: column;
}

.icon.cover-ti .sm {
  font-size: 11px;
}

.icon.layout-grid-2x2,
.icon.layout-hero-plus-2,
.icon.layout-three-columns {
  display: grid;
  gap: 2px;
  padding: 4px;
}

.icon.layout-grid-2x2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.icon.layout-hero-plus-2 {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.icon.layout-hero-plus-2 .block:first-child {
  grid-row: 1 / span 2;
}

.icon.layout-three-columns {
  grid-template-columns: 1fr 1fr 1fr;
}

.icon.layout-full-page {
  display: flex;
}

.block {
  background: #d1d5db;
  border-radius: 2px;
}

.photo-grid,
.selected-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.photo-card,
.lib-photo {
  position: relative;
  aspect-ratio: 1;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  background: white;
}

.photo-card:hover,
.lib-photo:hover {
  border-color: #3b82f6;
}

.photo-card.selected,
.lib-photo.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.photo-card img,
.lib-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge,
.meta {
  position: absolute;
  bottom: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.meta {
  display: flex;
  gap: 4px;
}

.selected-card {
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
}

.selected-card span {
  font-size: 13px;
  color: #6b7280;
}

.selected-card .actions {
  display: flex;
  gap: 4px;
}

.selected-card button {
  flex: 1;
  padding: 6px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.selected-card button:hover {
  background: #f3f4f6;
}

.selected-card.empty {
  background: #f9fafb;
  border-style: dashed;
  min-height: 100px;
  justify-content: center;
  align-items: center;
}

.sidebar {
  background: white;
  border-left: 1px solid #e5e7eb;
  padding: 24px 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sidebar-header h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
}

.sidebar-header span {
  display: block;
  font-size: 13px;
  color: #9ca3af;
  margin-bottom: 8px;
}

.sidebar-filters input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 8px;
}

.sidebar-filters input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.ratio-btns {
  display: flex;
  gap: 4px;
}

.ratio-btns button {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
}

.ratio-btns button:hover {
  background: #f3f4f6;
}

.ratio-btns button.active {
  background: #dbeafe;
  border-color: #3b82f6;
  color: #2563eb;
}

.sidebar-photos {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.no-results {
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
  padding: 32px 16px;
}
</style>
