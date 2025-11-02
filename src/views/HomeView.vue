<template>
  <main class="home-import">
    <header class="hero">
      <h1 class="title">Créer votre Travel Book</h1>
      <p class="tagline">Importez votre export Polarsteps et générez un album imprimable 100% local.</p>
    </header>
    <AlbumImportPanel :on-import-ready="goGenerate" />
  </main>
</template>

<script setup lang="ts">
import { useTripStore } from '../stores/trip.store'
import AlbumImportPanel from '../components/album/AlbumImportPanel.vue'
const store = useTripStore()
function goGenerate(){ if (store.hasInput) store.startGeneration() }
</script>

<style scoped>
.home-import { max-width:860px; margin:0 auto; padding:32px 24px; display:flex; flex-direction:column; gap:32px; }
.hero { display:flex; flex-direction:column; gap:8px; }
.title { font-size:2rem; margin:0; }
.tagline { margin:0; opacity:.75; }
</style>
