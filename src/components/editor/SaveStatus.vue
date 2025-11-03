<template>
  <div class="save-status" :class="`status-${status}`">
    <span class="status-icon">{{ icon }}</span>
    <span class="status-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { SaveStatus } from '../../composables/useAutoSave'

interface Props {
  status: SaveStatus
  lastSaveTime?: Date | null
}

const props = withDefaults(defineProps<Props>(), {
  lastSaveTime: null
})

const icon = computed(() => {
  switch (props.status) {
    case 'idle':
      return ''
    case 'pending':
      return '⏳'
    case 'saving':
      return '💾'
    case 'saved':
      return '✓'
    case 'error':
      return '⚠️'
    default:
      return ''
  }
})

const text = computed(() => {
  switch (props.status) {
    case 'idle':
      return ''
    case 'pending':
      return 'Modifications en attente...'
    case 'saving':
      return 'Sauvegarde en cours...'
    case 'saved':
      return 'Sauvegardé'
    case 'error':
      return 'Erreur de sauvegarde'
    default:
      return ''
  }
})
</script>

<style scoped>
.save-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-sm);
  transition: all 0.3s ease;
  opacity: 0;
  visibility: hidden;
}

.save-status.status-pending,
.save-status.status-saving,
.save-status.status-saved,
.save-status.status-error {
  opacity: 1;
  visibility: visible;
}

.status-icon {
  font-size: 1.2em;
  display: flex;
  align-items: center;
}

.status-text {
  font-weight: 500;
}

/* Animation pulse pour saving */
.status-saving .status-icon {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.1);
  }
}

/* Couleurs par statut */
.status-pending {
  background: var(--color-warning-light, #fef3cd);
  color: var(--color-warning-dark, #664d03);
}

.status-saving {
  background: var(--color-info-light, #cfe2ff);
  color: var(--color-info-dark, #084298);
}

.status-saved {
  background: var(--color-success-light, #d1e7dd);
  color: var(--color-success-dark, #0f5132);
}

.status-error {
  background: var(--color-danger-light, #f8d7da);
  color: var(--color-danger-dark, #842029);
}

/* Responsive */
@media (max-width: 768px) {
  .save-status {
    font-size: var(--font-size-xs);
    padding: 0.25rem 0.75rem;
  }
  
  .status-text {
    display: none;
  }
  
  .status-icon {
    font-size: 1.5em;
  }
}
</style>
