<template>
  <section class="section">
    <h4>{{ title }}</h4>
    <div class="options layout-options-row">
      <div class="layout-option-grid">
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          class="layout-option-button"
          :class="{ active: opt.value === active }"
          @click="$emit('select', opt.value)"
          :data-test="`layout-option-${opt.value}`"
        >
          <div :class="['layout-preview', previewClassFor[opt.value]]" aria-hidden="true">
            <template v-if="opt.value === 'grid-2x2'">
              <span class="layout-block"></span>
              <span class="layout-block"></span>
              <span class="layout-block"></span>
              <span class="layout-block"></span>
            </template>
            <template v-else-if="opt.value === 'hero-plus-2'">
              <span class="layout-block" style="grid-row: 1 / 3;"></span>
              <span class="layout-block"></span>
              <span class="layout-block"></span>
            </template>
            <template v-else-if="opt.value === 'three-columns'">
              <span class="layout-block"></span>
              <span class="layout-block"></span>
              <span class="layout-block"></span>
            </template>
            <template v-else>
              <span class="layout-block"></span>
            </template>
          </div>
          <div class="layout-option-content">
            <span class="layout-option-label">{{ opt.label }}</span>
            <span class="layout-option-description">{{ descriptions[opt.value] ?? '' }}</span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  title: { type: String, default: 'Mise en page' },
  options: { type: Array as PropType<Array<{ value: string; label: string }>>, default: () => [] },
  active: { type: String, default: '' },
  previewClassFor: { type: Object as PropType<Record<string, string>>, required: true },
  descriptions: { type: Object as PropType<Record<string, string>>, default: () => ({}) }
})
</script>

<style scoped>
.layout-options-row { display:flex; gap:12px; flex-wrap:nowrap; overflow-x:auto }
.layout-option-grid { display:flex; gap:12px; flex-wrap:nowrap; overflow-x:auto }
.layout-option-button { border:1px solid rgba(15,23,42,0.04); background:#fff; padding:0; border-radius:12px; cursor:pointer; display:flex; flex-direction:column; min-width:220px }
.layout-option-button:hover { transform:translateY(-3px); box-shadow:0 12px 30px rgba(15,23,42,0.06) }
.layout-preview { aspect-ratio:16/10; background:white; border-radius:8px; margin-bottom:8px; display:grid; gap:4px; padding:8px; box-sizing:border-box }
.layout-preview.grid-2x2 { grid-template-columns:1fr 1fr; grid-template-rows:1fr 1fr }
.layout-preview.hero-side { grid-template-columns:2fr 1fr; grid-template-rows:1fr 1fr }
.layout-preview .layout-block { background:#e6eefc; border-radius:6px }
.layout-option-content { padding:8px 10px; background:#fff; border-radius:0 0 12px 12px }
.layout-option-label { font-weight:700; color:#0f172a }
.layout-option-description { font-size:12px; color:#64748b }
</style>
