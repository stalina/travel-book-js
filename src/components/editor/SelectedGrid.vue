<template>
  <section class="section">
    <h4>Sélection ({{ selectedCount }} / {{ capacity }})</h4>
    <div class="selected-grid">
      <SelectedSlot
        v-for="(slot, i) in slots"
        :key="i"
        :photo="slot"
        :slotIndex="i"
        :slotNumber="i + 1"
        @openLibrary="$emit('open-library', $event)"
        @edit="$emit('edit-photo', $event)"
        @clear="$emit('clear-slot', $event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import SelectedSlot from './SelectedSlot.vue'
import type { PropType } from 'vue'

const props = defineProps({
  slots: { type: Array as PropType<any[]>, default: () => [] },
  selectedCount: { type: Number, default: 0 },
  capacity: { type: Number, default: 0 }
})

const emit = defineEmits(['open-library', 'edit-photo', 'clear-slot'])
</script>

<style scoped>
.section { margin-bottom:24px; background:#fff; border-radius:8px; padding:16px }
.selected-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap:12px }
</style>
