<template>
  <div class="selected-slot">
    <div v-if="photo" class="selected-card">
      <!-- GalleryPhoto uses `objectUrl` for the blob URL and stores the original File in `file` -->
      <img :src="photo.objectUrl" :alt="photo.file?.name || 'photo'" />
      <span>Slot {{ slotNumber }}</span>
      <div class="actions">
        <!-- Use the provided slotIndex for test attributes and emits (photo.index doesn't exist) -->
        <button :data-test="`page-photo-edit-${slotIndex}`" @click.prevent="onEdit(slotIndex)">✎</button>
        <button :data-test="`page-photo-toggle-${slotIndex}`" @click.prevent="onClear">✕</button>
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
import type { GalleryPhoto } from '../../models/gallery.types'

interface Props {
  photo: GalleryPhoto | null
  slotIndex: number
  slotNumber: number
}

// Call defineProps without generic and cast to our Props interface to avoid env-specific issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const props = defineProps() as any as Props

// expose local bindings for template consumption (helps some TS/SFC toolchains)
const photo = props.photo
const slotIndex = props.slotIndex
const slotNumber = props.slotNumber

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
