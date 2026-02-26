<template>
  <div class="editor-layout" :style="layoutStyle">
    <EditorHeader />
    <EditorSidebar>
      <template #default="{ activeTab }">
        <StepList v-if="activeTab === 'steps'" />
        <div v-else-if="activeTab === 'themes'" class="themes-panel">
          <ThemeSelector />
          <ThemeCustomizer />
        </div>
        <div v-else>
          <p>Options (à venir)</p>
        </div>
      </template>
    </EditorSidebar>
    <main class="editor-main">
      <StepEditor />

      <div v-if="!editorStore.currentTrip" class="editor-placeholder">
        <div class="placeholder-content">
          <h2>Aucun voyage chargé</h2>
          <p>Importez un fichier GPX/ZIP ou revenez à l'accueil pour sélectionner un voyage.</p>
          <BaseButton variant="primary" size="sm" @click="goHome">📥 Importer</BaseButton>
        </div>
      </div>
    </main>
    <PreviewPanel />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, nextTick, computed } from 'vue'
import { useEditorStore } from '../stores/editor.store'
import { useTripStore } from '../stores/trip.store'
import { useHistory } from '../composables/useHistory'
import EditorHeader from '../components/editor/EditorHeader.vue'
import EditorSidebar from '../components/editor/EditorSidebar.vue'
import PreviewPanel from '../components/editor/PreviewPanel.vue'
import StepList from '../components/editor/StepList.vue'
import StepEditor from '../components/editor/StepEditor.vue'
import ThemeSelector from '../components/editor/ThemeSelector.vue'
import ThemeCustomizer from '../components/editor/ThemeCustomizer.vue'
import BaseButton from '../components/BaseButton.vue'
import { useEditorGeneration } from '../composables/useEditorGeneration'
import type { Trip } from '../models/types'
import { analyticsService } from '../services/analytics.service'

const editorStore = useEditorStore()
const tripStore = useTripStore()
const { previewTravelBook } = useEditorGeneration()

// Use store flag to adjust layout (preview column width)
const layoutStyle = computed(() => ({
  '--editor-preview-width': editorStore.isPreviewOpen ? '400px' : '0px'
}))

// Undo/Redo avec useHistory
const {
  canUndo,
  canRedo,
  record
} = useHistory<Trip | null>({
  maxSize: 20,
  initialState: null,
  onApply: (state) => {
    if (state) {
      editorStore.setTrip(state)
    }
  }
})

// Enregistrer les changements dans l'historique
watch(() => editorStore.currentTrip, (newTrip, oldTrip) => {
  if (oldTrip && newTrip && oldTrip !== newTrip) {
    // Clone deep pour éviter les références
    const beforeState = JSON.parse(JSON.stringify(oldTrip))
    const afterState = JSON.parse(JSON.stringify(newTrip))
    record(beforeState, afterState, 'Trip update')
  }
}, { deep: true })

onMounted(async () => {
  // Si on a déjà un voyage parsé dans le tripStore, on l'utilise
  if (tripStore.hasParsedTrip && tripStore.parsedTrip) {
    // Le Trip a déjà été chargé et passé à l'editor par HomeView
    // Tracker l'ouverture de l'éditeur avec le nombre d'étapes
    const stepCount = tripStore.parsedTrip.steps?.length || 0
    analyticsService.trackEditorOpened(stepCount)
    return
  }
  
  // Sinon, si on a un input mais pas de Trip parsé (accès direct à /editor)
  if (tripStore.hasInput && !tripStore.hasParsedTrip) {
    await tripStore.parseAndMap()
    const trip = tripStore.parsedTrip
    if (trip) {
      editorStore.setTrip(trip)
      // Tracker l'ouverture de l'éditeur avec le nombre d'étapes
      const stepCount = trip.steps?.length || 0
      analyticsService.trackEditorOpened(stepCount)
    }
  }
})

// No global event listener required; layoutStyle reads store directly

  // Lancer en tâche de fond la génération des previews pour toutes les étapes
  const generateAllPreviewsInBackground = async () => {
    const trip = editorStore.currentTrip
    if (!trip?.steps?.length) return
    // Garder l'index courant pour restaurer ensuite
    const originalIndex = editorStore.currentStepIndex
    for (let i = 0; i < trip.steps.length; i++) {
      try {
        editorStore.setCurrentStep(i)
        // Attendre la génération de la preview pour l'étape
        // eslint-disable-next-line no-await-in-loop
        await editorStore.regenerateCurrentStepPreview()
        // Petite pause pour libérer le thread UI
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 200))
      } catch {
        // noop - on continue la génération des autres étapes
      }
    }
    // Restaurer l'étape initiale
    editorStore.setCurrentStep(originalIndex)
  }

  // Démarrer sans await pour ne pas bloquer l'UI
  void generateAllPreviewsInBackground()

  // Lancer la génération de la prévisualisation globale lorsque
  // le voyage est initialisé (important pour la preview PDF / iframe)
  watch(() => editorStore.currentTrip, (trip) => {
    if (trip) {
      // Ne pas await pour ne pas bloquer l'UI
      void previewTravelBook()
    }
  })

  // Après une sauvegarde automatique (status 'saved'), relancer la prévisualisation
  watch(() => editorStore.autoSaveStatus, (status) => {
    if (status === 'saved') {
      void previewTravelBook()
    }
  })

const goHome = () => {
  window.location.hash = '#/'
}
</script>

<style scoped>
.editor-layout {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main preview";
  grid-template-columns: var(--editor-sidebar-width, 280px) 1fr var(--editor-preview-width, 400px);
  grid-template-rows: 60px 1fr;
  height: 100vh;
  background: var(--color-background, #f5f5f5);
  overflow: hidden;
}

/* Smooth transition when preview column width changes */
.editor-layout {
  transition: grid-template-columns 220ms ease;
}

/* If preview width is set to 0, collapse the preview area cleanly */
.editor-layout[style*="--editor-preview-width: 0px"] {
  grid-template-areas:
    "header header"
    "sidebar main";
  grid-template-columns: var(--editor-sidebar-width, 280px) 1fr;
}

.editor-main {
  grid-area: main;
  overflow-y: auto;
  padding: var(--spacing-xl, 32px);
  background: var(--color-background, #f5f5f5);
}

.editor-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.placeholder-content {
  text-align: center;
  color: var(--color-text-secondary, #666);
}

.placeholder-content h2 {
  font-size: 2rem;
  margin: 0 0 1rem 0;
  color: var(--color-text-primary, #333);
}

.placeholder-content p {
  margin: 0;
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 1200px) {
  .editor-layout {
    grid-template-columns: 250px 1fr 300px;
  }
}

@media (max-width: 992px) {
  .editor-layout {
    grid-template-areas: 
      "header header"
      "sidebar main";
    grid-template-columns: 250px 1fr;
  }
  /* Masquer le preview sur tablette */
  .preview-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .editor-layout {
    grid-template-areas: 
      "header"
      "main";
    grid-template-columns: 1fr;
    grid-template-rows: 60px 1fr;
  }
  
  /* Masquer sidebar sur mobile (sera accessible via menu) */
  .editor-sidebar {
    display: none;
  }
  
  .editor-main {
    padding: var(--spacing-md, 16px);
  }
}

.themes-panel {
  overflow-y: auto;
  max-height: 100%;
}
</style>
