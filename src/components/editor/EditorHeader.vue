<template>
  <header class="editor-header">
    <div class="header-left">
      <div class="logo">✈️ Travel Book</div>
      <input 
        v-model="projectTitle"
        class="project-title" 
        type="text"
        placeholder="Titre du voyage..."
        @blur="onTitleBlur"
      />
    </div>
    <div class="header-right">
      <SaveStatus 
        :status="editorStore.autoSaveStatus"
        :last-save-time="editorStore.lastSaveTime"
      />
      <BaseButton
        variant="outline"
        size="sm"
        @click="onImport"
      >📥 Importer</BaseButton>
      <BaseButton
        variant="secondary"
        size="sm"
        :loading="editorStore.isPreviewLoading"
        :disabled="editorStore.isExporting"
        @click="onPreview"
      >👁️ Prévisualiser</BaseButton>
      <BaseButton
        variant="primary"
        size="sm"
        :loading="editorStore.isExporting"
        :disabled="editorStore.isPreviewLoading"
        @click="onExport"
      >📤 Exporter</BaseButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEditorStore } from '../../stores/editor.store'
import { useEditorGeneration } from '../../composables/useEditorGeneration'
import BaseButton from '../BaseButton.vue'
import SaveStatus from './SaveStatus.vue'

const editorStore = useEditorStore()
const projectTitle = ref('')
const { previewTravelBook, exportTravelBook } = useEditorGeneration()

// Synchroniser le titre avec le store
watch(() => editorStore.currentTrip?.name, (newName) => {
  if (newName) projectTitle.value = newName
}, { immediate: true })

const onTitleBlur = () => {
  if (editorStore.currentTrip && projectTitle.value !== editorStore.currentTrip.name) {
    // Mise à jour du titre du voyage
    editorStore.currentTrip.name = projectTitle.value
    editorStore.triggerAutoSave()
    editorStore.markPreviewStale()
  }
}

const onImport = () => {
  // Navigation vers la page d'import
  window.location.hash = '#/'
}

const onPreview = async () => {
  await previewTravelBook()
}

const onExport = async () => {
  await exportTravelBook()
}

</script>

<style scoped>
.editor-header {
  grid-area: header;
  background: white;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-lg, 24px);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg, 24px);
}

.logo {
  font-size: var(--font-size-xl, 20px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-primary, #FF6B6B);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 8px);
  user-select: none;
}

.project-title {
  font-size: var(--font-size-lg, 18px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-primary, #333);
  padding: var(--spacing-xs, 4px) var(--spacing-md, 16px);
  border-radius: var(--radius-md, 8px);
  border: 1px solid transparent;
  background: transparent;
  transition: all 0.2s;
  min-width: 200px;
}

.project-title:hover {
  border-color: var(--color-border, #e0e0e0);
  background: var(--color-background, #f5f5f5);
}

.project-title:focus {
  outline: none;
  border-color: var(--color-primary, #FF6B6B);
  background: white;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
}

@media (max-width: 768px) {
  .header-left {
    gap: var(--spacing-md, 16px);
  }
  
  .project-title {
    min-width: 150px;
    font-size: var(--font-size-base, 16px);
  }
}
</style>
