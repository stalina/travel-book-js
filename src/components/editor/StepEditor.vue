<template>
  <div class="step-editor">
    <div v-if="!step" class="empty-state">
      <h2>Sélectionnez une étape</h2>
      <p>Choisissez une étape dans la liste pour commencer l'édition</p>
    </div>

    <div v-else class="editor-content">
      <StepTitleEditor
        :model-value="step.name"
        @update:model-value="updateTitle"
      />

      <section class="editor-section">
        <h3 class="section-title">📷 Photos</h3>
        <PhotoGrid
          :photos="stepPhotos"
          @add="handleAddPhoto"
          @edit="handleEditPhoto"
          @reorder="handleReorderPhoto"
          @delete="handleDeletePhoto"
        />
      </section>

      <section class="editor-section">
        <h3 class="section-title">✍️ Description</h3>
        <RichTextEditor
          :model-value="step.description"
          @update:model-value="updateDescription"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '../../stores/editor.store'
import StepTitleEditor from './StepTitleEditor.vue'
import PhotoGrid from './PhotoGrid.vue'
import RichTextEditor from './RichTextEditor.vue'

const editorStore = useEditorStore()

const step = computed(() => editorStore.currentStep)

// TODO: photosMapping sera géré dans une version future
const stepPhotos = computed(() => {
  // Pour l'instant, retourner un tableau vide
  // Dans le futur, on utilisera photosMapping[step.value.id]
  return []
})

const updateTitle = (newTitle: string) => {
  if (step.value) {
    editorStore.updateStepTitle(editorStore.currentStepIndex, newTitle)
  }
}

const updateDescription = (newDescription: string) => {
  if (step.value) {
    editorStore.updateStepDescription(editorStore.currentStepIndex, newDescription)
  }
}

const handleAddPhoto = () => {
  // TODO: Implémenter l'ajout de photo
  console.log('Add photo')
}

const handleEditPhoto = (index: number) => {
  // TODO: Implémenter l'édition de photo
  console.log('Edit photo', index)
}

const handleReorderPhoto = (index: number) => {
  // TODO: Implémenter la réorganisation de photo
  console.log('Reorder photo', index)
}

const handleDeletePhoto = (index: number) => {
  // TODO: Implémenter la suppression de photo
  console.log('Delete photo', index)
}
</script>

<style scoped>
.step-editor {
  height: 100%;
  overflow-y: auto;
  padding: var(--spacing-xl, 32px);
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

.editor-content {
  max-width: 900px;
  margin: 0 auto;
}

.editor-section {
  margin-bottom: var(--spacing-3xl, 64px);
}

.section-title {
  font-size: var(--font-size-xl, 20px);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-primary, #333);
  margin-bottom: var(--spacing-lg, 24px);
  padding-bottom: var(--spacing-sm, 8px);
  border-bottom: 2px solid var(--color-border, #e0e0e0);
}

@media (max-width: 768px) {
  .step-editor {
    padding: var(--spacing-lg, 24px);
  }
}
</style>
