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
      <div class="save-status">
        <span :class="['save-indicator', saveStatusClass]"></span>
        <span>{{ saveStatusText }}</span>
      </div>
      <BaseButton variant="outline" size="sm" @click="onImport">📥 Importer</BaseButton>
      <BaseButton variant="secondary" size="sm" @click="onPreview">👁️ Prévisualiser</BaseButton>
      <BaseButton variant="primary" size="sm" @click="onExport">📤 Exporter</BaseButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useEditorStore } from '../../stores/editor.store'
import BaseButton from '../BaseButton.vue'

const editorStore = useEditorStore()
const projectTitle = ref('')

// Synchroniser le titre avec le store
watch(() => editorStore.currentTrip?.name, (newName) => {
  if (newName) projectTitle.value = newName
}, { immediate: true })

const saveStatusClass = computed(() => {
  switch (editorStore.autoSaveStatus) {
    case 'saving': return 'saving'
    case 'saved': return 'saved'
    default: return 'idle'
  }
})

const saveStatusText = computed(() => {
  switch (editorStore.autoSaveStatus) {
    case 'saving': return 'Enregistrement...'
    case 'saved': return 'Enregistré'
    default: return ''
  }
})

const onTitleBlur = () => {
  if (editorStore.currentTrip && projectTitle.value !== editorStore.currentTrip.name) {
    // Mise à jour du titre du voyage
    editorStore.currentTrip.name = projectTitle.value
    editorStore.triggerAutoSave()
  }
}

const onImport = () => {
  // Navigation vers la page d'import
  window.location.hash = '#/'
}

const onPreview = () => {
  // TODO: Ouvrir le viewer en mode preview
  console.log('Preview clicked')
}

const onExport = () => {
  // TODO: Déclencher l'export
  console.log('Export clicked')
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

.save-status {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 4px);
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #666);
}

.save-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border, #e0e0e0);
  transition: background 0.3s;
}

.save-indicator.saving {
  background: var(--color-warning, #f0ad00);
}

.save-indicator.saved {
  background: var(--color-success, #28a745);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .header-left {
    gap: var(--spacing-md, 16px);
  }
  
  .project-title {
    min-width: 150px;
    font-size: var(--font-size-base, 16px);
  }
  
  .save-status span {
    display: none;
  }
}
</style>
