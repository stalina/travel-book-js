<template>
  <div class="formatting-toolbar">
    <div class="toolbar-group">
      <button
        :class="['toolbar-btn', { active: isFormatActive.bold }]"
        title="Gras (Ctrl+B)"
        @click="applyFormat('bold')"
      >
        <strong>B</strong>
      </button>
      <button
        :class="['toolbar-btn', { active: isFormatActive.italic }]"
        title="Italique (Ctrl+I)"
        @click="applyFormat('italic')"
      >
        <em>I</em>
      </button>
      <button
        :class="['toolbar-btn', { active: isFormatActive.underline }]"
        title="Souligné (Ctrl+U)"
        @click="applyFormat('underline')"
      >
        <u>U</u>
      </button>
      <button
        :class="['toolbar-btn', { active: isFormatActive.strikethrough }]"
        title="Barré"
        @click="applyFormat('strikethrough')"
      >
        <s>S</s>
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button
        :class="['toolbar-btn', { active: isFormatActive.h1 }]"
        title="Titre 1"
        @click="applyFormat('h1')"
      >
        H1
      </button>
      <button
        :class="['toolbar-btn', { active: isFormatActive.h2 }]"
        title="Titre 2"
        @click="applyFormat('h2')"
      >
        H2
      </button>
      <button
        :class="['toolbar-btn', { active: isFormatActive.h3 }]"
        title="Titre 3"
        @click="applyFormat('h3')"
      >
        H3
      </button>
    </div>

    <div class="toolbar-separator"></div>

    <div class="toolbar-group">
      <button
        :class="['toolbar-btn', { active: isFormatActive.ul }]"
        title="Liste à puces"
        @click="applyFormat('ul')"
      >
        ☰
      </button>
      <button
        :class="['toolbar-btn', { active: isFormatActive.ol }]"
        title="Liste numérotée"
        @click="applyFormat('ol')"
      >
        ≡
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTextFormatting, type FormatType } from '../../composables/useTextFormatting'

const { isFormatActive, applyFormat } = useTextFormatting()

// Exposer pour que le parent puisse updater les formats
defineExpose({
  updateActiveFormats: useTextFormatting().updateActiveFormats
})
</script>

<style scoped>
.formatting-toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  background: white;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.toolbar-group {
  display: flex;
  gap: var(--spacing-xs, 4px);
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: var(--color-border, #e0e0e0);
}

.toolbar-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 var(--spacing-sm, 8px);
  border: 1px solid var(--color-border, #e0e0e0);
  border-radius: var(--radius-sm, 4px);
  background: white;
  color: var(--color-text-primary, #333);
  font-size: var(--font-size-sm, 14px);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toolbar-btn:hover {
  background: var(--color-background, #f5f5f5);
  border-color: var(--color-primary, #FF6B6B);
}

.toolbar-btn.active {
  background: var(--color-primary, #FF6B6B);
  color: white;
  border-color: var(--color-primary, #FF6B6B);
}

.toolbar-btn strong,
.toolbar-btn em,
.toolbar-btn u,
.toolbar-btn s {
  font-style: normal;
  text-decoration: none;
}

.toolbar-btn em {
  font-style: italic;
}

.toolbar-btn u {
  text-decoration: underline;
}

.toolbar-btn s {
  text-decoration: line-through;
}
</style>
