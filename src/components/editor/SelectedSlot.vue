<template>
  <div class="selected-slot">
    <div v-if="photo" class="selected-card">
      <img :src="photoSrc" :alt="photoAlt" />
      <span>Slot {{ slotNumber }}</span>
      <div class="actions">
        <button :data-test="`page-photo-edit-${photoIndex}`" @click.prevent="onEdit(photoIndex)">✎</button>
        <button :data-test="`page-photo-toggle-${photoIndex}`" @click.prevent="onClear">✕</button>
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
import { computed } from 'vue'
import type { PropType } from 'vue'
import type { GalleryPhoto } from '../../models/gallery.types'
import type { EditorStepPhoto } from '../../models/editor.types'

const props = defineProps({
  photo: { type: Object as PropType<EditorStepPhoto | GalleryPhoto | null>, default: null },
  slotIndex: { type: Number, required: true },
  slotNumber: { type: Number, required: true }
})

const emit = defineEmits(['openLibrary', 'edit', 'clear'])

// Compute template-friendly values to avoid using TS casts in the template
const photoSrc = computed(() => {
  if (!props.photo) return ''
  // EditorStepPhoto uses `url`, GalleryPhoto uses `objectUrl`
  return (props.photo as any).url ?? (props.photo as any).objectUrl ?? ''
})

const photoAlt = computed(() => {
  if (!props.photo) return ''
  return (props.photo as any).name ?? props.photo.file?.name ?? (props.photo as any).stepName ?? props.photo.id ?? ''
})

const photoIndex = computed(() => {
  return ((props.photo as any)?.index ?? props.slotIndex) as number
})

const onOpenLibrary = () => emit('openLibrary', props.slotIndex)
const onEdit = (index: number) => emit('edit', index)
const onClear = () => emit('clear', props.slotIndex)

</script>

<style scoped>
.selected-card { padding: 12px; background: white; border: 1px solid #e5e7eb; border-radius: 8px; display:flex; flex-direction:column; gap:8px }
.selected-card img { width:100%; aspect-ratio:1; object-fit:cover; border-radius:4px }
.selected-card.empty { background:#f9fafb; border-style:dashed; min-height:100px; justify-content:center; align-items:center }
.actions { display:flex; gap:4px }
.actions button { flex:1; padding:6px; border:1px solid #d1d5db; background:white; border-radius:4px; cursor:pointer }
</style>
