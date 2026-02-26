<template>
  <div class="color-field">
    <label class="color-field-label">{{ label }}</label>
    <div class="color-field-controls">
      <input
        type="color"
        class="color-field-picker"
        :value="hexValue"
        @input="onPickerInput"
      />
      <input
        type="text"
        class="color-field-text"
        :value="value"
        @change="onTextChange"
        spellcheck="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ThemeService } from '../../../services/theme.service'

const props = defineProps<{
  label: string
  value: string
}>()

const emit = defineEmits<{
  update: [value: string]
}>()

const themeService = ThemeService.getInstance()

/**
 * Convertit la valeur CSS courante en hex #rrggbb pour l'input[type=color].
 * Si la valeur n'est pas parsable, retourne #000000.
 */
const hexValue = computed(() => {
  const rgb = themeService.parseColor(props.value)
  if (!rgb) return '#000000'
  return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('')
})

const onPickerInput = (e: Event) => {
  const hex = (e.target as HTMLInputElement).value
  emit('update', hex)
}

const onTextChange = (e: Event) => {
  const text = (e.target as HTMLInputElement).value.trim()
  if (text) emit('update', text)
}
</script>

<style scoped>
.color-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-field-label {
  font-size: 11px;
  font-weight: 500;
  color: #555;
}

.color-field-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-field-picker {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  cursor: pointer;
  flex-shrink: 0;
  background: none;
}
.color-field-picker::-webkit-color-swatch-wrapper {
  padding: 2px;
}
.color-field-picker::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.color-field-text {
  flex: 1;
  min-width: 0;
  padding: 4px 8px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 11px;
  font-family: monospace;
  color: #333;
  background: #fff;
}
</style>
