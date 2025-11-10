<template>
  <section class="section photo-selection-column">
    <h4>Photo de couverture</h4>
    <SelectedSlot
      :photo="photo"
      :slotIndex="0"
      :slotNumber="1"
      @openLibrary="forwardOpenLibrary"
      @edit="forwardEdit"
      @clear="$emit('clear')"
    />
  </section>
</template>

<script setup lang="ts">
import SelectedSlot from './SelectedSlot.vue'
import type { PropType } from 'vue'

const props = defineProps({ photo: { type: Object as PropType<any>, default: null } })
const emit = defineEmits(['open-library', 'edit', 'clear'])

const forwardOpenLibrary = (slotIndex: number) => emit('open-library', slotIndex)
const forwardEdit = (index: number) => emit('edit', index)
</script>

<style scoped>
.section { margin-bottom:24px; background:#fff; border-radius:8px; padding:16px }
.photo-selection-column { max-width:360px }
@media (max-width:900px) { .photo-selection-column { max-width:none } }
</style>
