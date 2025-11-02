<template>
  <div class="album-import-panel">
    <div class="header">
      <h2>Importer votre dossier Polarsteps</h2>
      <p class="subtitle">Glissez-déposez le dossier exporté ou sélectionnez-le pour préparer l'album.</p>
    </div>
    <div class="dropzone" :class="phase" @dragover="onDragOver" @drop="onDrop">
      <input ref="fileInput" type="file" webkitdirectory multiple hidden @change="onFilesPicked" />
      <div v-if="phase==='idle'" class="dz-inner">Déposez le dossier ici ou <button class="link" @click="selectDirectory">parcourir…</button></div>
      <div v-else-if="phase==='fallback'" class="dz-inner warn">API de dossier indisponible. Cliquez pour sélectionner un dossier <button class="link" @click="selectDirectory">Sélectionner</button></div>
      <div v-else-if="phase==='scanning'" class="dz-inner">Analyse des fichiers…</div>
      <div v-else-if="phase==='parsing'" class="dz-inner">Parsing du voyage…</div>
      <div v-else-if="phase==='ready'" class="dz-inner success">Dossier prêt ✔</div>
      <div v-else-if="phase==='error'" class="dz-inner error">Erreur: {{ error }}</div>
    </div>

    <div v-if="photosPreview.length" class="previews">
      <h3>Prévisualisation</h3>
      <div class="grid">
        <img v-for="(src,i) in photosPreview" :key="i" :src="src" alt="preview" />
      </div>
    </div>

    <div class="footer-actions">
  <BaseButton :disabled="!canImport" variant="primary" @click="continueImport">Continuer</BaseButton>
      <small class="hint">Les données restent sur votre appareil. Rien n'est envoyé au serveur.</small>
    </div>
  </div>
</template>

<script>
import { usePolarstepsImport } from '../../composables/usePolarstepsImport'
import BaseButton from '../BaseButton.vue'
export default {
  name: 'AlbumImportPanel',
  components: { BaseButton },
  props: { onImportReady: { type: Function, required: false } },
  setup(props) {
    const { phase, error, photosPreview, canImport, selectDirectory, onDrop, onDragOver, fileInput, onFilesPicked } = usePolarstepsImport()
    function continueImport() { if (canImport.value && props.onImportReady) props.onImportReady() }
    return { phase, error, photosPreview, canImport, selectDirectory, onDrop, onDragOver, fileInput, onFilesPicked, continueImport }
  }
}
</script>

<style scoped>
.album-import-panel { border: 1px solid var(--color-border); padding: 24px; border-radius: 16px; background: var(--color-surface); display:flex; flex-direction:column; gap:24px; }
.header h2 { margin:0; font-size: 1.4rem; }
.subtitle { margin:0; opacity:.8; font-size:.9rem; }
.dropzone { border:2px dashed var(--color-border); border-radius:12px; min-height:140px; display:flex; align-items:center; justify-content:center; padding:16px; background: var(--color-bg-alt); transition: background .3s, border-color .3s; }
.dropzone.scanning { background: #fff7e6; border-color:#f0ad00; }
.dropzone.parsing { background:#e6f3ff; border-color:#2f83f6; }
.dropzone.ready { background:#e6ffe9; border-color:#28a745; }
.dropzone.error { background:#ffe9e9; border-color:#dc3545; }
.dropzone.fallback { background:#fff7e6; border-color:#f0ad00; }
.dz-inner { text-align:center; font-size:.95rem; }
.dz-inner .link { background:none; border:none; color: var(--color-primary); cursor:pointer; text-decoration:underline; }
.dz-inner.success { color:#1e7e34; font-weight:600; }
.dz-inner.error { color:#dc3545; font-weight:600; }
.dz-inner.warn { color:#b36b00; font-weight:600; }
.previews h3 { margin:0 0 8px; font-size:1rem; }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(70px,1fr)); gap:8px; }
.grid img { width:100%; height:70px; object-fit:cover; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,.1); }
.footer-actions { display:flex; flex-direction:column; gap:12px; }
.hint { opacity:.65; font-size:.75rem; }
@media (max-width: 680px){ .album-import-panel { padding:16px; } }
</style>
