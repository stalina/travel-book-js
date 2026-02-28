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
        <template v-else-if="option.value === 'text-only'">
          <div class="cover-text-large">
            <div class="title-line large"></div>
            <div class="subtitle-line small"></div>
            <div class="subtitle-line xsmall"></div>
          </div>
        </template>
        <template v-else-if="option.value === 'image-full'">
          <div class="pv-page">
            <div class="pv-info-strip">
              <div class="pv-flag">🏳</div>
              <div class="pv-info-lines">
                <div class="pv-line title"></div>
                <div class="pv-line sub"></div>
              </div>
            </div>
            <div class="pv-photo-full"></div>
          </div>
        </template>
        <template v-else-if="option.value === 'image-two'">
          <div class="pv-page">
            <div class="pv-info-strip">
              <div class="pv-flag">🏳</div>
              <div class="pv-info-lines">
                <div class="pv-line title"></div>
                <div class="pv-line sub"></div>
              </div>
            </div>
            <div class="pv-photos-two">
              <div class="pv-photo-half"></div>
              <div class="pv-photo-half"></div>
            </div>
          </div>
        </template>
      </div>
    </template>
  </LayoutOptions>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { CoverFormat } from '../../models/editor.types'
import LayoutOptions from './LayoutOptions.vue'

const props = defineProps({
  modelValue: { type: String as PropType<CoverFormat>, default: 'text-image' }
})

const emit = defineEmits(['update:modelValue'])

const coverOptions: Array<{ value: CoverFormat; label: string }> = [
  { value: 'text-image', label: 'Texte + Image' },
  { value: 'text-only', label: 'Texte pleine page' },
  { value: 'image-full', label: 'Image pleine' },
  { value: 'image-two', label: '2 Images' }
]

const coverDescriptions: Record<string, string> = {
  'text-image': 'Texte à gauche, image à droite',
  'text-only': 'Texte occupant toute la largeur',
  'image-full': 'Infos étape + 1 grande image (sans description)',
  'image-two': 'Infos étape + 2 images côte à côte (sans description)'
}

const previewClassFor: Record<string, string> = {
  'text-image': 'cover-preview text-image',
  'text-only': 'cover-preview text-only',
  'image-full': 'cover-preview image-full',
  'image-two': 'cover-preview image-two'
}

const onSelect = (value: string) => {
  const validFormats: CoverFormat[] = ['text-image', 'text-only', 'image-full', 'image-two']
  const format = validFormats.includes(value as CoverFormat) ? (value as CoverFormat) : 'text-image'
  emit('update:modelValue', format)
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

/* ── Agencements image-full & image-two : mini-page ── */
:deep(.layout-preview.cover-preview.image-full),
:deep(.layout-preview.cover-preview.image-two) {
  padding: 0;
  overflow: hidden;
  gap: 0;
  align-items: stretch;
}

/* Conteneur "page" occupant toute la preview */
:deep(.layout-preview .pv-page) {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 140px;
  min-height: 140px;
}

/* Bande d'infos en haut : flag + lignes titre */
:deep(.layout-preview .pv-info-strip) {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 12px 7px;
  flex-shrink: 0;
}

:deep(.layout-preview .pv-flag) {
  font-size: 13px;
  line-height: 1;
}

:deep(.layout-preview .pv-info-lines) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

:deep(.layout-preview .pv-line.title) {
  height: 8px;
  width: 70%;
  border-radius: 4px;
  background: linear-gradient(180deg, #e6eefc, #eef6ff);
}

:deep(.layout-preview .pv-line.sub) {
  height: 6px;
  width: 50%;
  border-radius: 4px;
  background: linear-gradient(180deg, #f1f5f9, #f8fafc);
}

/* Zone photo pleine largeur */
:deep(.layout-preview .pv-photo-full) {
  flex: 1;
  background: linear-gradient(180deg, #dbe5ff, #eef4ff);
}

/* Zone 2 photos côte à côte */
:deep(.layout-preview .pv-photos-two) {
  flex: 1;
  display: flex;
  gap: 3px;
  padding: 4px;
}

:deep(.layout-preview .pv-photo-half) {
  flex: 1;
  border-radius: 4px;
  background: linear-gradient(180deg, #dbe5ff, #eef4ff);
}

:deep(.layout-option-button[data-test="layout-option-image-full"].active .layout-preview) {
  background: linear-gradient(180deg, rgba(254, 228, 226, 0.4), rgba(255, 246, 245, 0.4));
}

:deep(.layout-option-button[data-test="layout-option-image-two"].active .layout-preview) {
  background: linear-gradient(180deg, rgba(254, 228, 226, 0.4), rgba(255, 246, 245, 0.4));
}
</style>
