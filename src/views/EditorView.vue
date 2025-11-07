<template>
  <div class="editor-layout">
    <EditorHeader />
    <EditorSidebar>
      <template #default="{ activeTab }">
        <StepList v-if="activeTab === 'steps'" />
        <div v-else-if="activeTab === 'themes'">
          <p>Thèmes (à venir)</p>
        </div>
        <div v-else>
          <p>Options (à venir)</p>
        </div>
      </template>
    </EditorSidebar>
    <main class="editor-main">
      <StepEditor />
    </main>
    <PreviewPanel />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useEditorStore } from '../stores/editor.store'
import { useTripStore } from '../stores/trip.store'
import { useHistory } from '../composables/useHistory'
import EditorHeader from '../components/editor/EditorHeader.vue'
import EditorSidebar from '../components/editor/EditorSidebar.vue'
import PreviewPanel from '../components/editor/PreviewPanel.vue'
import StepList from '../components/editor/StepList.vue'
import StepEditor from '../components/editor/StepEditor.vue'
import type { Trip } from '../models/types'

const editorStore = useEditorStore()
const tripStore = useTripStore()

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
    // Rien à faire ici
    return
  }
  
  // Sinon, si on a un input mais pas de Trip parsé (accès direct à /editor)
  if (tripStore.hasInput && !tripStore.hasParsedTrip) {
    await tripStore.parseAndMap()
    const trip = tripStore.parsedTrip
    if (trip) {
      editorStore.setTrip(trip)
    }
  }
})
</script>

<style scoped>
.editor-layout {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar main preview";
  grid-template-columns: 280px 1fr 400px;
  grid-template-rows: 60px 1fr;
  height: 100vh;
  background: var(--color-background, #f5f5f5);
  overflow: hidden;
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
  .editor-layout > :nth-child(4) {
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
  .editor-layout > :nth-child(2) {
    display: none;
  }
  
  .editor-main {
    padding: var(--spacing-md, 16px);
  }
}
</style>
