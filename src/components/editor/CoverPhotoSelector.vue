<template>
  <section class="section photo-selection-column">
    <h4>Photo de couverture</h4>
    <SelectedSlot
      :photo="photo"
      :slotIndex="0"
      :slotNumber="1"
      @openLibrary="$emit('open-library')"
      @edit="$emit('edit')"
      @clear="$emit('clear')"
    />
  </section>
</template>

<script setup lang="ts">
import SelectedSlot from './SelectedSlot.vue'
import type { PropType } from 'vue'

const props = defineProps({ photo: { type: Object as PropType<any>, default: null } })
const emit = defineEmits(['open-library', 'edit', 'clear'])
</script>
