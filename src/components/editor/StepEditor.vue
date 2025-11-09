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
                <button class="nav-btn" :disabled="!canMoveLeft" @click="movePage(-1)" data-test="move-page-left">◀</button>
                <button class="nav-btn" :disabled="!canMoveRight" @click="movePage(1)" data-test="move-page-right">▶</button>
                <BaseButton variant="primary" size="sm" data-test="add-page" @click="addPage">Ajouter</BaseButton>
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
                :data-test="`page-chip-${idx + 1}`"
              >
                <div class="thumb-preview">
                  <div v-if="idx === 0" class="thumb-cover">
                    <!-- Render a miniature of the cover matching coverFormat -->
                    <div v-if="coverFormat === 'text-image'" class="mini-cover layout-preview cover-preview text-image" aria-hidden="true">
                      <div class="cover-text-block">
                        <div class="title-line small"></div>
                        <div class="subtitle-line xsmall"></div>
                      </div>
                      <div class="cover-thumb small-thumb"><div class="img-placeholder"></div></div>
                    </div>
                    <div v-else class="mini-cover layout-preview cover-preview text-only" aria-hidden="true">
                      <div class="cover-text-large">
                        <div class="title-line medium"></div>
                        <div class="subtitle-line small"></div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="thumb-grid">
                    <div class="mini-layout" aria-hidden="true">
                      <div :class="['layout-preview', previewClassFor[pageItem.layout]]">
                        <template v-if="pageItem.layout === 'grid-2x2'">
                          <span class="layout-block"></span>
                          <span class="layout-block"></span>
                          <span class="layout-block"></span>
                          <span class="layout-block"></span>
                        </template>
                        <template v-else-if="pageItem.layout === 'hero-plus-2'">
                          <span class="layout-block" style="grid-row: 1 / 3;"></span>
                          <span class="layout-block"></span>
                          <span class="layout-block"></span>
                        </template>
                        <template v-else-if="pageItem.layout === 'three-columns'">
                          <span class="layout-block"></span>
                          <span class="layout-block"></span>
                          <span class="layout-block"></span>
                        </template>
                        <template v-else>
                          <span class="layout-block"></span>
                        </template>
                      </div>
                    </div>
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
            <div v-if="isActivePageCover" class="options layout-options-row">
              <div class="layout-option-grid">
                <button
                  type="button"
                  class="layout-option-button"
                  :class="{ active: coverFormat === 'text-image' }"
                  @click="setCoverFormat('text-image')"
                  data-test="cover-text-image"
                >
                  <div class="layout-preview cover-preview text-image" aria-hidden="true">
                    <div class="cover-text-block">
                      <div class="title-line"></div>
                      <div class="subtitle-line"></div>
                    </div>
                    <div class="cover-thumb"><div class="img-placeholder"></div></div>
                  </div>
                  <div class="layout-option-content">
                    <span class="layout-option-label">Texte + Image</span>
                    <span class="layout-option-description">Texte à gauche, image à droite</span>
                  </div>
                </button>

                <button
                  type="button"
                  class="layout-option-button"
                  :class="{ active: coverFormat === 'text-only' }"
                  @click="setCoverFormat('text-only')"
                  data-test="cover-text-only"
                >
                  <div class="layout-preview cover-preview text-only" aria-hidden="true">
                    <div class="cover-text-large">
                      <div class="title-line large"></div>
                      <div class="subtitle-line small"></div>
                    </div>
                  </div>
                  <div class="layout-option-content">
                    <span class="layout-option-label">Texte pleine page</span>
                    <span class="layout-option-description">Texte occupant toute la largeur</span>
                  </div>
                </button>
              </div>
            </div>

            <!-- Photo layout -->
            <div v-else class="options layout-options-row">
              <div class="layout-option-grid">
                <button
                  v-for="opt in layoutOptions"
                  :key="opt.value"
                  type="button"
                  class="layout-option-button"
                  :class="{ active: opt.value === activeLayout }"
                  @click="selectLayout(opt.value)"
                  :data-test="`layout-option-${opt.value}`"
                >
                  <div :class="['layout-preview', previewClassFor[opt.value]]" aria-hidden="true">
                    <template v-if="opt.value === 'grid-2x2'">
                      <span class="layout-block"></span>
                      <span class="layout-block"></span>
                      <span class="layout-block"></span>
                      <span class="layout-block"></span>
                    </template>
                    <template v-else-if="opt.value === 'hero-plus-2'">
                      <span class="layout-block" style="grid-row: 1 / 3;"></span>
                      <span class="layout-block"></span>
                      <span class="layout-block"></span>
                    </template>
                    <template v-else-if="opt.value === 'three-columns'">
                      <span class="layout-block"></span>
                      <span class="layout-block"></span>
                      <span class="layout-block"></span>
                    </template>
                    <template v-else>
                      <span class="layout-block"></span>
                    </template>
                  </div>
                  <div class="layout-option-content">
                    <span class="layout-option-label">{{ opt.label }}</span>
                    <span class="layout-option-description">
                      {{ opt.value === 'grid-2x2' ? "Jusqu’à 4 photos en grille équilibrée" : opt.value === 'hero-plus-2' ? "Une photo principale et jusqu’à 2 secondaires" : opt.value === 'three-columns' ? "Trois portraits alignés verticalement" : "Une photo immersive occupant toute la page" }}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </section>

          <!-- Proposal (description + preview) -->
          <div class="proposal-section">
            <div class="proposal-meta" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <div></div>
              <BaseButton variant="ghost" size="sm" data-test="proposal-reset" @click="confirmResetOpen = true">Réinitialiser</BaseButton>
            </div>

            <!-- Conditional layout rules:
                 - Cover + text-image: show description + cover-photo selector side-by-side
                 - Cover + text-only: show description only
                 - Non-cover page: show photo selection only
            -->
            <div>
              <!-- Case: cover page -->
              <template v-if="isActivePageCover">
                <template v-if="coverFormat === 'text-image'">
                  <div class="two-column-layout">
                    <section class="section proposal-description">
                      <RichTextEditor :model-value="step?.description ?? ''" @update:model-value="updateDescription" />
                    </section>

                    <!-- Cover photo selector uses SelectedSlot component -->
                    <section class="section photo-selection-column">
                      <h4>Photo de couverture</h4>
                      <SelectedSlot
                        :photo="coverPhoto"
                        :slotIndex="0"
                        :slotNumber="1"
                        @openLibrary="openLibraryForSlot"
                        @edit="openPhotoEditor"
                        @clear="clearCover"
                      />
                    </section>
                  </div>
                </template>

                <template v-else>
                  <!-- coverFormat === 'text-only' -> description only -->
                  <section class="section proposal-description">
                    <RichTextEditor :model-value="step?.description ?? ''" @update:model-value="updateDescription" />
                  </section>
                </template>
              </template>

              <!-- Case: non-cover page -> show page photo selection full width -->
              <template v-else>
                <section v-if="activePage" class="section">
                  <h4>Sélection ({{ selectedPhotoIndices.length }} / {{ layoutCapacity }})</h4>
                  <div class="selected-grid">
                    <SelectedSlot
                      v-for="(slot, i) in pageSlots"
                      :key="i"
                      :photo="slot"
                      :slotIndex="i"
                      :slotNumber="i + 1"
                      @openLibrary="openLibraryForSlot"
                      @edit="openPhotoEditor"
                      @clear="clearSlot"
                    />
                  </div>
                </section>
              </template>
            </div>

            <!-- Aperçu (preview) -->
            <section class="section preview-section">
              <div class="preview-head">
                <h4>Aperçu à l'impression</h4>
                <div class="preview-actions">
                  <BaseButton size="sm" variant="ghost" data-test="preview-refresh" @click="refreshPreview">Rafraîchir</BaseButton>
                  <BaseButton size="sm" variant="secondary" @click="printPreview" :disabled="!previewHtml">Imprimer</BaseButton>
                </div>
              </div>

              <div v-if="isPreviewLoading" class="preview-loading">Génération en cours…</div>
              <iframe v-else class="preview-frame" :srcdoc="previewHtml"></iframe>

              <div class="preview-updated" v-if="previewUpdatedAt != null">Mis à jour: {{ formatDate(previewUpdatedAt) }}</div>
            </section>
          </div>

          <!-- Cover photo selection removed (now handled in the two-column layout using slot/popin) -->

          <!-- (photo selection moved into the two-column layout above) -->
        </div>

        <!-- Sidebar bibliothèque (hidden - library available via popin) -->
        <aside v-if="false" class="sidebar">
          <!-- Library is hidden in the editor main UI; open it via slot actions -->
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

    <!-- Photo library popin (used to pick a photo for a slot) -->
    <div v-if="libraryPopinOpen" class="modal-overlay active">
      <div class="photo-library-popin">
        <div class="popin-header">
          <div style="display:flex; gap:12px; align-items:center;">
            <h3 style="margin:0;">Bibliothèque de l'étape</h3>
            <span class="muted">{{ filteredPhotos.length }} / {{ libraryPhotos.length }}</span>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <input v-model="photoSearch" class="library-search" type="search" placeholder="Rechercher..." style="padding:6px 8px; border:1px solid #d1d5db; border-radius:6px;" />
            <div class="ratio-btns">
              <button v-for="opt in ratioOptions" :key="opt.value" :class="{ active: photoRatio === opt.value }" @click="setRatio(opt.value)">{{ opt.label }}</button>
            </div>
            <BaseButton variant="outline" size="sm" class="import-btn" @click="openUploadDialog">📥 Importer</BaseButton>
            <button class="btn-close" @click="closeLibrary">✕</button>
          </div>
        </div>
        <!-- hidden upload input triggered by the Importer button -->
        <input ref="uploadInput" type="file" accept="image/*" style="display:none" @change="handleUpload" />
        <div style="display:block; padding:12px;">
          <div class="popin-grid">
            <button v-for="photo in filteredPhotos" :key="photo.id" class="library-item" @click="selectPhotoForSlot(photo.index)">
              <img :src="photo.url" :alt="photo.name" />
              <div class="library-item-index">#{{ photo.index }}</div>
            </button>
          </div>
        </div>
      </div>
    </div>

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
import SelectedSlot from './SelectedSlot.vue'

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
  display: flex; /* make layout a flex container so content can stretch and scroll */
  flex-direction: row;
  align-items: stretch;
  overflow: hidden;
}

.editor-content {
  /* Allow the content area to grow and scroll within the editor-layout flex container.
     min-height:0 is required so that the flex child can shrink and allow overflow to work. */
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 24px;
  width: 100%;
}

.section {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  padding: 16px;
}

.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 16px;
  align-items: start;
}

.photo-selection-column {
  max-width: 360px;
}

@media (max-width: 900px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }
  .photo-selection-column { max-width: none; }
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
  overflow: hidden;
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
  height: 72px; /* reduced height (about half) to fit strip */
  background: #f3f4f6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;
  padding: 4px;
}

.thumb-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
}

.thumb-cover .mini-cover {
  width: 100%;
  max-width: 96px;
  height: 100%;
  padding: 4px;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.mini-cover .title-line.small { height: 8px; width: 50%; border-radius: 4px; }
.mini-cover .title-line.medium { height: 10px; width: 60%; border-radius: 6px; }
.mini-cover .subtitle-line.xsmall { height: 6px; width: 40%; border-radius: 4px; }

.small-thumb { min-width: 32px; height: 40px; border-radius: 6px; overflow: hidden; }

.thumb-grid { display: flex; gap: 6px; align-items: center; justify-content: center; flex-wrap: wrap; }
.thumb-grid .slot { width: 40px; height: 28px; background: linear-gradient(180deg,#eef2ff,#f8fbff); border-radius: 4px; }

.thumb-grid .slot {
  background: #d1d5db;
  border-radius: 2px;
}

.mini-layout .layout-preview {
  width: 96px;
  height: 56px;
  padding: 6px;
  box-sizing: border-box;
  border-radius: 6px;
  gap: 6px;
}

.mini-layout .layout-block {
  border-radius: 4px;
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

/* Photo library popin */
.modal-overlay.active {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.photo-library-popin {
  background: white;
  width: 900px;
  max-width: calc(100% - 40px);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(2,6,23,0.2);
}

.popin-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid #eef2f6; }
.popin-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; padding: 16px; max-height: 60vh; overflow:auto; }
.lib-photo img { width:100%; height:100%; object-fit:cover; border-radius:8px; }
.library-item {
  position: relative;
  aspect-ratio: 1;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  padding: 0;
  display: block;
}
.library-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.library-item .library-item-index {
  position: absolute;
  bottom: 6px;
  left: 6px;
  background: rgba(0,0,0,0.6);
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
}
.btn-close { background:transparent; border:none; font-size:18px; cursor:pointer; }

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
  width: 100%;
  display: block;
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

/* Layout card previews (professional look) */
.layout-options-row {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.layout-option {
  border: 2px solid #e6eefc;
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.12s ease-in-out;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
}

.layout-option:hover {
  border-color: #2b6ef6;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.08);
}

.layout-option.active {
  border-color: #2b6ef6;
  box-shadow: 0 12px 34px rgba(59, 130, 246, 0.14);
}

.layout-preview {
  aspect-ratio: 16 / 10;
  background: white;
  border-radius: 8px;
  margin-bottom: 8px;
  display: grid;
  gap: 4px;
  padding: 8px;
  box-sizing: border-box;
}

.layout-preview.grid-2x2 {
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.layout-preview.hero-side {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr;
}

.layout-preview .layout-block {
  background: #e6eefc;
  border-radius: 6px;
}

.layout-preview[style*="grid-template-columns: 1fr 1fr 1fr"] {
  grid-template-columns: 1fr 1fr 1fr;
}

.layout-preview[style*="grid-template-columns: 1fr;"] {
  grid-template-columns: 1fr;
}

.layout-name {
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: #0f172a;
}

/* Main-branch inspired option grid + button styles */
.layout-option-grid {
  display: flex;
  gap: 12px;
  flex-wrap: nowrap;
  overflow-x: auto;
}

.layout-option-button {
  border: 1px solid rgba(15,23,42,0.04);
  background: #fff;
  padding: 0;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 220px;
  transition: all 0.12s ease-in-out;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.04);
}

.layout-option-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(15,23,42,0.06);
}

.layout-option-button .layout-preview {
  background: linear-gradient(180deg,#fbfdff,#ffffff);
  border-radius: 8px;
  padding: 12px;
  box-shadow: none;
}

.layout-option-button .layout-block {
  display: block;
  background: linear-gradient(180deg,#eef2ff,#e6eefc);
  border-radius: 6px;
}

/* Hero: first block spans two rows to create vertical hero on the left */
.layout-preview.hero-side .layout-block:first-child {
  grid-row: 1 / span 2;
}

.layout-option-content {
  padding: 8px 10px;
  background: #fff;
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.layout-option-label {
  font-weight: 700;
  color: #0f172a;
}

.layout-option-description {
  font-size: 12px;
  color: #64748b;
}

/* preview variants matching main branch */
.layout-preview.grid-2x2 { grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 6px; }
.layout-preview.hero-side { grid-template-columns: 2fr 1fr; grid-template-rows: 1fr 1fr; gap: 6px; }
.layout-preview.three-columns { grid-template-columns: 1fr 1fr 1fr; gap: 6px; }
.layout-preview.full-page { grid-template-columns: 1fr; }

/* active state uses red accent like main branch */
.layout-option-button.active {
  border-color: #ef4444; /* red-500 */
  box-shadow: 0 14px 36px rgba(239, 68, 68, 0.12);
}

.layout-option-button.active .layout-preview {
  background: linear-gradient(180deg, rgba(254,228,226,0.6), rgba(255,246,245,0.6));
}

.layout-option-button.active .layout-block {
  background: linear-gradient(180deg, rgba(255,224,224,0.6), rgba(255,240,240,0.6));
}

/* Cover specific */
.cover-preview {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cover-preview.text-image {
  flex-direction: row;
  justify-content: space-between;
}

.cover-preview.text-image .cover-text-block {
  flex: 1 1 60%;
  padding-right: 12px;
}

.cover-preview.text-image .cover-thumb {
  width: 36%;
  min-width: 120px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(180deg,#eef2ff,#e6eefc);
}

.cover-preview.text-only {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-text-large {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.title-line.large { height: 22px; width: 70%; background: linear-gradient(180deg,#e6eefc,#eef6ff); border-radius:6px; }
.subtitle-line.small { height: 14px; width: 40%; background: linear-gradient(180deg,#f1f5f9,#f8fafc); border-radius:6px; }

.layout-option-button.active[data-test="cover-text-image"] .layout-preview {
  background: linear-gradient(180deg, rgba(254,228,226,0.6), rgba(255,246,245,0.6));
}

.layout-option-button.active[data-test="cover-text-only"] .layout-preview {
  background: linear-gradient(180deg, rgba(254,228,226,0.4), rgba(255,246,245,0.4));
}

.cover-text-block {
  flex: 1;
}

.cover-text-block .title-line {
  height: 14px;
  background: linear-gradient(90deg,#f3f6fb,#eef7ff);
  border-radius: 4px;
  margin-bottom: 8px;
}

.cover-text-block .subtitle-line {
  height: 10px;
  width: 60%;
  background: linear-gradient(90deg,#f7f9fc,#f2f8ff);
  border-radius: 4px;
}

.cover-text-large .title-line.large { height: 28px; width: 80%; }
.cover-text-large .subtitle-line.small { height: 12px; width: 50%; margin-top: 10px }

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

::v-deep(.import-btn) {
  border-radius: 28px !important;
  padding-left: 14px !important;
  padding-right: 14px !important;
  color: #ef4444 !important; /* red-500 */
  border-color: rgba(239,68,68,0.22) !important;
  background: linear-gradient(180deg, rgba(255,245,245,0.6), rgba(255,250,250,0.6));
  box-shadow: 0 6px 18px rgba(239,68,68,0.06);
}

::v-deep(.import-btn):hover {
  background: linear-gradient(180deg, rgba(255,230,230,0.9), rgba(255,245,245,0.9));
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
