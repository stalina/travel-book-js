<template>
  <div class="draft-resume-card">
    <div class="draft-icon">📝</div>
    <div class="draft-content">
      <h3 class="draft-title">Brouillon en cours</h3>
      <p class="draft-trip-name">{{ info.tripName }}</p>
      <p class="draft-meta">
        {{ info.totalSteps }} étapes · {{ info.totalPhotos }} photos ·
        sauvegardé {{ formattedDate }}
      </p>
    </div>
    <div class="draft-actions">
      <BaseButton
        variant="primary"
        size="sm"
        :loading="isResuming"
        @click="$emit('resume')"
      >
        Reprendre l'édition
      </BaseButton>
      <BaseButton
        variant="ghost"
        size="sm"
        :disabled="isResuming"
        @click="$emit('discard')"
      >
        Supprimer le brouillon
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DraftInfo } from '../../models/draft.types'
import BaseButton from '../BaseButton.vue'

const props = defineProps<{
  info: DraftInfo
  isResuming?: boolean
}>()

defineEmits<{
  resume: []
  discard: []
}>()

const formattedDate = computed(() => {
  const date = new Date(props.info.savedAt)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})
</script>

<style scoped>
.draft-resume-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #fff7e6 0%, #fff3d6 100%);
  border: 1px solid #f0d68a;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.draft-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.draft-content {
  flex: 1;
  min-width: 0;
}

.draft-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #7a6220;
}

.draft-trip-name {
  margin: 4px 0 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.draft-meta {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: #9a8340;
}

.draft-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

@media (max-width: 680px) {
  .draft-resume-card {
    flex-direction: column;
    text-align: center;
    padding: 16px;
  }

  .draft-actions {
    flex-direction: row;
    width: 100%;
    justify-content: center;
  }
}
</style>
