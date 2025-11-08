<template>
  <div class="step-editor">
    <div v-if="!step" class="empty-state">
      <h2>Sélectionnez une étape</h2>
      <p>Choisissez une étape dans la liste pour commencer l'édition.</p>
    </div>

    <div v-else class="editor-layout">
      <header class="step-header">
        <StepTitleEditor
          :model-value="step.name"
          @update:model-value="updateTitle"
        />
      </header>

      <section class="editor-section proposal-section">
        <header class="section-header">
          <div class="section-actions">
            <!-- actions removed: regenerate / accept buttons intentionally retired -->
          </div>
          <p v-if="acceptedProposal" class="proposal-accepted">
            Dernière validation : {{ formatTimestamp(acceptedProposal.generatedAt) }}
          </p>
        </header>

        <div v-if="isProposalLoading" class="proposal-loading">
          <span class="spinner"></span>
          <p>Génération en cours…</p>
        </div>

        <div v-else-if="proposal" class="proposal-card">
          <div class="proposal-meta">
            <p class="proposal-summary">{{ proposal.summary }}</p>
            <p class="proposal-date">
              Généré le {{ formatTimestamp(proposal.generatedAt) }}
            </p>
          </div>
          <div class="proposal-description" v-html="proposal.description"></div>
          <ul class="proposal-stats">
            <li v-for="stat in proposal.stats" :key="stat.label">
              <span class="stat-label">{{ stat.label }}</span>
              <span class="stat-value">{{ stat.value }}</span>
            </li>
          </ul>
          <div v-if="proposal.photos.length" class="proposal-photos">
            <div
              v-for="photo in proposal.photos"
              :key="photo.id"
              class="proposal-photo"
              :class="{ cover: photo.isCover }"
            >
              <img :src="photo.url" :alt="photo.label" />
              <span class="proposal-photo-label">{{ photo.label }}</span>
              <span v-if="photo.isCover" class="proposal-photo-badge">Couverture</span>
            </div>
          </div>
        </div>

        <div v-else class="proposal-empty">
          <p>Aucune proposition disponible pour le moment.</p>
          <p class="proposal-hint">Cliquez sur « Régénérer » pour lancer une proposition.</p>
        </div>
      </section>

      <section class="editor-section pages-section">
        <header class="section-header">
          <h3 class="section-title">Pages &amp; mise en page</h3>
          <div class="section-actions">
            <BaseButton
              variant="secondary"
              size="sm"
              class="section-action-button"
              data-test="add-page"
              :disabled="!step"
              @click="addPage"
            >
              Ajouter une page
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              class="section-action-button"
              data-test="remove-page"
              :disabled="!activePage"
              @click="removeActivePage"
            >
              Supprimer la page
            </BaseButton>
          </div>
        </header>
        <div v-if="pages.length" class="pages-navigation">
          <div class="page-chips">
            <BaseButton
              v-for="(pageItem, index) in pages"
              :key="pageItem.id"
              variant="outline"
              size="sm"
              class="page-chip-button"
              :class="{ active: pageItem.id === activePageId }"
              :data-test="`page-chip-${index + 1}`"
              @click="selectPage(pageItem.id)"
            >
              Page {{ index + 1 }}
            </BaseButton>
          </div>
          <div class="page-reorder" v-if="pages.length > 1">
            <BaseButton
              variant="ghost"
              size="sm"
              class="page-reorder-button"
              data-test="move-page-left"
              :disabled="!canMoveLeft"
              aria-label="Déplacer la page vers la gauche"
              @click="movePage(-1)"
            >
              ◀
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              class="page-reorder-button"
              data-test="move-page-right"
              :disabled="!canMoveRight"
              aria-label="Déplacer la page vers la droite"
              @click="movePage(1)"
            >
              ▶
            </BaseButton>
          </div>
        </div>
        <div v-else class="pages-empty">
          <p>Aucune page configurée pour cette étape. Ajoutez une page pour commencer.</p>
        </div>

        <div v-if="activePage" class="page-configuration">
          <div class="layout-picker">
            <BaseCard class="layout-suggestions">
              <template #header>
                <div class="layout-suggestions-header">
                  <span class="layout-suggestions-icon" aria-hidden="true">🤖</span>
                  <div class="layout-suggestions-text">
                    <h4 class="layout-suggestions-title">Suggestions de mise en page intelligentes</h4>
                    <p class="layout-suggestions-subtitle">Choisissez un agencement optimisé selon le nombre de photos sélectionnées.</p>
                  </div>
                </div>
              </template>
              <div class="layout-option-grid">
                <button
                  v-for="option in layoutOptions"
                  :key="option.value"
                  type="button"
                  class="layout-option-button"
                  :data-test="`layout-option-${option.value}`"
                  :class="{ active: option.value === activeLayout }"
                  @click="selectLayout(option.value)"
                >
                  <div
                    class="layout-preview"
                    :class="`preview-${option.value}`"
                    aria-hidden="true"
                  >
                    <span
                      v-for="index in layoutPreviewBlocks[option.value]"
                      :key="`preview-${option.value}-${index}`"
                      class="layout-block"
                    ></span>
                  </div>
                  <div class="layout-option-content">
                    <span class="layout-option-label">{{ option.label }}</span>
                    <span class="layout-option-description">{{ option.description }}</span>
                  </div>
                </button>
              </div>
            </BaseCard>
          </div>

          <div class="page-photos">
            <div class="page-photos-content">
              <div class="selected-photos">
                <div class="selected-header">
                  <h4 class="page-subtitle">Sélection de la page</h4>
                  <p class="slot-hint">
                    {{ selectedPhotoIndices.length }} / {{ layoutCapacity }} photos
                  </p>
                </div>
                <p v-if="!libraryPhotos.length" class="page-helper">Aucune photo disponible pour cette étape.</p>
                <ul v-else class="selected-list">
                  <li
                    v-for="(selection, index) in selectedPhotoDetails"
                    :key="selection.photo.index"
                    class="selected-item"
                  >
                    <img
                      :src="selection.photo.url"
                      :alt="selection.photo.name"
                      :style="photoStyle(selection.photo.index)"
                    />
                    <div class="selected-meta">
                      <span class="selected-label">Slot {{ index + 1 }}</span>
                      <span class="selected-index">#{{ selection.photo.index }}</span>
                      <span class="selected-name">{{ selection.photo.name }}</span>
                    </div>
                    <button
                      type="button"
                      class="selected-edit"
                      :data-test="`page-photo-edit-${selection.photo.index}`"
                      @click="openPhotoEditor(selection.photo.index)"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      class="selected-remove"
                      @click="togglePhoto(selection.photo.index)"
                    >
                      ✕
                    </button>
                  </li>
                  <li
                    v-for="index in remainingSlots"
                    :key="`slot-${index}`"
                    class="selected-item empty"
                  >
                    <div class="empty-slot">Slot {{ selectedPhotoDetails.length + index }}</div>
                  </li>
                </ul>
              </div>

              <aside class="photo-library-panel">
                <header class="photo-library-header">
                  <div>
                    <h4 class="page-subtitle">Bibliothèque de l'étape</h4>
                    <p class="library-count">{{ filteredPhotos.length }} / {{ libraryPhotos.length }} photos</p>
                  </div>
                  <BaseButton
                    variant="outline"
                    size="sm"
                    class="upload-button"
                    @click="openUploadDialog"
                  >
                    📤 Importer
                  </BaseButton>
                  <input
                    ref="uploadInput"
                    type="file"
                    accept="image/*"
                    class="visually-hidden"
                    @change="handleUpload"
                  />
                </header>

                <div class="photo-library-filters">
                  <input
                    v-model="photoSearch"
                    type="search"
                    class="library-search"
                    placeholder="Rechercher une photo (nom ou #)"
                  />
                  <div class="ratio-filters">
                    <button
                      v-for="option in ratioOptions"
                      :key="option.value"
                      type="button"
                      class="ratio-button"
                      :class="{ active: photoRatio === option.value }"
                      @click="setRatio(option.value)"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </div>

                <div v-if="filteredPhotos.length" class="photo-library-grid">
                  <button
                    v-for="photo in filteredPhotos"
                    :key="photo.id"
                    type="button"
                    class="library-item"
                    :class="{ selected: selectedPhotoSet.has(photo.index) }"
                    :data-test="`page-photo-toggle-${photo.index}`"
                    @click="togglePhoto(photo.index)"
                  >
                    <img :src="photo.url" :alt="photo.name" :style="photoStyle(photo.index)" />
                    <div class="library-item-meta">
                      <span class="library-item-index">#{{ photo.index }}</span>
                      <span class="library-item-name">{{ photo.name }}</span>
                      <span class="library-item-ratio">{{ photo.ratio.toLowerCase() }}</span>
                    </div>
                  </button>
                </div>
                <p v-else class="no-results">Aucun résultat pour cette recherche.</p>
              </aside>
            </div>
          </div>

          <div class="cover-selector" v-if="libraryPhotos.length">
            <h4 class="page-subtitle">Photo de couverture</h4>
            <div class="cover-options">
              <button
                v-for="photo in libraryPhotos"
                :key="`cover-${photo.id}`"
                type="button"
                class="cover-option"
                :data-test="`cover-option-${photo.index}`"
                :class="{ active: isCover(photo.index) }"
                @click="toggleCover(photo.index)"
              >
                <img :src="photo.url" :alt="photo.name" :style="photoStyle(photo.index)" />
                <span class="cover-index">#{{ photo.index }}</span>
                <span v-if="isCover(photo.index)" class="cover-badge">Couverture</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="editor-section description-section">
        <h3 class="section-title">Description</h3>
        <RichTextEditor
          :model-value="step.description ?? ''"
          @update:model-value="updateDescription"
        />
      </section>

      <section class="editor-section preview-section">
        <header class="section-header">
          <h3 class="section-title">Aperçu de la page</h3>
          <BaseButton
            variant="outline"
            size="sm"
            class="section-action-button"
            data-test="preview-refresh"
            :disabled="isPreviewLoading"
            :loading="isPreviewLoading"
            @click="refreshPreview"
          >
            Actualiser
          </BaseButton>
        </header>

        <div class="preview-wrapper">
          <div v-if="isPreviewLoading" class="preview-loading">
            <span class="spinner"></span>
            <p>Préparation de l'aperçu…</p>
          </div>
          <iframe
            v-else-if="previewHtml"
            class="preview-frame"
            :srcdoc="previewHtml"
            title="Aperçu de l'étape"
          ></iframe>
          <p v-else class="preview-empty">
            Aperçu indisponible. Ajoutez une description ou des photos pour générer la page.
          </p>
        </div>

        <p v-if="previewUpdatedAt" class="preview-updated">
          Dernière génération : {{ previewUpdatedAt.toLocaleString('fr-FR') }}
        </p>
      </section>
    </div>

    <PhotoEditorModal
      v-if="modalPhoto"
      :photo="modalPhoto"
      :history="editedPhotoHistory ?? undefined"
      @apply="handlePhotoEditorApply"
      @close="closePhotoEditor"
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
import BaseCard from '../BaseCard.vue'

const layoutOptions: Array<{ value: StepPageLayout; label: string; description: string }> = [
  { value: 'grid-2x2', label: 'Grille 2 x 2', description: 'Jusqu’à 4 photos en grille équilibrée' },
  { value: 'hero-plus-2', label: 'Héro + 2', description: 'Une photo principale et jusqu’à 2 secondaires' },
  { value: 'three-columns', label: 'Trois colonnes', description: 'Trois portraits alignés verticalement' },
  { value: 'full-page', label: 'Plein format', description: 'Une photo immersive occupant toute la page' }
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

const step = computed(() => editorStore.currentStep)
const proposal = computed(() => editorStore.currentStepProposal)
const acceptedProposal = computed(() => editorStore.currentStepAcceptedProposal)
const isProposalLoading = computed(() => editorStore.isCurrentStepProposalLoading)
const gridPhotos = computed(() => editorStore.currentStepPhotos)
const previewHtml = computed(() => editorStore.currentStepPreviewHtml)
const previewUpdatedAt = computed(() => editorStore.currentStepPreviewUpdatedAt)
const isPreviewLoading = computed(() => editorStore.isCurrentStepPreviewLoading)
const pages = computed(() => editorStore.currentStepPages)
const activePage = computed(() => editorStore.currentStepActivePage)
const activePageId = computed(() => editorStore.currentStepActivePageId)
const libraryPhotos = computed(() => [...gridPhotos.value].sort((a, b) => a.index - b.index))
const activeLayout = computed<StepPageLayout | null>(() => activePage.value?.layout ?? null)
const activePageIndex = computed(() => pages.value.findIndex((page) => page.id === activePageId.value))
const canMoveLeft = computed(() => activePageIndex.value > 0)
const canMoveRight = computed(
  () => activePageIndex.value >= 0 && activePageIndex.value < pages.value.length - 1
)
const coverPhotoIndex = computed(() => editorStore.currentStepPageState?.coverPhotoIndex ?? null)
const activePhotoSet = computed(() => new Set(activePage.value?.photoIndices ?? []))
const selectedPhotoIndices = computed(() => activePage.value?.photoIndices ?? [])
const selectedPhotoSet = computed(() => new Set(selectedPhotoIndices.value))

const { query: photoSearch, ratio: photoRatio, filteredPhotos, setRatio } = usePhotoLibrary(libraryPhotos)

const layoutCapacity = computed(() => {
  if (!activeLayout.value) {
    return 0
  }
  return getLayoutCapacity(activeLayout.value)
})

const editedPhotoIndex = ref<number | null>(null)

const editedPhoto = computed(() => {
  if (editedPhotoIndex.value == null) {
    return null
  }
  return libraryPhotos.value.find((photo) => photo.index === editedPhotoIndex.value) ?? null
})

const modalPhoto = computed<GalleryPhoto | null>(() => {
  const photo = editedPhoto.value
  const currentStepValue = step.value
  if (!photo || !currentStepValue) {
    return null
  }

  const file = photo.file ?? new File([], photo.name, { type: 'image/jpeg' })
  const orientation = photo.width === photo.height
    ? 'square'
    : photo.width > photo.height
    ? 'landscape'
    : 'portrait'

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
  if (!editedPhoto.value) {
    return null
  }
  return editorStore.getCurrentStepPhotoHistory(editedPhoto.value.index)
})

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
  if (!selectedPhotoIndices.value.length) {
    return [] as Array<{ position: number; photo: (typeof libraryPhotos.value)[number] }>
  }
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



const refreshPreview = () => {
  void editorStore.regenerateCurrentStepPreview()
}

const addPage = () => {
  editorStore.addPageToCurrentStep('grid-2x2')
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

const isPhotoSelected = (photoIndex: number) => {
  return activePhotoSet.value.has(photoIndex)
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
  if (!editedPhoto.value) {
    return
  }
  editorStore.applyAdjustmentsToCurrentPhoto(editedPhoto.value.index, payload.state, payload.history ?? undefined)
  closePhotoEditor()
}

const openUploadDialog = () => {
  uploadInput.value?.click()
}

const handleUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = input.files
  if (!files?.length) {
    return
  }
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

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('fr-FR')
}
</script>

<style scoped>
.step-editor {
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-xl, 32px);
  background: var(--color-surface, #fafafa);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: var(--color-text-secondary, #666);
}

.empty-state h2 {
  font-size: var(--font-size-2xl, 24px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, #333);
  margin-bottom: var(--spacing-sm, 8px);
}

.empty-state p {
  font-size: var(--font-size-base, 16px);
  margin: 0;
}

.editor-layout {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl, 48px);
  max-width: 960px;
  margin: 0 auto;
}

.editor-section {
  background: var(--color-surface-elevated, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: var(--spacing-xl, 32px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.step-header {
  background: none;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
  margin-bottom: var(--spacing-lg, 24px);
}

.section-title {
  font-size: var(--font-size-xl, 20px);
  font-weight: var(--font-weight-semibold, 600);
  margin: 0;
  color: var(--color-text-primary, #1f2933);
}

.section-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
}

.section-action-button {
  min-width: 160px;
}

.pages-navigation {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-md, 16px);
}

.page-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm, 8px);
}

.page-chip-button {
  border: 1px solid var(--color-border, #e5e7eb);
  background: var(--color-surface, #fff);
  color: var(--color-text-primary, #1f2937);
  border-radius: var(--radius-full, 999px);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(15, 23, 42, 0.08));
  font-weight: var(--font-weight-medium, 500);
  transition: all var(--transition-base, 250ms ease);
}

.page-chip-button:not(:disabled):hover {
  border-color: var(--color-primary, #ff6b6b);
  color: var(--color-primary, #ff6b6b);
  box-shadow: var(--shadow-md, 0 4px 6px rgba(15, 23, 42, 0.1));
}

.page-chip-button.active {
  border-color: transparent;
  color: var(--color-text-inverse, #fff);
  background: linear-gradient(135deg, var(--color-primary, #ff6b6b), var(--color-primary-dark, #e84545));
  box-shadow: var(--shadow-md, 0 8px 12px rgba(232, 69, 69, 0.3));
}

.page-reorder {
  display: flex;
  gap: var(--spacing-xs, 8px);
}

.page-reorder-button {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md, 10px);
  background: var(--color-surface, #fff);
  border: 1px solid var(--color-border, #e5e7eb);
  color: var(--color-text-primary, #1f2937);
  box-shadow: var(--shadow-sm, 0 1px 2px rgba(15, 23, 42, 0.08));
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-semibold, 600);
  padding: 0;
}

.page-reorder-button:not(:disabled):hover {
  background: linear-gradient(135deg, rgba(78, 205, 196, 0.15), rgba(78, 205, 196, 0.25));
  border-color: transparent;
}

.page-reorder-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-configuration {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl, 32px);
}

.layout-picker {
  display: flex;
  flex-direction: column;
}

.layout-suggestions {
  box-shadow: var(--shadow-lg, 0 10px 25px rgba(15, 23, 42, 0.08));
  background: var(--color-surface, #fff);
  border-radius: var(--radius-xl, 20px);
}

.layout-suggestions :deep(.card-body) {
  padding: var(--spacing-xl, 32px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
}

.layout-suggestions-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
}

.layout-suggestions-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg, 16px);
  background: linear-gradient(135deg, var(--color-secondary, #4ECDC4), var(--color-secondary-dark, #3DB8AF));
  font-size: 24px;
  box-shadow: var(--shadow-md, 0 4px 12px rgba(77, 208, 189, 0.4));
}

.layout-suggestions-title {
  margin: 0;
  font-size: var(--font-size-xl, 20px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-primary, #1a1f36);
}

.layout-suggestions-subtitle {
  margin: 0;
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #697386);
}

.layout-option-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing-lg, 24px);
}

.layout-option-button {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-lg, 24px);
  border-radius: var(--radius-xl, 20px);
  border: 2px solid transparent;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.9));
  box-shadow: inset 0 0 0 1px var(--color-border-light, #f0f2f4);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-base, 250ms ease);
}

.layout-option-button:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg, 0 12px 24px rgba(15, 23, 42, 0.08));
  border-color: rgba(255, 107, 107, 0.35);
}

.layout-option-button.active {
  border-color: var(--color-primary, #ff6b6b);
  box-shadow: 0 16px 32px rgba(255, 107, 107, 0.15);
  background: linear-gradient(180deg, rgba(255, 255, 255, 1), rgba(255, 241, 241, 0.9));
}

.layout-preview {
  position: relative;
  aspect-ratio: 16 / 10;
  padding: var(--spacing-sm, 12px);
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 16px);
  display: grid;
  gap: var(--spacing-xs, 8px);
  box-shadow: inset 0 0 0 1px var(--color-border-light, #f0f2f4);
}

.layout-preview .layout-block {
  border-radius: var(--radius-md, 12px);
  background: linear-gradient(135deg, rgba(226, 232, 240, 0.9), rgba(203, 213, 225, 0.9));
  transition: background var(--transition-fast, 150ms ease);
}

.layout-option-button:hover .layout-block,
.layout-option-button.active .layout-block {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 107, 107, 0.35));
}

.preview-grid-2x2 {
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
}

.preview-hero-plus-2 {
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, 1fr);
}

.preview-hero-plus-2 .layout-block:first-child {
  grid-row: 1 / span 2;
}

.preview-three-columns {
  grid-template-columns: repeat(3, 1fr);
}

.preview-three-columns .layout-block {
  aspect-ratio: 2 / 3;
}

.preview-full-page {
  display: flex;
}

.preview-full-page .layout-block {
  width: 100%;
  border-radius: var(--radius-lg, 16px);
}

.layout-option-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 8px);
}

.layout-option-label {
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-primary, #1a1f36);
}

.layout-option-description {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #697386);
}

.page-photos {
  background: var(--color-surface-subtle, #f8fafc);
  border-radius: var(--radius-lg, 16px);
  padding: var(--spacing-lg, 24px);
}

.page-photos-content {
  display: flex;
  gap: var(--spacing-xl, 32px);
  flex-wrap: wrap;
}

.selected-photos {
  flex: 1 1 260px;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

.selected-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.slot-hint {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-tertiary, #9ca3af);
  margin: 0;
}

.selected-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm, 12px);
}

.selected-item {
  display: grid;
  grid-template-columns: 80px 1fr auto auto;
  gap: var(--spacing-md, 16px);
  align-items: center;
  padding: var(--spacing-md, 16px);
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 12px);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05);
}

.selected-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-md, 8px);
}

.selected-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.selected-label {
  font-size: var(--font-size-xs, 12px);
  font-weight: var(--font-weight-semibold, 600);
  text-transform: uppercase;
  color: var(--color-text-tertiary, #9ca3af);
}

.selected-index {
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-primary, #2563eb);
}

.selected-name {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #4b5563);
}

.selected-edit,
.selected-remove {
  border: none;
  font-size: var(--font-size-lg, 18px);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full, 999px);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.selected-edit {
  background: rgba(37, 99, 235, 0.12);
  color: var(--color-primary, #2563eb);
}

.selected-edit:hover {
  background: rgba(37, 99, 235, 0.2);
}

.selected-remove {
  background: rgba(239, 68, 68, 0.12);
  color: #e11d48;
}

.selected-remove:hover {
  background: rgba(239, 68, 68, 0.2);
}

.selected-item.empty {
  grid-template-columns: 1fr;
  justify-content: center;
  text-align: center;
  color: var(--color-text-tertiary, #9ca3af);
  font-style: italic;
}

.empty-slot {
  font-size: var(--font-size-sm, 14px);
}

.photo-library-panel {
  flex: 2 1 340px;
  min-width: 320px;
  background: var(--color-surface, #fff);
  border-radius: var(--radius-lg, 16px);
  padding: var(--spacing-lg, 24px);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
}

.photo-library-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-md, 16px);
}

.library-count {
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-tertiary, #9ca3af);
  margin: 0;
}

.upload-button {
  white-space: nowrap;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

.photo-library-filters {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

.library-search {
  width: 100%;
  padding: 10px 16px;
  border: 1px solid var(--color-border, #e5e7eb);
  border-radius: var(--radius-md, 10px);
  font-size: var(--font-size-sm, 14px);
  transition: border-color 0.2s ease;
}

.library-search:focus {
  outline: none;
  border-color: var(--color-primary, #2563eb);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.ratio-filters {
  display: flex;
  gap: var(--spacing-sm, 8px);
  flex-wrap: wrap;
}

.ratio-button {
  flex: 1 1 auto;
  padding: 8px 12px;
  border-radius: var(--radius-full, 999px);
  border: 1px solid var(--color-border, #e5e7eb);
  background: transparent;
  cursor: pointer;
  font-size: var(--font-size-xs, 12px);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;
}

.ratio-button.active {
  border-color: var(--color-primary, #2563eb);
  background: rgba(37, 99, 235, 0.12);
  color: var(--color-primary, #2563eb);
}

.photo-library-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md, 16px);
}

.library-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 8px);
  border: 1px solid transparent;
  border-radius: var(--radius-lg, 14px);
  overflow: hidden;
  background: var(--color-surface-subtle, #f1f5f9);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.library-item:hover {
  transform: translateY(-2px);
  border-color: var(--color-primary, #2563eb);
  box-shadow: 0 10px 20px rgba(37, 99, 235, 0.12);
}

.library-item.selected {
  border-color: var(--color-primary, #2563eb);
  background: rgba(37, 99, 235, 0.1);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
}

.library-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.library-item-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px 12px;
  font-size: var(--font-size-xs, 12px);
  color: var(--color-text-secondary, #4b5563);
}

.library-item-index {
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-primary, #2563eb);
}

.library-item-name {
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
}

.library-item-ratio {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-tertiary, #9ca3af);
}

.no-results {
  margin: 0;
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-tertiary, #9ca3af);
  text-align: center;
}

.proposal-accepted {
  margin: 0;
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #6b7280);
}

.proposal-loading,
.proposal-empty,
.preview-loading,
.preview-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm, 8px);
  padding: var(--spacing-xl, 32px);
  border: 1px dashed var(--color-border, #d6d6d6);
  border-radius: var(--radius-md, 12px);
  color: var(--color-text-secondary, #6b7280);
  text-align: center;
}

.proposal-card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 24px);
}

.proposal-meta {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 6px);
}

.proposal-summary {
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-medium, 500);
  margin: 0;
  color: var(--color-text-primary, #1f2933);
}

.proposal-date {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-tertiary, #9ca3af);
  margin: 0;
}

.proposal-description {
  line-height: 1.6;
  color: var(--color-text-primary, #1f2933);
}

.proposal-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--spacing-md, 16px);
  padding: 0;
  margin: 0;
  list-style: none;
}

.proposal-stats li {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xxs, 4px);
  padding: var(--spacing-md, 16px);
  background: var(--color-surface-subtle, #f8fafc);
  border-radius: var(--radius-md, 12px);
}

.stat-label {
  font-size: var(--font-size-xs, 12px);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-tertiary, #9ca3af);
}

.stat-value {
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-primary, #1f2933);
}

.proposal-photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--spacing-md, 16px);
}

.proposal-photo {
  position: relative;
  border-radius: var(--radius-md, 12px);
  overflow: hidden;
  background: var(--color-surface-subtle, #f8fafc);
  border: 1px solid transparent;
}

.proposal-photo.cover {
  border-color: var(--color-primary, #2563eb);
}

.proposal-photo img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  display: block;
}

.proposal-photo-label {
  display: block;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #4b5563);
}

.proposal-photo-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: var(--color-primary, #2563eb);
  color: #fff;
  font-size: var(--font-size-xs, 12px);
  padding: 4px 10px;
  border-radius: 999px;
}

.preview-wrapper {
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: var(--radius-lg, 16px);
  overflow: hidden;
  background: var(--color-surface-subtle, #f8fafc);
  min-height: 320px;
}

.preview-frame {
  width: 100%;
  min-height: 480px;
  border: none;
  background: #fff;
}

.preview-updated {
  margin-top: var(--spacing-md, 16px);
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #6b7280);
  text-align: right;
}

.spinner {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid rgba(37, 99, 235, 0.2);
  border-top-color: var(--color-primary, #2563eb);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .step-editor {
    padding: var(--spacing-lg, 24px);
  }

  .editor-layout {
    gap: var(--spacing-xl, 32px);
  }

  .editor-section {
    padding: var(--spacing-lg, 24px);
  }

  .section-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .section-action-button {
    width: 100%;
  }

  .page-photos-content {
    flex-direction: column;
  }

  .photo-library-panel {
    width: 100%;
  }
}
</style>
