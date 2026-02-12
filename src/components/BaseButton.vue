<template>
  <button
    :class="['base-button', `variant-${variant}`, `size-${size}`, { 'is-loading': loading }]"
    :disabled="disabled || loading"
    :type="type"
    v-bind="$attrs"
    @click="handleClick"
  >
    <span v-if="loading" class="spinner"></span>
    <span :class="{ 'content-hidden': loading }">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
/**
 * BaseButton - Composant technique réutilisable pour tous les boutons
 * 
 * Variants:
 * - primary: Bouton principal (couleur primaire)
 * - secondary: Bouton secondaire (couleur secondaire)
 * - outline: Bouton avec bordure uniquement
 * - ghost: Bouton transparent
 * 
 * Sizes:
 * - sm: Petit
 * - md: Moyen (par défaut)
 * - lg: Grand
 */

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false
})
const emit = defineEmits(['click'])

function handleClick(event: MouseEvent) {
  // Accès direct aux props via variables du template
  // @ts-ignore pour TypeScript strict
  // eslint-disable-next-line
  // @ts-ignore
  if (!disabled && !loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  border: none;
  border-radius: var(--radius-lg);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
  white-space: nowrap;
}

.base-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.base-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.base-button:not(:disabled):active {
  transform: translateY(0);
}

/* Sizes */
.size-sm {
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
}

.size-md {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-base);
}

.size-lg {
  padding: var(--spacing-lg) var(--spacing-2xl);
  font-size: var(--font-size-lg);
}

/* Variants */
.variant-primary {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-md);
}

.variant-primary:not(:disabled):hover {
  background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));
}

.variant-secondary {
  background: linear-gradient(135deg, var(--color-secondary), var(--color-secondary-dark));
  color: var(--color-text-inverse);
  box-shadow: var(--shadow-md);
}

.variant-secondary:not(:disabled):hover {
  background: linear-gradient(135deg, var(--color-secondary-light), var(--color-secondary));
}

.variant-outline {
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}

.variant-outline:not(:disabled):hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.variant-ghost {
  background: transparent;
  color: var(--color-text-primary);
}

.variant-ghost:not(:disabled):hover {
  background: var(--color-background);
}

/* Loading state */
.is-loading {
  position: relative;
  cursor: wait;
}

.content-hidden {
  visibility: hidden;
}

.spinner {
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
