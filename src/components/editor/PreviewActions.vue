<template>
  <div class="preview-actions">
    <BaseButton size="sm" variant="ghost" data-test="preview-refresh" @click="$emit('refresh')">Rafraîchir</BaseButton>
    <BaseButton size="sm" variant="secondary" @click="$emit('print')" :disabled="!previewHtml">Imprimer</BaseButton>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '../BaseButton.vue'
import type { PropType } from 'vue'

const props = defineProps({ previewHtml: { type: String, default: '' } })
const emit = defineEmits(['refresh', 'print'])
</script>

<style scoped>
.preview-actions { display:flex; gap:8px }
</style>
