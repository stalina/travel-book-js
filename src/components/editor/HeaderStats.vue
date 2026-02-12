<template>
  <div class="header-stats" role="list" aria-label="Statistiques du voyage">
    <div class="stat-card" role="listitem" aria-label="Photos">
      <div class="stat-value">{{ totalPhotos }}</div>
      <div class="stat-label">Photos</div>
    </div>
    <div class="stat-card" role="listitem" aria-label="Étapes">
      <div class="stat-value">{{ totalSteps }}</div>
      <div class="stat-label">Étapes</div>
    </div>
    <div class="stat-card" role="listitem" aria-label="Jours">
      <div class="stat-value">{{ totalDays }}</div>
      <div class="stat-label">Jours</div>
    </div>
    <div class="stat-card" role="listitem" aria-label="Pages estimées">
      <div class="stat-value">{{ estimatedPages }}</div>
      <div class="stat-label">Pages</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useEditorStore } from '../../stores/editor.store'

const editorStore = useEditorStore()

const totalPhotos = computed(() => editorStore.totalPhotos ?? 0)
const totalSteps = computed(() => editorStore.totalSteps ?? 0)
const totalDays = computed(() => editorStore.totalDays ?? 0)
const estimatedPages = computed(() => editorStore.estimatedPages ?? 0)
</script>

<style scoped>
.header-stats {
  display: flex;
  gap: var(--spacing-sm, 8px);
  align-items: center;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2px 6px;
  background: linear-gradient(135deg, var(--color-primary-light, #ffdede), var(--color-primary, #FF6B6B));
  color: white;
  border-radius: 6px;
  min-width: 48px;
  font-size: 13px;
  line-height: 1;
  flex-shrink: 0;
}

.stat-value { font-weight: 700; }
.stat-label { font-size: 12px; opacity: 0.9; }
</style>
