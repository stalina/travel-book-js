<template>
  <main class="container">
    <h2>Génération</h2>
    <ol>
      <li :class="{ done: stepIndex>0 }">Lecture des fichiers</li>
      <li :class="{ done: stepIndex>1 }">Parsing & mapping</li>
      <li :class="{ done: stepIndex>2 }">Préparation du plan photos</li>
      <li :class="{ done: stepIndex>3 }">Édition du plan</li>
      <li :class="{ done: stepIndex>4 }">Génération HTML & assets</li>
      <li :class="{ done: stepIndex>5 }">Ouverture du viewer</li>
    </ol>

    <section v-if="stepIndex>=3" class="editor">
      <h3>Éditer le plan des photos</h3>
      <p class="hint">
        Modifiez la couverture et la pagination pour chaque étape. Lignes supportées:
        « Cover photo: N » et lignes d'index séparés par des espaces. Un en-tête d'étape ressemble à « … (123456) ».
      </p>
      <textarea v-model="store.photosPlanText" rows="18" spellcheck="false"></textarea>
      <div class="row">
        <button class="btn primary" @click="generateNow" :disabled="isWorking">Générer le livre</button>
        <button class="btn" @click="reloadDefault" :disabled="isWorking">Recharger le plan par défaut</button>
      </div>
    </section>

    <p v-if="error" class="error">{{ error }}</p>
  </main>
  
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTripStore } from '../stores/trip.store'

const store = useTripStore()
const stepIndex = ref(0)
const error = ref('')
const isWorking = ref(false)

onMounted(async () => {
  try {
    stepIndex.value = 1
    await store.readInput()
    stepIndex.value = 2
    await store.parseAndMap()
    stepIndex.value = 3
    // Préparer un plan par défaut puis laisser l'utilisateur l'éditer
    await store.ensureDraftPlan()
    stepIndex.value = 3 // rester en édition tant que l'utilisateur n'a pas lancé
  } catch (e: any) {
    error.value = e?.message || String(e)
  }
})

async function generateNow() {
  try {
    isWorking.value = true
    stepIndex.value = 4
    await store.finalizeWithPlanAndOpenViewer()
    stepIndex.value = 5
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    isWorking.value = false
  }
}

async function reloadDefault() {
  try {
    isWorking.value = true
    // Recréer un plan par défaut à partir de l'entrée, puis le réinjecter dans l'éditeur
    store.photosPlanText = ''
    await store.ensureDraftPlan()
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    isWorking.value = false
  }
}
</script>

<style scoped>
.container { max-width: 700px; margin: 0 auto; padding: 24px; }
ol { display: grid; gap: 6px; }
.done { color: #2aa31a; }
.error { color: #b00020; }
.editor { margin-top: 16px; display: grid; gap: 10px; }
.hint { color: #555; font-size: 0.95em; }
textarea { width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Courier New", monospace; border: 1px solid #ccc; border-radius: 8px; padding: 10px; }
.row { display: flex; gap: 12px; }
.btn { padding: 10px 14px; border-radius: 8px; border: 1px solid #666; background: #f6f6f6; cursor: pointer; }
.btn.primary { background: #2aa31a; color: white; border-color: #2aa31a; }
</style>
