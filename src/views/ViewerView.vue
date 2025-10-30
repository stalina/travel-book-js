<template>
  <main class="container">
    <h2>Viewer</h2>
    <p>Ouvrez le livre dans un nouvel onglet ou téléchargez le fichier unique.</p>
    <div class="row">
      <button class="btn" @click="openNewTab">Ouvrir dans un nouvel onglet</button>
      <button class="btn" @click="download">Télécharger (fichier unique)</button>
  <button class="btn secondary" @click="backToEditor">Retour à l'édition</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTripStore } from '../stores/trip.store'
import { viewerController } from '../controllers/ViewerController'

const store = useTripStore()
const isOpening = ref(false)

async function openNewTab() {
  if (!store.artifacts) return
  try {
    isOpening.value = true
    await viewerController.openInNewTab(store.artifacts)
  } finally {
    isOpening.value = false
  }
}

async function download() {
  if (!store.artifacts) return
  await viewerController.download(store.artifacts)
}

function backToEditor() {
  viewerController.backToEditor()
}
</script>

<style scoped>
.container { max-width: 700px; margin: 0 auto; padding: 24px; }
.row { display: flex; gap: 12px; }
.btn { padding: 10px 14px; border-radius: 8px; border: 1px solid #666; background: #f6f6f6; cursor: pointer; }
.btn.secondary { background: #fff; }
</style>
