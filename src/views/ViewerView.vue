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
import { useTripStore } from '../stores/trip.store'
import { buildSingleFileHtml } from '../services/generate.service'
import { ref } from 'vue'

const store = useTripStore()
const isOpening = ref(false)

async function openNewTab() {
  if (!store.artifacts) return
  try {
    isOpening.value = true
    const blob = await buildSingleFileHtml(store.artifacts)
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    // Astuce: ne pas révoquer immédiatement pour éviter d'invalider la page ouverte
  } finally {
    isOpening.value = false
  }
}
async function download() {
  if (!store.artifacts) return
  const blob = await buildSingleFileHtml(store.artifacts)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'travel_book.html'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function backToEditor() {
  // Revenir à l'étape d'édition sans perdre le plan actuel
  location.hash = '#/generate'
}
</script>

<style scoped>
.container { max-width: 700px; margin: 0 auto; padding: 24px; }
.row { display: flex; gap: 12px; }
.btn { padding: 10px 14px; border-radius: 8px; border: 1px solid #666; background: #f6f6f6; cursor: pointer; }
.btn.secondary { background: #fff; }
</style>
