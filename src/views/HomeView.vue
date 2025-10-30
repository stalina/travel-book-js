<template>
  <main class="container">
    <section class="hero">
      <h1>Polarsteps Travel Book (Front‑Only)</h1>
      <p>Choisissez votre dossier polarsteps-trip et générez le travel book côté navigateur.</p>
    </section>

    <section class="actions">
      <button @click="pickDirectory" class="btn">Sélectionner un dossier</button>
      <input ref="fileInput" type="file" webkitdirectory multiple hidden @change="onFilesPicked" />
  <div class="dropzone" @dragover.prevent @drop.prevent="onDrop">Déposez un dossier/zip ici</div>
    </section>

    <section class="footer">
      <button :disabled="!ready" class="btn primary" @click="goGenerate">Générer</button>
      <p class="hint">Aucune donnée n’est envoyée. Tout reste local.</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTripStore } from '../stores/trip.store'
import { useFileSelection } from '../composables/useFileSelection'

const store = useTripStore()
const { fileInput, pickDirectory, onFilesPicked, onDrop } = useFileSelection()

const ready = computed(() => store.hasInput)

function goGenerate() {
  store.startGeneration()
}
</script>

<style scoped>
.container { max-width: 880px; margin: 0 auto; padding: 24px; }
.hero { margin-bottom: 16px; }
.actions { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); align-items: center; }
  .dropzone { border: 2px dashed #888; padding: 28px; text-align: center; border-radius: 12px; min-height: 90px; display:flex; align-items:center; justify-content:center; }
.footer { margin-top: 20px; display:flex; gap:12px; align-items:center; }
.btn { padding: 10px 14px; border-radius: 8px; border: 1px solid #666; background: #f6f6f6; cursor: pointer; }
.btn.primary { background: #2f83f6; color: white; border-color: #2f83f6; }
.hint { opacity: .7; font-size: .9em; }
</style>
