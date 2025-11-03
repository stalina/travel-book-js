<template>
  <div class="step-title-editor">
    <input
      v-model="localTitle"
      type="text"
      class="title-input"
      placeholder="Nom de l'étape"
      @blur="handleBlur"
      @keydown.enter="handleEnter"
    />
    <span v-if="error" class="title-error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  required?: boolean
  minLength?: number
  maxLength?: number
}

const props = withDefaults(defineProps<Props>(), {
  required: true,
  minLength: 1,
  maxLength: 100
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localTitle = ref(props.modelValue)
const error = ref('')

watch(() => props.modelValue, (newValue) => {
  localTitle.value = newValue
})

const validate = (): boolean => {
  error.value = ''
  
  if (props.required && !localTitle.value.trim()) {
    error.value = 'Le titre est requis'
    return false
  }
  
  if (localTitle.value.length < props.minLength) {
    error.value = `Le titre doit contenir au moins ${props.minLength} caractère(s)`
    return false
  }
  
  if (localTitle.value.length > props.maxLength) {
    error.value = `Le titre ne peut pas dépasser ${props.maxLength} caractères`
    return false
  }
  
  return true
}

const handleBlur = () => {
  if (validate()) {
    emit('update:modelValue', localTitle.value.trim())
  } else {
    // Restaurer la valeur précédente si invalide
    localTitle.value = props.modelValue
  }
}

const handleEnter = (event: KeyboardEvent) => {
  event.preventDefault()
  ;(event.target as HTMLInputElement).blur()
}
</script>

<style scoped>
.step-title-editor {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs, 4px);
  margin-bottom: var(--spacing-lg, 24px);
}

.title-input {
  width: 100%;
  padding: var(--spacing-md, 16px);
  font-size: var(--font-size-2xl, 24px);
  font-weight: var(--font-weight-bold, 700);
  color: var(--color-text-primary, #333);
  border: 2px solid transparent;
  border-radius: var(--radius-md, 8px);
  background: var(--color-background, #f5f5f5);
  transition: all 0.2s;
  outline: none;
}

.title-input:hover {
  background: white;
  border-color: var(--color-border, #e0e0e0);
}

.title-input:focus {
  background: white;
  border-color: var(--color-primary, #FF6B6B);
  box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
}

.title-input::placeholder {
  color: var(--color-text-tertiary, #9CA6B8);
}

.title-error {
  font-size: var(--font-size-sm, 14px);
  color: var(--color-error, #F56565);
  padding-left: var(--spacing-md, 16px);
}
</style>
