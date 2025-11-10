<template>
  <section class="section">
    <div class="section-head">
      <h3>Pages & mise en page</h3>
      <div class="controls">
        <button class="nav-btn" :disabled="!canMoveLeft" @click="$emit('move-page', -1)" data-test="move-page-left">◀</button>
        <button class="nav-btn" :disabled="!canMoveRight" @click="$emit('move-page', 1)" data-test="move-page-right">▶</button>
        <BaseButton variant="primary" size="sm" data-test="add-page" @click="$emit('add-page')">Ajouter</BaseButton>
        <BaseButton variant="secondary" size="sm" @click="$emit('generate-default-pages')">Générer par défaut</BaseButton>
        <BaseButton variant="ghost" size="sm" :disabled="!hasActive" @click="$emit('remove-active-page')">Supprimer</BaseButton>
      </div>
    </div>

    <div v-if="pages && pages.length" class="pages-strip">
      <button
        v-for="(pageItem, idx) in pages"
        :key="pageItem.id"
        class="page-thumb"
        :class="{ active: pageItem.id === activePageId }"
        @click="$emit('select-page', pageItem.id)"
        :data-test="`page-chip-${idx + 1}`"
      >
        <div class="thumb-preview">
          <div v-if="idx === 0" class="thumb-cover">
            <div v-if="coverFormat === 'text-image'" class="mini-cover layout-preview cover-preview text-image" aria-hidden="true">
              <div class="cover-text-block">
                <div class="title-line small"></div>
                <div class="subtitle-line xsmall"></div>
              </div>
              <div class="cover-thumb small-thumb"><div class="img-placeholder"></div></div>
            </div>
            <div v-else class="mini-cover layout-preview cover-preview text-only" aria-hidden="true">
              <div class="cover-text-large">
                <div class="title-line medium"></div>
                <div class="subtitle-line small"></div>
              </div>
            </div>
          </div>
          <div v-else class="thumb-grid">
            <div class="mini-layout" aria-hidden="true">
              <div :class="['layout-preview', previewClassFor[pageItem.layout]]">
                <template v-if="pageItem.layout === 'grid-2x2'">
                  <span class="layout-block"></span>
                  <span class="layout-block"></span>
                  <span class="layout-block"></span>
                  <span class="layout-block"></span>
                </template>
                <template v-else-if="pageItem.layout === 'hero-plus-2'">
                  <span class="layout-block" style="grid-row: 1 / 3;"></span>
                  <span class="layout-block"></span>
                  <span class="layout-block"></span>
                </template>
                <template v-else-if="pageItem.layout === 'three-columns'">
                  <span class="layout-block"></span>
                  <span class="layout-block"></span>
                  <span class="layout-block"></span>
                </template>
                <template v-else>
                  <span class="layout-block"></span>
                </template>
              </div>
            </div>
          </div>
        </div>
        <span class="label">{{ idx === 0 ? 'Couverture' : `Page ${idx + 1}` }}</span>
      </button>
    </div>

    <div v-else class="empty-msg">Aucune page. Cliquez sur "Générer par défaut".</div>
  </section>
</template>

<script setup lang="ts">
import BaseButton from '../BaseButton.vue'
import type { PropType } from 'vue'

const props = defineProps({
  pages: { type: Array as PropType<any[]>, default: () => [] },
  activePageId: { type: String, default: '' },
  coverFormat: { type: String, default: 'text-image' },
  previewClassFor: { type: Object as PropType<Record<string, string>>, required: true },
  canMoveLeft: { type: Boolean, default: false },
  canMoveRight: { type: Boolean, default: false },
  hasActive: { type: Boolean, default: false }
})
</script>

<style scoped>
.section { margin-bottom:24px; background:#fff; border-radius:8px; padding:16px }
.section-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px }
.section-head h3 { font-size:18px; font-weight:600; margin:0; color:#1f2937 }
.controls { display:flex; gap:8px; align-items:center }
.nav-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.nav-btn:hover:not(:disabled) { background: #f3f4f6; }
.nav-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pages-strip { display:flex; gap:12px; overflow-x:auto; padding:8px 0 }
.page-thumb {
  flex-shrink:0;
  width:110px;
  border:2px solid #e5e7eb;
  background:#fff;
  border-radius:8px;
  padding:8px;
  cursor:pointer;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px;
  overflow:hidden;
  transition:border-color 0.12s ease-in-out, box-shadow 0.12s ease-in-out, background 0.12s ease-in-out;
}
.page-thumb:hover { border-color:#3b82f6 }
.page-thumb.active { border-color:#3b82f6; background:#eff6ff; box-shadow:0 0 0 3px rgba(59,130,246,0.1) }
.thumb-preview {
  width:100%;
  height:72px;
  background:#f3f4f6;
  border-radius:4px;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:4px;
  box-sizing:border-box;
}
.thumb-cover { display:flex; flex-direction:column; align-items:center; gap:4px; font-size:14px; font-weight:600 }
.thumb-cover .mini-cover {
  width:100%;
  max-width:96px;
  height:100%;
  padding:4px;
  box-sizing:border-box;
  display:flex;
  flex-direction:row;
  gap:6px;
  align-items:center;
  justify-content:center;
}
.cover-preview { background:linear-gradient(180deg,#fbfdff,#ffffff); border-radius:8px }
.cover-preview.text-image { display:flex; align-items:center; gap:6px }
.cover-preview.text-only { display:flex; flex-direction:column; justify-content:center; gap:6px }
.cover-text-block { display:flex; flex-direction:column; gap:4px }
.cover-text-large { display:flex; flex-direction:column; gap:6px }
.cover-thumb { width:48px; height:48px; border-radius:8px; background:linear-gradient(180deg,#e8eefc,#f5f7ff); display:flex; align-items:center; justify-content:center }
.cover-thumb .img-placeholder { width:100%; height:100%; border-radius:inherit; background:linear-gradient(180deg,#cfe1ff,#e6efff) }
.mini-cover .title-line.small { height:8px; width:50%; border-radius:4px }
.mini-cover .title-line.medium { height:10px; width:60%; border-radius:6px }
.mini-cover .subtitle-line.xsmall { height:6px; width:40%; border-radius:4px }
.small-thumb { min-width:32px; height:40px; border-radius:6px; overflow:hidden }
.thumb-grid { display:flex; gap:6px; align-items:center; justify-content:center; flex-wrap:wrap }
.thumb-grid .slot { width:40px; height:28px; background:linear-gradient(180deg,#eef2ff,#f8fbff); border-radius:4px }
.mini-layout .layout-preview {
  width:96px;
  height:56px;
  padding:6px;
  box-sizing:border-box;
  border-radius:6px;
  gap:6px;
  display:grid;
  background:linear-gradient(180deg,#fbfdff,#ffffff);
}
.mini-layout .layout-preview.grid-2x2 { grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr }
.mini-layout .layout-preview.hero-side { grid-template-columns:2fr 1fr; grid-template-rows:1fr 1fr }
.mini-layout .layout-preview.three-columns { grid-template-columns:1fr 1fr 1fr; grid-template-rows:1fr }
.mini-layout .layout-preview.full-page { grid-template-columns:1fr }
.mini-layout .layout-block {
  border-radius:4px;
  background:linear-gradient(180deg,#e6ecfb,#f3f6ff);
}
.page-thumb .label { font-size:11px; color:#6b7280; text-align:center }
.empty-msg { padding:32px; text-align:center; color:#9ca3af; background:#f9fafb; border:1px dashed #d1d5db; border-radius:8px }
</style>
