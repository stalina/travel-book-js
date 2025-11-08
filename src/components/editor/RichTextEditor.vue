<template>
  <div class="rich-text-editor">
    <FormattingToolbar ref="toolbarRef" />
    <div
      ref="editorRef"
      class="editor-content"
      contenteditable="true"
      :data-placeholder="placeholder"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @keydown="handleKeydown"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue'
import FormattingToolbar from './FormattingToolbar.vue'
import { useTextFormatting } from '../../composables/useTextFormatting'

interface Props {
  modelValue: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Décrivez cette étape de votre voyage...'
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const toolbarRef = ref<InstanceType<typeof FormattingToolbar> | null>(null)
const { sanitizeHtml, handleSelectionChange } = useTextFormatting()

onMounted(() => {
  if (editorRef.value && props.modelValue) {
    editorRef.value.innerHTML = props.modelValue
  }

  // Écouter les changements de sélection pour mettre à jour la toolbar (guarded for test env)
  if (typeof document !== 'undefined' && document?.addEventListener) {
    document.addEventListener('selectionchange', handleSelectionChange)
    onUnmounted(() => {
      try {
        document.removeEventListener('selectionchange', handleSelectionChange)
      } catch (e) {
        // ignore in test env
      }
    })
  }
})

watch(() => props.modelValue, (newValue) => {
  if (editorRef.value && editorRef.value.innerHTML !== newValue) {
    editorRef.value.innerHTML = newValue
  }
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLDivElement
  const html = sanitizeHtml(target.innerHTML)
  emit('update:modelValue', html)
}

const handleFocus = () => {
  if (editorRef.value) {
    editorRef.value.classList.add('focused')
  }
}

const handleBlur = () => {
  if (editorRef.value) {
    editorRef.value.classList.remove('focused')
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Gérer les raccourcis clavier
  if (event.ctrlKey || event.metaKey) {
    switch (event.key.toLowerCase()) {
      case 'b':
        event.preventDefault()
        if (typeof document !== 'undefined' && document.execCommand) document.execCommand('bold', false)
        break
      case 'i':
        event.preventDefault()
        if (typeof document !== 'undefined' && document.execCommand) document.execCommand('italic', false)
        break
      case 'u':
        event.preventDefault()
        if (typeof document !== 'undefined' && document.execCommand) document.execCommand('underline', false)
        break
    }
  }
}
</script>

<style scoped>
.rich-text-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  background: white;
}

.editor-content {
  flex: 1;
  padding: var(--spacing-lg, 24px);
  min-height: 300px;
  max-height: 600px;
  overflow-y: auto;
  outline: none;
  font-size: var(--font-size-base, 16px);
  line-height: var(--line-height-relaxed, 1.75);
  color: var(--color-text-primary, #333);
}

.editor-content:empty::before {
  content: attr(data-placeholder);
  color: var(--color-text-tertiary, #9CA6B8);
  pointer-events: none;
}

.editor-content.focused {
  background: var(--color-background, #fafbfc);
}

/* Styles du contenu édité */
.editor-content :deep(h1) {
  font-size: var(--font-size-3xl, 1.875rem);
  font-weight: var(--font-weight-bold, 700);
  margin: var(--spacing-lg, 24px) 0 var(--spacing-md, 16px);
  line-height: var(--line-height-tight, 1.25);
}

.editor-content :deep(h2) {
  font-size: var(--font-size-2xl, 1.5rem);
  font-weight: var(--font-weight-semibold, 600);
  margin: var(--spacing-md, 16px) 0 var(--spacing-sm, 8px);
  line-height: var(--line-height-tight, 1.25);
}

.editor-content :deep(h3) {
  font-size: var(--font-size-xl, 1.25rem);
  font-weight: var(--font-weight-semibold, 600);
  margin: var(--spacing-md, 16px) 0 var(--spacing-sm, 8px);
  line-height: var(--line-height-normal, 1.5);
}

.editor-content :deep(p) {
  margin: var(--spacing-sm, 8px) 0;
}

.editor-content :deep(ul),
.editor-content :deep(ol) {
  margin: var(--spacing-md, 16px) 0;
  padding-left: var(--spacing-xl, 32px);
}

.editor-content :deep(li) {
  margin: var(--spacing-xs, 4px) 0;
}

.editor-content :deep(strong),
.editor-content :deep(b) {
  font-weight: var(--font-weight-bold, 700);
}

.editor-content :deep(em),
.editor-content :deep(i) {
  font-style: italic;
}

.editor-content :deep(u) {
  text-decoration: underline;
}

.editor-content :deep(s) {
  text-decoration: line-through;
}
</style>
