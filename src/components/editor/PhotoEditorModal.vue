<template>
  <teleport to="body">
    <div class="editor-overlay" @click.self="$emit('close')">
      <div class="editor-modal">
        <header class="modal-header">
          <div>
            <h2>Édition de {{ photo.file.name }}</h2>
            <p>{{ photo.stepName }} • {{ formattedDate }}</p>
          </div>
          <div class="header-actions">
            <BaseButton variant="ghost" size="sm" :disabled="!canUndo" @click="undo">↩️ Annuler</BaseButton>
            <BaseButton variant="ghost" size="sm" :disabled="!canRedo" @click="redo">↪️ Refaire</BaseButton>
            <BaseButton variant="outline" size="sm" @click="reset">Réinitialiser</BaseButton>
          </div>
        </header>

        <main class="modal-content">
          <section class="preview" :style="previewContainerStyle">
            <img :src="photo.objectUrl" :style="previewImageStyle" :alt="photo.file.name" />
          </section>

          <section class="controls">
            <div class="control-block">
              <h3>Filtres prédéfinis</h3>
              <div class="filter-grid">
                <button
                  v-for="preset in presets"
                  :key="preset.id"
                  :class="['preset', { active: state.filterPreset === preset.id }]"
                  @click="applyFilterPreset(preset.id)"
                >
                  {{ preset.label }}
                </button>
              </div>
            </div>

            <div class="control-block">
              <h3>Ajustements</h3>
              <div class="sliders">
                <label v-for="control in adjustments" :key="control.key">
                  <span>{{ control.label }} ({{ control.value }})</span>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    :value="control.value"
                    @input="handleAdjustmentInput(control.key, $event)"
                  />
                </label>
              </div>
            </div>

            <div class="control-block">
              <h3>Rotation &amp; recadrage</h3>
              <div class="row">
                <BaseButton variant="ghost" size="sm" @click="rotate(-90)">↺ 90°</BaseButton>
                <BaseButton variant="ghost" size="sm" @click="rotate(90)">↻ 90°</BaseButton>
              </div>
              <div class="ratio-buttons">
                <button
                  v-for="ratio in cropRatios"
                  :key="ratio.id"
                  :class="['ratio', { active: state.crop.ratio === ratio.id }]"
                  @click="setCropRatio(ratio.id)"
                >
                  {{ ratio.label }}
                </button>
              </div>
              <label>
                <span>Zoom ({{ state.crop.zoom.toFixed(2) }})</span>
                <input type="range" min="1" max="3" step="0.05" :value="state.crop.zoom" @input="onZoomInput" />
              </label>
              <div class="row">
                <label>
                  <span>Horizontal</span>
                  <input type="range" min="-50" max="50" :value="state.crop.offsetX" @input="onOffsetXInput" />
                </label>
                <label>
                  <span>Vertical</span>
                  <input type="range" min="-50" max="50" :value="state.crop.offsetY" @input="onOffsetYInput" />
                </label>
              </div>
            </div>
          </section>
        </main>

        <footer class="modal-footer">
          <BaseButton variant="ghost" size="md" @click="$emit('close')">Annuler</BaseButton>
          <BaseButton variant="primary" size="md" @click="apply">Appliquer</BaseButton>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { PropType } from 'vue'
import BaseButton from '../BaseButton.vue'
import type { GalleryPhoto, PhotoFilterPreset, CropRatio } from '../../models/gallery.types'
import { PHOTO_FILTER_PRESETS, buildCssFilter, clampAdjustment } from '../../utils/photo-filters'

interface EditorHistory {
  past: EditorState[]
  future: EditorState[]
}

const props = defineProps({
  photo: {
    type: Object as () => GalleryPhoto,
    required: true
  },
  history: {
    type: Object as PropType<EditorHistory | null>,
    default: null
  }
})

const emit = defineEmits(['close', 'apply'])

type AdjustmentKey = keyof GalleryPhoto['adjustments']

interface EditorState {
  filterPreset: PhotoFilterPreset
  adjustments: GalleryPhoto['adjustments']
  rotation: number
  crop: GalleryPhoto['crop']
}

const createStateFromPhoto = (photo: GalleryPhoto): EditorState => ({
  filterPreset: photo.filterPreset,
  adjustments: { ...photo.adjustments },
  rotation: photo.rotation,
  crop: { ...photo.crop }
})

const state = reactive<EditorState>(createStateFromPhoto(props.photo))
const undoStack = ref<EditorState[]>([])
const redoStack = ref<EditorState[]>([])

const cloneEditorState = (value: EditorState): EditorState => ({
  filterPreset: value.filterPreset,
  adjustments: { ...value.adjustments },
  rotation: value.rotation,
  crop: { ...value.crop }
})

const initializeHistory = (history: EditorHistory | null): void => {
  undoStack.value = history?.past.map(cloneEditorState) ?? []
  redoStack.value = history?.future.map(cloneEditorState) ?? []
}

watch(
  () => props.history,
  (next) => {
    initializeHistory(next ?? null)
  },
  { immediate: true }
)

const presets = PHOTO_FILTER_PRESETS

const adjustments = computed(() => ([
  { key: 'brightness', label: 'Luminosité', value: state.adjustments.brightness },
  { key: 'contrast', label: 'Contraste', value: state.adjustments.contrast },
  { key: 'saturation', label: 'Saturation', value: state.adjustments.saturation },
  { key: 'warmth', label: 'Chaleur', value: state.adjustments.warmth }
] as Array<{ key: AdjustmentKey; label: string; value: number }>))

const cropRatios: Array<{ id: CropRatio; label: string }> = [
  { id: 'original', label: 'Original' },
  { id: '16:9', label: '16:9' },
  { id: '4:3', label: '4:3' },
  { id: '1:1', label: '1:1' },
  { id: '9:16', label: '9:16' }
]

const formattedDate = computed(() => new Date(props.photo.stepDate * 1000).toLocaleString('fr-FR'))

const previewFilter = computed(() => buildCssFilter(state.adjustments, state.filterPreset))

const previewImageStyle = computed(() => ({
  filter: previewFilter.value,
  transform: `scale(${state.crop.zoom}) translate(${state.crop.offsetX}%, ${state.crop.offsetY}%) rotate(${state.rotation}deg)`,
  transformOrigin: 'center'
}))

const previewContainerStyle = computed(() => {
  let ratioValue = props.photo.width / props.photo.height
  switch (state.crop.ratio) {
    case '16:9':
      ratioValue = 16 / 9
      break
    case '4:3':
      ratioValue = 4 / 3
      break
    case '1:1':
      ratioValue = 1
      break
    case '9:16':
      ratioValue = 9 / 16
      break
    default:
      break
  }
  return { aspectRatio: ratioValue.toFixed(3) }
})

const snapshot = (): EditorState => ({
  filterPreset: state.filterPreset,
  adjustments: { ...state.adjustments },
  rotation: state.rotation,
  crop: { ...state.crop }
})

const exportHistory = (): EditorHistory => ({
  past: undoStack.value.map(cloneEditorState),
  future: redoStack.value.map(cloneEditorState)
})

const restoreState = (next: EditorState): void => {
  state.filterPreset = next.filterPreset
  state.adjustments = { ...next.adjustments }
  state.rotation = next.rotation
  state.crop = { ...next.crop }
}

const pushUndo = (): void => {
  undoStack.value.push(snapshot())
  redoStack.value = []
}

const canUndo = computed(() => undoStack.value.length > 0)
const canRedo = computed(() => redoStack.value.length > 0)

const applyFilterPreset = (preset: PhotoFilterPreset): void => {
  if (state.filterPreset === preset) {
    return
  }
  pushUndo()
  state.filterPreset = preset
}

const updateAdjustment = (key: AdjustmentKey, value: number): void => {
  if (state.adjustments[key] === value) {
    return
  }
  pushUndo()
  state.adjustments[key] = clampAdjustment(value)
}

const handleAdjustmentInput = (key: AdjustmentKey, event: Event): void => {
  const target = event.target as HTMLInputElement | null
  if (!target) {
    return
  }
  updateAdjustment(key, Number(target.value))
}

const rotate = (delta: number): void => {
  pushUndo()
  state.rotation = (state.rotation + delta + 360) % 360
}

const setCropRatio = (ratio: CropRatio): void => {
  if (state.crop.ratio === ratio) {
    return
  }
  pushUndo()
  state.crop.ratio = ratio
  state.crop.offsetX = 0
  state.crop.offsetY = 0
}

const onZoomInput = (event: Event): void => {
  const value = Number((event.target as HTMLInputElement).value)
  if (state.crop.zoom === value) {
    return
  }
  pushUndo()
  state.crop.zoom = Math.max(1, Math.min(3, value))
}

const clampOffset = (value: number): number => Math.max(-50, Math.min(50, value))

const onOffsetInput = (key: 'offsetX' | 'offsetY', event: Event): void => {
  const value = Number((event.target as HTMLInputElement).value)
  if (state.crop[key] === value) {
    return
  }
  pushUndo()
  state.crop[key] = clampOffset(value)
}

const onOffsetXInput = (event: Event): void => onOffsetInput('offsetX', event)
const onOffsetYInput = (event: Event): void => onOffsetInput('offsetY', event)

const undo = (): void => {
  const previous = undoStack.value.pop()
  if (!previous) {
    return
  }
  redoStack.value.push(snapshot())
  restoreState(previous)
}

const redo = (): void => {
  const next = redoStack.value.pop()
  if (!next) {
    return
  }
  undoStack.value.push(snapshot())
  restoreState(next)
}

const reset = (): void => {
  restoreState(createStateFromPhoto(props.photo))
  undoStack.value = []
  redoStack.value = []
  initializeHistory(props.history ?? null)
}

const apply = (): void => {
  const payload = {
    state: snapshot(),
    history: exportHistory()
  }

  emit('apply', payload)
  undoStack.value = []
  redoStack.value = []
  emit('close')
}

watch(
  () => props.photo.id,
  () => {
    restoreState(createStateFromPhoto(props.photo))
    undoStack.value = []
    redoStack.value = []
    initializeHistory(props.history ?? null)
  }
)
</script>

<style scoped>
.editor-overlay {
  position: fixed;
  inset: 0;
  background: rgba(18, 18, 18, 0.75);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  z-index: 999;
}

.editor-modal {
  width: min(1100px, 100%);
  background: rgba(255,255,255,0.96);
  border-radius: var(--radius-xxl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header,
.modal-footer {
  padding: var(--spacing-lg) var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
}

.modal-header p {
  margin: 0;
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #666);
}

.modal-content {
  display: flex;
  gap: var(--spacing-xl, 24px);
  padding: var(--spacing-xl, 24px);
  background: rgba(249,250,251,0.96);
  overflow: hidden;
}

.preview {
  flex: 1;
  background: white;
  border-radius: var(--radius-xl, 20px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  border-radius: inherit;
}

.controls {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg, 20px);
}

.control-block {
  background: white;
  border-radius: var(--radius-xl, 20px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
  padding: var(--spacing-lg, 20px);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

.control-block h3 {
  margin: 0;
  font-size: var(--font-size-lg, 18px);
  color: var(--color-text-primary, #1f2937);
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--spacing-sm, 12px);
}

.preset {
  border: 1px solid rgba(148, 163, 184, 0.4);
  border-radius: var(--radius-lg, 12px);
  padding: var(--spacing-sm, 12px);
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 197, 253, 0.1));
  font-weight: var(--font-weight-medium, 500);
  cursor: pointer;
  transition: all 0.2s;
}

.preset.active {
  border-color: var(--color-primary, #FF6B6B);
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.15), rgba(255, 180, 180, 0.2));
  color: var(--color-primary, #FF6B6B);
}

.sliders {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md, 16px);
}

.sliders label {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 6px);
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #475569);
}

.sliders input[type="range"] {
  accent-color: var(--color-primary, #FF6B6B);
}

.row {
  display: flex;
  gap: var(--spacing-sm, 12px);
}

.ratio-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--spacing-sm, 12px);
}

.ratio {
  border: 1px solid rgba(148, 163, 184, 0.4);
  border-radius: var(--radius-lg, 12px);
  padding: var(--spacing-sm, 12px);
  background: white;
  font-weight: var(--font-weight-medium, 500);
  cursor: pointer;
  transition: all 0.2s;
}

.ratio.active {
  border-color: var(--color-primary, #FF6B6B);
  color: var(--color-primary, #FF6B6B);
}

.modal-footer {
  background: white;
  border-top: 1px solid rgba(226, 232, 240, 0.8);
}

@media (max-width: 1024px) {
  .modal-content {
    flex-direction: column;
  }

  .controls {
    width: 100%;
  }
}
</style>
