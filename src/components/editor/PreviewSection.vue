<template>
  <section class="section preview-section">
    <div class="preview-head">
      <h4>Aperçu à l'impression</h4>
      <div class="preview-actions">
        <BaseButton size="sm" variant="ghost" data-test="preview-refresh" @click="$emit('refresh')">Rafraîchir</BaseButton>
        <BaseButton size="sm" variant="secondary" @click="$emit('print')" :disabled="!previewHtml">Imprimer</BaseButton>
      </div>
    </div>

    <div v-if="isLoading" class="preview-loading">Génération en cours…</div>
    <iframe v-else class="preview-frame" :srcdoc="previewHtml"></iframe>

    <div class="preview-updated" v-if="previewUpdatedAt != null">Mis à jour: {{ formatDate(previewUpdatedAt) }}</div>
  </section>
</template>

<script setup lang="ts">
import BaseButton from '../BaseButton.vue'
const props = defineProps({
  previewHtml: { type: String, default: '' },
  isLoading: { type: Boolean, default: false },
  previewUpdatedAt: { type: [Number, String, Date], default: null }
})

const emit = defineEmits(['refresh', 'print'])

const formatDate = (ts: number | string | Date) => {
  if (!ts) return ''
  const d = typeof ts === 'number' ? new Date(ts) : ts instanceof Date ? ts : new Date(ts)
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(d)
}
</script>

<style scoped>
.section { margin-bottom:24px; background:#fff; border-radius:8px; padding:16px }
.preview-section { padding:12px }
.preview-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px }
.preview-actions { display:flex; gap:8px }
.preview-frame { border:1px solid #e5e7eb; border-radius:6px; background:white; min-height:240px; padding:12px; overflow:auto; width:100%; display:block }
.preview-loading { padding:24px; text-align:center; color:#6b7280 }
.preview-updated { margin-top:8px; color:#6b7280 }
</style>
