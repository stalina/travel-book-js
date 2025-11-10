<template>
  <div class="proposal-section">
    <div class="proposal-meta" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
      <div></div>
      <BaseButton variant="ghost" size="sm" data-test="proposal-reset" @click="$emit('reset')">Réinitialiser</BaseButton>
    </div>

    <slot name="body" />
  </div>
</template>

<script setup lang="ts">
import BaseButton from '../BaseButton.vue'
const emit = defineEmits(['reset'])
</script>

<style scoped>
.proposal-section { margin-bottom:24px; background:white; border-radius:8px; padding:16px }
.proposal-meta { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
</style>
