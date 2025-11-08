<template>
  <header class="gallery-header">
    <div class="header-left">
      <BaseButton variant="ghost" size="sm" @click="$emit('back')">
        ← Retour éditeur
      </BaseButton>
      <div class="header-titles">
        <h1>Galerie photos</h1>
        <p>{{ subtitle }}</p>
      </div>
    </div>
    <div class="header-right">
      <div class="stats">
        <span><strong>{{ stats.visible }}</strong> / {{ stats.total }} photos</span>
        <span>{{ stats.aiFavorites }} coups de cœur IA</span>
        <span>{{ stats.customFavorites }} favoris</span>
        <span :class="{ warning: stats.warnings > 0 }">
          {{ stats.warnings }} alertes qualité
        </span>
      </div>
      <div class="view-switcher">
        <button
          v-for="mode in viewModes"
          :key="mode.id"
          :class="['mode-button', { active: mode.id === viewMode } ]"
          :title="mode.label"
          @click="$emit('change-view-mode', mode.id)"
        >
          {{ mode.icon }}
        </button>
      </div>
      <BaseButton
        v-if="canRestore"
        variant="outline"
        size="sm"
        @click="$emit('restore')"
      >↩️ Annuler suppression</BaseButton>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue'
import BaseButton from '../BaseButton.vue'
import type { GalleryViewMode } from '../../stores/photo-gallery.store'

interface GalleryHeaderStats {
  total: number
  visible: number
  selected: number
  aiFavorites: number
  customFavorites: number
  warnings: number
}

const props = defineProps({
  stats: {
    type: Object as PropType<GalleryHeaderStats>,
    required: true
  },
  viewMode: {
    type: String as PropType<GalleryViewMode>,
    required: true
  },
  canRestore: {
    type: Boolean,
    default: false
  }
})

defineEmits(['back', 'change-view-mode', 'restore'])

const viewModes: Array<{ id: GalleryViewMode; label: string; icon: string }> = [
  { id: 'grid', label: 'Mode grille', icon: '🔲' },
  { id: 'compact', label: 'Mode compact', icon: '🧱' },
  { id: 'list', label: 'Mode liste', icon: '📄' }
]

const subtitle = computed(() => {
  if (!props.stats.total) {
    return 'Importez un voyage pour commencer.'
  }
  if (props.stats.selected) {
    return `${props.stats.selected} photo(s) sélectionnée(s)`
  }
  return 'Filtrez, organisez et éditez vos photos avant la génération.'
})
</script>

<style scoped>
.gallery-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg) var(--spacing-xl);
  background: white;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.header-titles h1 {
  margin: 0;
  font-size: var(--font-size-2xl, 24px);
}

.header-titles p {
  margin: 4px 0 0;
  color: var(--color-text-secondary, #666);
  font-size: var(--font-size-sm, 14px);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.stats {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #666);
}

.stats span strong {
  color: var(--color-text-primary, #333);
}

.stats span.warning {
  color: #d1433c;
}

.view-switcher {
  display: inline-flex;
  background: var(--color-background, #f5f5f5);
  border-radius: var(--radius-full, 30px);
  padding: 4px;
  gap: 4px;
}

.mode-button {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: var(--radius-full, 30px);
  background: transparent;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-button:hover {
  background: rgba(0,0,0,0.05);
}

.mode-button.active {
  background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

@media (max-width: 960px) {
  .gallery-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-right {
    width: 100%;
    flex-wrap: wrap;
  }

  .stats {
    flex-wrap: wrap;
  }
}
</style>
