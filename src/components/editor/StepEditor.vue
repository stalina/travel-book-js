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
          <!-- Pages strip component -->
          <PagesStrip
            :pages="pages"
            :activePageId="activePageId"
            :coverFormat="coverFormat"
            :previewClassFor="previewClassFor"
            :canMoveLeft="canMoveLeft"
            :canMoveRight="canMoveRight"
            :hasActive="!!activePage"
            @move-page="movePage"
            @add-page="addPage"
            @generate-default-pages="generateDefaultPages"
            @remove-active-page="removeActivePage"
            @select-page="selectPage"
          />

          <!-- Page layout configuration -->
          <CoverLayoutOptions
            v-if="activePage && isActivePageCover"
            v-model="coverFormat"
          />

          <LayoutOptions
            v-else-if="activePage"
            :title="'Mise en page'"
            :options="layoutOptions"
            :active="activeLayout"
            :previewClassFor="previewClassFor"
            :descriptions="layoutDescriptions"
            @select="selectLayout"
          />

          <!-- Proposal (description + preview) -->
          <ProposalSection @reset="confirmResetOpen = true">
            <template #body>
              <div>
                <template v-if="isActivePageCover">
                  <template v-if="coverFormat === 'text-image'">
                    <div class="two-column-layout">
                      <DescriptionEditor :modelValue="step?.description ?? ''" @update="updateDescription" />
                      <CoverPhotoSelector
                        :photo="coverPhoto"
                        @open-library="openLibraryForSlot"
                        @edit="openPhotoEditor"
                        @clear="clearCover"
                      />
                    </div>
                  </template>

                  <template v-else>
                    <DescriptionEditor :modelValue="step?.description ?? ''" @update="updateDescription" />
                  </template>
                </template>

                <template v-else>
                  <SelectedGrid
                    v-if="activePage"
                    :slots="pageSlots"
                    :selectedCount="selectedPhotoIndices.length"
                    :capacity="layoutCapacity"
                    @open-library="openLibraryForSlot"
                    @edit-photo="openPhotoEditor"
                    @clear-slot="clearSlot"
                  />
                </template>
              </div>

              <PreviewSection
                :previewHtml="previewHtml"
                :isLoading="isPreviewLoading"
                :previewUpdatedAt="previewUpdatedAt"
                @refresh="refreshPreview"
                @print="printPreview"
              />
            </template>
          </ProposalSection>

        </div>

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

    <!-- Photo library popin (component) -->
    <PhotoLibraryPopin
      v-if="libraryPopinOpen"
      :filtered="filteredPhotos"
      :total="libraryPhotos.length"
      v-model:query="photoSearch"
      :ratio="photoRatio"
      :ratioOptions="ratioOptions"
      @select="selectPhotoForSlot"
      @set-ratio="setRatio"
      @close="closeLibrary"
      @upload="handleUpload"
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
import { useEditorStore } from '../../stores/editor.store'
import type { StepPageLayout, PhotoRatio } from '../../models/editor.types'
import { usePhotoLibrary } from '../../composables/usePhotoLibrary'
import { getLayoutCapacity } from '../../models/layout.constants'
import type { GalleryPhoto, PhotoAdjustments, CropSettings, PhotoFilterPreset } from '../../models/gallery.types'
import ConfirmDialog from '../ui/ConfirmDialog.vue'
import PagesStrip from './PagesStrip.vue'
import LayoutOptions from './LayoutOptions.vue'
import PhotoLibraryPopin from './PhotoLibraryPopin.vue'
import ProposalSection from './ProposalSection.vue'
import SelectedGrid from './SelectedGrid.vue'
import PreviewSection from './PreviewSection.vue'
import DescriptionEditor from './DescriptionEditor.vue'
import CoverPhotoSelector from './CoverPhotoSelector.vue'
import CoverLayoutOptions from './CoverLayoutOptions.vue'
const layoutOptions: Array<{ value: StepPageLayout; label: string }> = [
  { value: 'grid-2x2', label: 'Grille 2×2' },
  { value: 'hero-plus-2', label: 'Héro + 2' },
  { value: 'three-columns', label: 'Trois colonnes' },
  { value: 'full-page', label: 'Plein format' }
]

const layoutDescriptions: Record<StepPageLayout, string> = {
  'grid-2x2': 'Jusqu\u2019à 4 photos en grille équilibrée',
  'hero-plus-2': 'Une photo principale et jusqu\u2019à 2 secondaires',
  'three-columns': 'Trois portraits alignés verticalement',
  'full-page': 'Une photo immersive occupant toute la page'
}

// layoutPreviewBlocks removed (unused)

// mapping to match mockup classes in docs/mockups/gallery.html
const previewClassFor: Record<StepPageLayout, string> = {
  'grid-2x2': 'grid-2x2',
  'hero-plus-2': 'hero-side',
  'three-columns': 'three-columns',
  'full-page': 'full-page'
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

const PhotoEditorModal = defineAsyncComponent(async () => {
  const module = (await import('./PhotoEditorModal.vue')) as any
  return module.default ?? module
})

const editorStore = useEditorStore()
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

// Photo library popin state
const libraryPopinOpen = ref(false)
const currentLibrarySlot = ref<number | null>(null)

const openLibraryForSlot = (slotIndex: number) => {
  currentLibrarySlot.value = slotIndex
  libraryPopinOpen.value = true
}

const closeLibrary = () => {
  currentLibrarySlot.value = null
  libraryPopinOpen.value = false
}

const selectPhotoForSlot = (photoIndex: number) => {
  if (currentLibrarySlot.value == null) return
  // If selecting for the cover slot (we use slot 0 for cover), set the step cover photo
  if (currentLibrarySlot.value === 0 && isActivePageCover.value) {
    editorStore.setCurrentStepCoverPhotoIndex(photoIndex)
    closeLibrary()
    return
  }

  const page = activePage.value
  if (!page) return
  const existing = [...(page.photoIndices ?? [])]
  // ensure the selected slot index exists in array
  const slotPos = currentLibrarySlot.value
  existing[slotPos] = photoIndex
  // trim to capacity
  const capacity = getLayoutCapacity(page.layout)
  const next = existing.slice(0, capacity)
  editorStore.setCurrentPagePhotoIndices(page.id, next)
  closeLibrary()
}

const coverPhoto = computed(() => {
  const idx = coverPhotoIndex.value
  if (idx == null) return null
  return libraryPhotos.value.find((p) => p.index === idx) ?? null
})

const clearCover = () => {
  editorStore.setCurrentStepCoverPhotoIndex(null)
}

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

const coverFormat = computed<'text-image' | 'text-only'>({
  get: () => currentPageState.value?.coverFormat ?? 'text-image',
  set: (format) => {
    editorStore.setCurrentStepCoverFormat(format)
  }
})

// Photo transform/style helpers removed (not used in template)

// slots array for active page: array of GalleryPhoto|null for each slot position
const pageSlots = computed(() => {
  const page = activePage.value
  const cap = layoutCapacity.value
  if (!page || !cap) return []
  const slots: Array<any | null> = []
  for (let i = 0; i < cap; i++) {
    const idx = page.photoIndices?.[i] ?? null
    const photo = idx == null ? null : libraryPhotos.value.find((p) => p.index === idx) ?? null
    slots.push(photo)
  }
  return slots
})

const clearSlot = (slotIndex: number) => {
  const page = activePage.value
  if (!page) return
  const existing = [...(page.photoIndices ?? [])]
  if (slotIndex < 0 || slotIndex >= existing.length) return
  existing.splice(slotIndex, 1)
  editorStore.setCurrentPagePhotoIndices(page.id, existing)
}

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
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.subtitle {
  margin: 8px 0 0;
  font-size: 14px;
  color: #6b7280;
}

.editor-layout {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  overflow: hidden;
}

.editor-content {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  width: 100%;
}

.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  align-items: start;
}

@media (max-width: 900px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }
}
</style>
