<template>
  <section class="section proposal-description">
    <RichTextEditor :model-value="modelValue" @update:model-value="$emit('update', $event)" />
  </section>
</template>

<script setup lang="ts">
import RichTextEditor from './RichTextEditor.vue'
import type { PropType } from 'vue'

const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update'])
</script>

<style scoped>
.section { margin-bottom:24px; background:#fff; border-radius:8px; padding:16px }
.proposal-description { padding:0 }
</style>
