<template>
  <aside class="editor-sidebar">
    <div class="sidebar-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="switchTab(tab.id)"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>
    <div class="sidebar-content">
      <slot :active-tab="activeTab"></slot>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEditorStore } from '../../stores/editor.store'

const editorStore = useEditorStore()

const tabs = [
  { id: 'steps' as const, label: 'Étapes', icon: '📍' },
  { id: 'themes' as const, label: 'Thèmes', icon: '🎨' },
  { id: 'options' as const, label: 'Options', icon: '⚙️' }
]

const activeTab = ref(editorStore.activeSidebarTab)

const switchTab = (tabId: 'steps' | 'themes' | 'options') => {
  activeTab.value = tabId
  editorStore.setActiveSidebarTab(tabId)
}
</script>

<style scoped>
.editor-sidebar {
  grid-area: sidebar;
  background: var(--color-background, #f5f5f5);
  border-right: 1px solid var(--color-border, #e0e0e0);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-tabs {
  display: flex;
  background: white;
  border-bottom: 1px solid var(--color-border, #e0e0e0);
  padding: var(--spacing-xs, 4px);
  gap: var(--spacing-xs, 4px);
}

.tab-button {
  flex: 1;
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm, 4px);
  font-size: var(--font-size-sm, 14px);
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-secondary, #666);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs, 4px);
}

.tab-button:hover {
  background: var(--color-background, #f5f5f5);
  color: var(--color-text-primary, #333);
}

.tab-button.active {
  background: var(--color-primary, #FF6B6B);
  color: white;
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md, 16px);
}

@media (max-width: 992px) {
  .editor-sidebar {
    width: 240px;
  }
  
  .tab-button {
    font-size: var(--font-size-xs, 12px);
  }
}

@media (max-width: 768px) {
  .editor-sidebar {
    display: none;
  }
}
</style>
