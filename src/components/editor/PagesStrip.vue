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
.page-thumb { flex-shrink:0; width:110px; border:2px solid #e5e7eb; background:white; border-radius:8px; padding:8px; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:8px; overflow:hidden }
.page-thumb:hover { border-color:#3b82f6 }
.page-thumb.active { border-color:#3b82f6; background:#eff6ff; box-shadow:0 0 0 3px rgba(59,130,246,0.1) }
.thumb-preview { width:100%; height:72px; background:#f3f4f6; border-radius:4px; display:flex; align-items:center; justify-content:center; padding:4px; box-sizing:border-box }
.thumb-cover { display:flex; flex-direction:column; align-items:center; gap:4px; font-size:14px; font-weight:600 }
.mini-cover .title-line.small { height:8px; width:50%; border-radius:4px }
.mini-cover .title-line.medium { height:10px; width:60%; border-radius:6px }
.mini-cover .subtitle-line.xsmall { height:6px; width:40%; border-radius:4px }
.small-thumb { min-width:32px; height:40px; border-radius:6px; overflow:hidden }
.thumb-grid { display:flex; gap:6px; align-items:center; justify-content:center; flex-wrap:wrap }
.mini-layout .layout-preview { width:96px; height:56px; padding:6px; box-sizing:border-box; border-radius:6px; gap:6px }
.mini-layout .layout-block { border-radius:4px }
.page-thumb .label { font-size:11px; color:#6b7280; text-align:center }
.empty-msg { padding:32px; text-align:center; color:#9ca3af; background:#f9fafb; border:1px dashed #d1d5db; border-radius:8px }
</style>
