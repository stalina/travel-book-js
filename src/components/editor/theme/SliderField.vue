<template>
  <div class="slider-field">
    <div class="slider-header">
      <label class="slider-label">{{ label }}</label>
      <span class="slider-value">{{ displayValue }}</span>
    </div>
    <input
      type="range"
      class="slider-input"
      :value="value"
      :min="min"
      :max="max"
      :step="step"
      @input="onInput"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label: string
  value: number
  min: number
  max: number
  step?: number
  unit?: string
}>(), {
  step: 1,
  unit: '',
})

const emit = defineEmits<{
  update: [value: number]
}>()

const displayValue = computed(() => {
  const v = props.step < 1 ? props.value.toFixed(2) : String(props.value)
  return v + (props.unit ? ` ${props.unit}` : '')
})

const onInput = (e: Event) => {
  const raw = (e.target as HTMLInputElement).value
  emit('update', parseFloat(raw))
}
</script>

<style scoped>
.slider-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider-label {
  font-size: 11px;
  font-weight: 500;
  color: #555;
}

.slider-value {
  font-size: 11px;
  font-weight: 600;
  color: #333;
  font-family: monospace;
}

.slider-input {
  width: 100%;
  height: 6px;
  appearance: none;
  -webkit-appearance: none;
  background: #e0e0e0;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}
.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--vp-c-brand, #3451b2);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.slider-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--vp-c-brand, #3451b2);
  cursor: pointer;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
</style>
