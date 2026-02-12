<template>
  <main class="home-import">
    <header class="hero">
      <h1 class="title">Créer votre Travel Book</h1>
      <p class="tagline">Importez votre export Polarsteps et générez un album imprimable 100% local.</p>
    </header>

    <!-- Carte de reprise de brouillon -->
    <DraftResumeCard
      v-if="draftInfo"
      :info="draftInfo"
      :is-resuming="isResuming"
      @resume="resumeDraft"
      @discard="discardDraft"
    />

    <div v-if="draftInfo" class="separator">
      <span class="separator-text">ou importez un nouveau dossier</span>
    </div>

    <AlbumImportPanel :on-import-ready="goGenerate" />

    <!-- Dialog de confirmation d'écrasement -->
    <div v-if="showOverwriteConfirm" class="overlay" @click.self="showOverwriteConfirm = false">
      <div class="confirm-dialog">
        <h3>Écraser le brouillon existant ?</h3>
        <p>Un brouillon de <strong>{{ draftInfo?.tripName }}</strong> est déjà sauvegardé. Importer un nouveau dossier supprimera ce brouillon.</p>
        <div class="confirm-actions">
          <BaseButton variant="ghost" size="sm" @click="showOverwriteConfirm = false">Annuler</BaseButton>
          <BaseButton variant="primary" size="sm" @click="confirmOverwrite">Continuer l'import</BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTripStore } from '../stores/trip.store'
import { useEditorStore } from '../stores/editor.store'
import { DraftStorageService } from '../services/draft-storage.service'
import type { DraftInfo } from '../models/draft.types'
import AlbumImportPanel from '../components/album/AlbumImportPanel.vue'
import DraftResumeCard from '../components/album/DraftResumeCard.vue'
import BaseButton from '../components/BaseButton.vue'

const router = useRouter()
const tripStore = useTripStore()
const editorStore = useEditorStore()
const draftService = DraftStorageService.getInstance()

const draftInfo = ref<DraftInfo | null>(null)
const isResuming = ref(false)
const showOverwriteConfirm = ref(false)

onMounted(async () => {
  draftInfo.value = await draftService.getDraftInfo()
})

async function resumeDraft() {
  isResuming.value = true
  try {
    const draft = await draftService.loadDraft()
    if (!draft) return
    await editorStore.restoreFromDraft(draft.snapshot, draft.photoBlobs)
    router.push('/editor')
  } finally {
    isResuming.value = false
  }
}

async function discardDraft() {
  await draftService.deleteDraft()
  draftInfo.value = null
}

async function goGenerate() {
  if (!tripStore.hasInput) return

  // Si un brouillon existe, demander confirmation
  if (draftInfo.value) {
    showOverwriteConfirm.value = true
    return
  }

  await performImport()
}

async function confirmOverwrite() {
  showOverwriteConfirm.value = false
  await draftService.deleteDraft()
  draftInfo.value = null
  await performImport()
}

async function performImport() {
  // Parse le voyage et récupère le Trip
  await tripStore.parseAndMap()

  // Passe le Trip à l'éditeur
  const trip = tripStore.parsedTrip
  if (trip) {
    editorStore.setTrip(trip)
  }

  // Navigation vers l'éditeur
  router.push('/editor')
}
</script>

<style scoped>
.home-import { max-width:860px; margin:0 auto; padding:32px 24px; display:flex; flex-direction:column; gap:32px; }
.hero { display:flex; flex-direction:column; gap:8px; }
.title { font-size:2rem; margin:0; }
.tagline { margin:0; opacity:.75; }

.separator {
  display: flex;
  align-items: center;
  gap: 16px;
}

.separator::before,
.separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-border, #e0e0e0);
}

.separator-text {
  font-size: 0.85rem;
  color: #999;
  white-space: nowrap;
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  padding: 24px 32px;
  max-width: 440px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.confirm-dialog h3 {
  margin: 0 0 12px;
  font-size: 1.1rem;
}

.confirm-dialog p {
  margin: 0 0 20px;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
