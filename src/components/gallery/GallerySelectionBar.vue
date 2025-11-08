<template>
  <transition name="slide-up">
    <aside v-if="count" class="selection-bar">
      <div class="bar-left">
        <strong>{{ count }}</strong>
        <span>photo(s) sélectionnée(s)</span>
        <span class="size">{{ formattedSize }}</span>
      </div>
      <div class="bar-actions">
        <BaseButton variant="ghost" size="sm" @click="$emit('favorite')">⭐ Favoris</BaseButton>
        <BaseButton variant="ghost" size="sm" @click="$emit('download')">⬇️ Télécharger</BaseButton>
        <BaseButton variant="outline" size="sm" @click="$emit('delete')">🗑️ Supprimer</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="$emit('clear')">✖️ Vider sélection</BaseButton>
      </div>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '../BaseButton.vue'

const props = defineProps({
  count: {
    type: Number,
    default: 0
  },
  totalSize: {
    type: Number,
    default: 0
  }
})

defineEmits(['favorite', 'download', 'delete', 'clear'])

const formattedSize = computed(() => {
  if (!props.totalSize) {
    return ''
  }
  const sizeMb = props.totalSize / (1024 * 1024)
  return `(${sizeMb.toFixed(2)} Mo)`
})
</script>

<style scoped>
.selection-bar {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  bottom: var(--spacing-lg);
  background: rgba(33, 33, 33, 0.95);
  color: white;
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}

.bar-left {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm, 14px);
}

.bar-left strong {
  font-size: var(--font-size-lg, 18px);
}

.size {
  opacity: 0.8;
}

.bar-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translate(-50%, 20px);
  opacity: 0;
}

@media (max-width: 768px) {
  .selection-bar {
    flex-direction: column;
    align-items: flex-start;
    width: calc(100% - 32px);
    left: 16px;
    transform: none;
  }

  .bar-actions {
    flex-wrap: wrap;
  }
}
</style>
