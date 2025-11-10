<template>
  <div v-if="modelValue" class="confirm-overlay" role="dialog" aria-modal="true">
    <div class="confirm-card">
      <div class="confirm-body">
        <p class="confirm-message"><slot>{{ message }}</slot></p>
      </div>
      <div class="confirm-actions">
        <BaseButton variant="ghost" size="sm" @click="$emit('cancel')">Annuler</BaseButton>
        <BaseButton variant="primary" size="sm" @click="$emit('confirm')">Confirmer</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import BaseButton from '../BaseButton.vue'

const props = defineProps<{
  modelValue: boolean
  message?: string
}>()
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  z-index: 2000;
}
.confirm-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  min-width: 320px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
}
.confirm-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
}
.confirm-message {
  margin: 0;
  color: var(--color-text-primary, #111827);
}
</style>