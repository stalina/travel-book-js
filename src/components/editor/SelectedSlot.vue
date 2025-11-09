<template>
  <div class="selected-slot">
    <div v-if="photo" class="selected-card">
      <img :src="photo.url" :alt="photo.name" />
      <span>Slot {{ slotNumber }}</span>
      <div class="actions">
        <button :data-test="`page-photo-edit-${photo.index}`" @click.prevent="onEdit(photo.index)">✎</button>
        <button :data-test="`page-photo-toggle-${photo.index}`" @click.prevent="onClear">✕</button>
      </div>
    </div>
    <div v-else class="selected-card empty">
      <span>Slot {{ slotNumber }}</span>
      <div class="actions">
        <button :data-test="`page-photo-open-${slotNumber}`" @click.prevent="onOpenLibrary">📚</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { GalleryPhoto } from '../../models/gallery.types'

const props = defineProps({
  photo: { type: Object as PropType<GalleryPhoto | null>, default: null },
  slotIndex: { type: Number, required: true },
  slotNumber: { type: Number, required: true }
})

const emit = defineEmits(['openLibrary', 'edit', 'clear'])

const onOpenLibrary = () => emit('openLibrary', props.slotIndex)
const onEdit = (photoIndex: number) => emit('edit', photoIndex)
const onClear = () => emit('clear', props.slotIndex)

// note: keep as <script setup> SFC; no explicit default export
</script>

<style scoped>
.selected-card { padding: 12px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; display:flex; flex-direction:column; gap:8px }
.selected-card img { width:100%; aspect-ratio:1; object-fit:cover; border-radius:4px }
.selected-card.empty { background:#f9fafb; border-style:dashed; min-height:100px; justify-content:center; align-items:center }
.actions { display:flex; gap:4px }
.actions button { flex:1; padding:6px; border:1px solid #d1d5db; background:white; border-radius:4px; cursor:pointer }
</style>
