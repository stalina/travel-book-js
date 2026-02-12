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
        <HeaderStats />
      <BaseButton
        variant="outline"
        size="sm"
        @click="onImport"
      >
        📥 Importer
      </BaseButton>
      <BaseButton
        variant="outline"
        size="sm"
        :loading="isSavingDraft"
        :disabled="!editorStore.currentTrip"
        @click="onSaveDraft"
      >
        💾 Sauvegarder
      </BaseButton>
      <BaseButton
        variant="primary"
        size="sm"
        :loading="editorStore.isExporting"
        :disabled="editorStore.isPreviewLoading"
        @click="onExport"
      >
        📤 Exporter
      </BaseButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useEditorStore } from '../../stores/editor.store'
import { useEditorGeneration } from '../../composables/useEditorGeneration'
import BaseButton from '../BaseButton.vue'
import SaveStatus from './SaveStatus.vue'
import HeaderStats from './HeaderStats.vue'

const editorStore = useEditorStore()
const projectTitle = ref('')
const isSavingDraft = ref(false)
const { exportTravelBook } = useEditorGeneration()

// Computed fallbacks so initial render and tests don't show undefined
const totalPhotos = computed(() => editorStore.totalPhotos ?? 0)
const totalSteps = computed(() => editorStore.totalSteps ?? 0)
const totalDays = computed(() => editorStore.totalDays ?? 0)
const estimatedPages = computed(() => editorStore.estimatedPages ?? 0)

// Synchroniser le titre avec le store
watch(() => editorStore.currentTrip?.name, (newName) => {
  if (newName) projectTitle.value = newName
}, { immediate: true })

const onTitleBlur = () => {
  if (projectTitle.value && editorStore.currentTrip && projectTitle.value !== editorStore.currentTrip.name) {
    // Use store method to update trip name so behavior is centralized
    editorStore.updateTripName(projectTitle.value)
  }
}

const onImport = () => {
  // Navigation vers la page d'import
  window.location.hash = '#/'
}

const onSaveDraft = async () => {
  if (isSavingDraft.value || !editorStore.currentTrip) return
  isSavingDraft.value = true
  try {
    await editorStore.saveDraftToStorage()
  } finally {
    isSavingDraft.value = false
  }
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
  height: var(--header-height, 64px);
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

.header-stats {
  display: flex;
  gap: var(--spacing-sm, 8px);
  align-items: center;
}

.header-stats .stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 6px;
  background: linear-gradient(135deg, var(--color-primary-light, #ffdede), var(--color-primary, #FF6B6B));
  color: white;
  border-radius: 6px;
  min-width: 48px;
  font-size: 13px;
  line-height: 1;
  flex-shrink: 0;
}

.header-stats .stat-value { font-weight: 700; }
.header-stats .stat-label { font-size: 12px; opacity: 0.9; }

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
