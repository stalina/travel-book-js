<template>
  <div :class="['base-card', { 'is-hoverable': hoverable, 'is-clickable': clickable }]" @click="handleClick">
    <div v-if="$slots.header" class="card-header">
      <slot name="header" />
    </div>
    
    <div class="card-body">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * BaseCard - Composant technique réutilisable pour les cartes
 * 
 * Features:
 * - Slots: default (body), header, footer
 * - Hoverable: Animation au survol
 * - Clickable: Curseur pointer et événement click
 */

interface Props {
  hoverable?: boolean
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  hoverable: false,
  clickable: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

function handleClick(event: MouseEvent) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-card {
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--transition-base);
}

.is-hoverable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.is-clickable {
  cursor: pointer;
}

.card-header {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid var(--color-border-light);
}

.card-body {
  padding: var(--spacing-xl);
}

.card-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  border-top: 1px solid var(--color-border-light);
  background: var(--color-background);
}
</style>
