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
