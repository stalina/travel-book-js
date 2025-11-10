<template>
  <LayoutOptions
    title="Agencement de la couverture"
    :options="coverOptions"
    :active="modelValue"
    :previewClassFor="previewClassFor"
    :descriptions="coverDescriptions"
    @select="onSelect"
  >
    <template #preview="{ option }">
      <div :class="['layout-preview', previewClassFor[option.value] ?? '']" aria-hidden="true">
        <template v-if="option.value === 'text-image'">
          <div class="cover-text-block">
            <div class="title-line"></div>
            <div class="subtitle-line"></div>
            <div class="subtitle-line short"></div>
          </div>
          <div class="cover-thumb">
            <div class="img-placeholder"></div>
          </div>
        </template>
        <template v-else>
          <div class="cover-text-large">
            <div class="title-line large"></div>
            <div class="subtitle-line small"></div>
            <div class="subtitle-line xsmall"></div>
          </div>
        </template>
      </div>
    </template>
  </LayoutOptions>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import LayoutOptions from './LayoutOptions.vue'

const props = defineProps({
  modelValue: { type: String as PropType<'text-image' | 'text-only'>, default: 'text-image' }
})

const emit = defineEmits(['update:modelValue'])

const coverOptions: Array<{ value: 'text-image' | 'text-only'; label: string }> = [
  { value: 'text-image', label: 'Texte + Image' },
  { value: 'text-only', label: 'Texte pleine page' }
] 

const coverDescriptions: Record<string, string> = {
  'text-image': 'Texte à gauche, image à droite',
  'text-only': 'Texte occupant toute la largeur'
}

const previewClassFor: Record<string, string> = {
  'text-image': 'cover-preview text-image',
  'text-only': 'cover-preview text-only'
}

const onSelect = (value: string) => {
  emit('update:modelValue', value === 'text-only' ? 'text-only' : 'text-image')
}
</script>

<style scoped>
:deep(.layout-preview.cover-preview) {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 14px;
  background: linear-gradient(180deg, #fbfdff, #ffffff);
}

:deep(.layout-preview.cover-preview.text-image) {
  flex-direction: row;
  justify-content: space-between;
}

:deep(.layout-preview.cover-preview.text-image .cover-text-block) {
  flex: 1 1 60%;
  padding-right: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

:deep(.layout-preview.cover-preview .title-line) {
  height: 14px;
  width: 70%;
  background: linear-gradient(180deg, #e6eefc, #eef6ff);
  border-radius: 6px;
}

:deep(.layout-preview.cover-preview .subtitle-line) {
  height: 12px;
  width: 50%;
  background: linear-gradient(180deg, #f1f5f9, #f8fafc);
  border-radius: 6px;
}

:deep(.layout-preview.cover-preview .subtitle-line.short) {
  width: 40%;
}

:deep(.layout-preview.cover-preview .cover-thumb) {
  width: 38%;
  min-width: 126px;
  height: 108px;
  border-radius: 10px;
  background: linear-gradient(180deg, #eef2ff, #e6eefc);
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.layout-preview.cover-preview .cover-thumb .img-placeholder) {
  width: 88%;
  height: 82%;
  border-radius: 8px;
  background: linear-gradient(180deg, #dbe5ff, #eef4ff);
}

:deep(.layout-preview.cover-preview.text-only) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.layout-preview.cover-preview .cover-text-large) {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

:deep(.layout-preview.cover-preview .title-line.large) {
  height: 28px;
  width: 80%;
}

:deep(.layout-preview.cover-preview .subtitle-line.small) {
  width: 60%;
}

:deep(.layout-preview.cover-preview .subtitle-line.xsmall) {
  width: 45%;
}

:deep(.layout-option-button[data-test="layout-option-text-image"].active .layout-preview) {
  background: linear-gradient(180deg, rgba(254, 228, 226, 0.6), rgba(255, 246, 245, 0.6));
}

:deep(.layout-option-button[data-test="layout-option-text-only"].active .layout-preview) {
  background: linear-gradient(180deg, rgba(254, 228, 226, 0.4), rgba(255, 246, 245, 0.4));
}
</style>
