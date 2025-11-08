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
          <h3 class="section-title">Proposition automatique</h3>
          <div class="section-actions">
            <button
              class="secondary"
              type="button"
              :disabled="isProposalLoading"
              @click="regenerateProposal"
            >
              Régénérer
            </button>
            <button
              class="primary"
              type="button"
              :disabled="isAcceptDisabled"
              @click="acceptProposal"
            >
              Valider la proposition
            </button>
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

      <section class="editor-section photos-section">
        <h3 class="section-title">Photos sélectionnées</h3>
        <PhotoGrid
          :photos="gridPhotos"
          @add="handleAddPhoto"
          @edit="handleEditPhoto"
          @reorder="handleReorderPhoto"
          @delete="handleDeletePhoto"
        />
      </section>

      <section class="editor-section pages-section">
        <header class="section-header">
          <h3 class="section-title">Pages &amp; mise en page</h3>
          <div class="section-actions">
            <button
              class="secondary"
              type="button"
              data-test="add-page"
              :disabled="!step"
              @click="addPage"
            >
              Ajouter une page
            </button>
            <button
              class="ghost"
              type="button"
              data-test="remove-page"
              :disabled="!activePage"
              @click="removeActivePage"
            >
              Supprimer la page
            </button>
          </div>
        </header>

        <div v-if="pages.length" class="pages-navigation">
          <div class="page-chips">
            <button
              v-for="(pageItem, index) in pages"
              :key="pageItem.id"
              :data-test="`page-chip-${index + 1}`"
              type="button"
              class="page-chip"
              :class="{ active: pageItem.id === activePageId }"
              @click="selectPage(pageItem.id)"
            >
              Page {{ index + 1 }}
            </button>
          </div>
          <div class="page-reorder" v-if="pages.length > 1">
            <button
              class="icon-button"
              type="button"
              data-test="move-page-left"
              :disabled="!canMoveLeft"
              @click="movePage(-1)"
            >
              ◀
            </button>
            <button
              class="icon-button"
              type="button"
              data-test="move-page-right"
              :disabled="!canMoveRight"
              @click="movePage(1)"
            >
              ▶
            </button>
          </div>
        </div>
        <div v-else class="pages-empty">
          <p>Aucune page configurée pour cette étape. Ajoutez une page pour commencer.</p>
        </div>

        <div v-if="activePage" class="page-configuration">
          <div class="layout-picker">
            <h4 class="page-subtitle">Mise en page</h4>
            <div class="layout-options">
              <button
                v-for="option in layoutOptions"
                :key="option.value"
                type="button"
                class="layout-option"
                :data-test="`layout-option-${option.value}`"
                :class="{ active: option.value === activeLayout }"
                @click="selectLayout(option.value)"
              >
                <span class="layout-option-label">{{ option.label }}</span>
                <span class="layout-option-description">{{ option.description }}</span>
              </button>
            </div>
          </div>

          <div class="page-photos">
            <h4 class="page-subtitle">Photos de la page</h4>
            <p v-if="!orderedPhotos.length" class="page-helper">Aucune photo disponible pour cette étape.</p>
            <div v-else class="page-photos-grid">
              <button
                v-for="photo in orderedPhotos"
                :key="photo.id"
                type="button"
                class="page-photo-toggle"
                :data-test="`page-photo-toggle-${photo.index}`"
                :class="{ selected: isPhotoSelected(photo.index) }"
                @click="togglePhoto(photo.index)"
              >
                <img :src="photo.url" :alt="photo.name" />
                <span class="page-photo-index">#{{ photo.index }}</span>
              </button>
            </div>
          </div>

          <div class="cover-selector" v-if="orderedPhotos.length">
            <h4 class="page-subtitle">Photo de couverture</h4>
            <div class="cover-options">
              <button
                v-for="photo in orderedPhotos"
                :key="`cover-${photo.id}`"
                type="button"
                class="cover-option"
                :data-test="`cover-option-${photo.index}`"
                :class="{ active: isCover(photo.index) }"
                @click="toggleCover(photo.index)"
              >
                <img :src="photo.url" :alt="photo.name" />
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
          <button
            class="secondary"
            type="button"
            :disabled="isPreviewLoading"
            @click="refreshPreview"
          >
            Actualiser
          </button>
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
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
import { useEditorStore } from '../../stores/editor.store'
import type { StepPageLayout } from '../../models/editor.types'

const layoutOptions: Array<{ value: StepPageLayout; label: string; description: string }> = [
  { value: 'grid-2x2', label: 'Grille 2 x 2', description: 'Jusqu’à 4 photos en grille équilibrée' },
  { value: 'hero-plus-2', label: 'Héro + 2', description: 'Une photo principale et jusqu’à 2 secondaires' },
  { value: 'three-columns', label: 'Trois colonnes', description: 'Trois portraits alignés verticalement' },
  { value: 'full-page', label: 'Plein format', description: 'Une photo immersive occupant toute la page' }
]

const StepTitleEditor = defineAsyncComponent(async () => {
  const module = (await import('./StepTitleEditor.vue')) as any
  return module.default ?? module
})

const PhotoGrid = defineAsyncComponent(async () => {
  const module = (await import('./PhotoGrid.vue')) as any
  return module.default ?? module
})

const RichTextEditor = defineAsyncComponent(async () => {
  const module = (await import('./RichTextEditor.vue')) as any
  return module.default ?? module
})

const editorStore = useEditorStore()

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
const orderedPhotos = computed(() => [...gridPhotos.value].sort((a, b) => a.index - b.index))
const activeLayout = computed<StepPageLayout | null>(() => activePage.value?.layout ?? null)
const activePageIndex = computed(() => pages.value.findIndex((page) => page.id === activePageId.value))
const canMoveLeft = computed(() => activePageIndex.value > 0)
const canMoveRight = computed(
  () => activePageIndex.value >= 0 && activePageIndex.value < pages.value.length - 1
)
const coverPhotoIndex = computed(() => editorStore.currentStepPageState?.coverPhotoIndex ?? null)
const activePhotoSet = computed(() => new Set(activePage.value?.photoIndices ?? []))

const isAcceptDisabled = computed(() => {
  if (isProposalLoading.value) {
    return true
  }
  if (!proposal.value) {
    return true
  }
  return acceptedProposal.value?.generatedAt === proposal.value.generatedAt
})

const updateTitle = (newTitle: string) => {
  if (!step.value) return
  editorStore.updateStepTitle(editorStore.currentStepIndex, newTitle)
}

const updateDescription = (newDescription: string) => {
  if (!step.value) return
  editorStore.updateStepDescription(editorStore.currentStepIndex, newDescription)
}

const regenerateProposal = () => {
  void editorStore.regenerateCurrentStepProposal()
}

const acceptProposal = () => {
  editorStore.acceptCurrentStepProposal()
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
  const next = new Set(activePhotoSet.value)
  if (next.has(photoIndex)) {
    next.delete(photoIndex)
  } else {
    next.add(photoIndex)
  }
  const sorted = Array.from(next)
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value))
    .sort((a, b) => a - b)
  editorStore.setCurrentPagePhotoIndices(page.id, sorted)
}

const isCover = (photoIndex: number) => coverPhotoIndex.value === photoIndex

const toggleCover = (photoIndex: number) => {
  if (coverPhotoIndex.value === photoIndex) {
    editorStore.setCurrentStepCoverPhotoIndex(null)
  } else {
    editorStore.setCurrentStepCoverPhotoIndex(photoIndex)
  }
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('fr-FR')
}

const handleAddPhoto = () => {
  // TODO: Implémenter l'ajout de photo dans l'éditeur
  console.log('Add photo')
}

const handleEditPhoto = (index: number) => {
  // TODO: Implémenter l'édition de photo dans l'éditeur
  console.log('Edit photo', index)
}

const handleReorderPhoto = (index: number) => {
  // TODO: Implémenter la réorganisation de photo dans l'éditeur
  console.log('Reorder photo', index)
}

const handleDeletePhoto = (index: number) => {
  // TODO: Implémenter la suppression de photo dans l'éditeur
  console.log('Delete photo', index)
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

.section-actions button {
  min-width: 160px;
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

  .section-actions button {
    width: 100%;
  }
}
</style>
