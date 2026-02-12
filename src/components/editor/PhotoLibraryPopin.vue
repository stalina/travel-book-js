<template>
  <div class="modal-overlay active">
    <div class="photo-library-popin">
      <div class="popin-header">
        <div style="display:flex; gap:12px; align-items:center;">
          <h3 style="margin:0;">Bibliothèque de l'étape</h3>
          <span class="muted">{{ filtered.length }} / {{ total }}</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center;">
          <input :value="query" class="library-search" type="search" placeholder="Rechercher..." @input="onQueryInput" />
          <div class="ratio-btns">
            <button v-for="opt in ratioOptions" :key="opt.value" :class="{ active: ratio === opt.value }" @click="$emit('set-ratio', opt.value)">{{ opt.label }}</button>
          </div>
          <BaseButton variant="outline" size="sm" class="import-btn" @click="openUploadDialog">📥 Importer</BaseButton>
          <button class="btn-close" @click="$emit('close')">✕</button>
        </div>
      </div>

  <input ref="uploadInput" type="file" accept="image/*" style="display:none" @change="$emit('upload', $event)" />

      <div style="display:block; padding:12px;">
        <div class="popin-grid">
          <button v-for="photo in filtered" :key="photo.id" class="library-item" @click="$emit('select', photo.index)">
            <img :src="photo.url" :alt="photo.name" />
            <div class="library-item-index">#{{ photo.index }}</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '../BaseButton.vue'
import type { PropType } from 'vue'

const props = defineProps({
  filtered: { type: Array as PropType<any[]>, default: () => [] },
  total: { type: Number, default: 0 },
  query: { type: String, default: '' },
  ratio: { type: String, default: 'all' },
  ratioOptions: { type: Array as PropType<Array<{ value: string; label: string }>>, default: () => [] }
})

const emit = defineEmits(['select', 'set-ratio', 'close', 'upload', 'update:query'])

const uploadInput = ref<HTMLInputElement | null>(null)

const openUploadDialog = () => {
  uploadInput.value?.click()
}

const onQueryInput = (event: Event) => {
  const v = (event.target as HTMLInputElement).value
  emit('update:query', v)
}
</script>

<style scoped>
.modal-overlay.active { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000 }
.photo-library-popin { background:white; width:900px; max-width:calc(100% - 40px); border-radius:12px; overflow:hidden; box-shadow:0 20px 60px rgba(2,6,23,0.2) }
.popin-header { display:flex; justify-content:space-between; align-items:center; padding:12px 16px; border-bottom:1px solid #eef2f6 }
.popin-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:12px; padding:16px; max-height:60vh; overflow:auto }
.library-item { position:relative; aspect-ratio:1; border:2px solid #e5e7eb; border-radius:8px; overflow:hidden; background:white }
.library-item img { width:100%; height:100%; object-fit:cover }
.library-item .library-item-index { position:absolute; bottom:6px; left:6px; background:rgba(0,0,0,0.6); color:white; font-size:12px; padding:2px 6px; border-radius:6px }
.btn-close { background:transparent; border:none; font-size:18px; cursor:pointer }
.ratio-btns { display:flex; gap:4px }
.ratio-btns button { flex:1; padding:6px 8px; border:1px solid #d1d5db; background:white; border-radius:4px; font-size:11px; cursor:pointer }
.ratio-btns button.active { background:#dbeafe; border-color:#3b82f6; color:#2563eb }
.import-btn {
  border-radius:28px;
  padding-left:14px;
  padding-right:14px;
  color:#ef4444;
  border-color:rgba(239,68,68,0.22);
  background:linear-gradient(180deg, rgba(255,245,245,0.6), rgba(255,250,250,0.6));
  box-shadow:0 6px 18px rgba(239,68,68,0.06);
}
.import-btn:hover {
  background:linear-gradient(180deg, rgba(255,230,230,0.9), rgba(255,245,245,0.9));
}
</style>
