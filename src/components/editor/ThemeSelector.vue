<template>
  <div class="theme-selector">
    <h3 class="theme-selector-title">Thème visuel</h3>
    <div class="theme-grid">
      <button
        v-for="theme in themes"
        :key="theme.id"
        class="theme-card"
        :class="{ 'theme-card--active': theme.id === editorStore.selectedThemeId }"
        @click="selectTheme(theme.id)"
        :title="theme.description"
      >
        <div class="theme-card-preview" :style="previewStyle(theme)">
          <span class="theme-card-icon">{{ theme.icon }}</span>
        </div>
        <div class="theme-card-info">
          <span class="theme-card-name">{{ theme.name }}</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditorStore } from '../../stores/editor.store'
import { ThemeService } from '../../services/theme.service'
import type { ThemeConfig } from '../../models/theme.types'

const editorStore = useEditorStore()
const themeService = ThemeService.getInstance()
const themes = themeService.getAllThemes()

const selectTheme = (id: string) => {
  editorStore.setTheme(id)
}

const previewStyle = (theme: ThemeConfig) => ({
  background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
  borderColor: theme.colors.primary,
})
</script>

<style scoped>
.theme-selector {
  padding: 16px;
}

.theme-selector-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1, #1a1a1a);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
}

.theme-card {
  display: flex;
  flex-direction: column;
  border: 2px solid transparent;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  background: var(--vp-c-bg-soft, #f5f5f5);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  padding: 0;
  text-align: center;
}

.theme-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.theme-card--active {
  border-color: var(--vp-c-brand, #3451b2);
  box-shadow: 0 0 0 2px rgba(52, 81, 178, 0.2);
}

.theme-card-preview {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.theme-card-icon {
  font-size: 28px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.theme-card-info {
  padding: 6px 4px 8px;
}

.theme-card-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--vp-c-text-1, #1a1a1a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}
</style>
