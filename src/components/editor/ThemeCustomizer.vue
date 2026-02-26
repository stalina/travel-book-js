<template>
  <div class="theme-customizer">
    <div class="customizer-header">
      <h3 class="customizer-title">Personnalisation</h3>
      <button
        v-if="hasOverrides"
        class="customizer-reset"
        @click="resetAll"
        title="Réinitialiser toutes les personnalisations"
      >
        ↩ Réinitialiser
      </button>
    </div>

    <!-- Couleurs -->
    <details class="customizer-section" open>
      <summary class="section-summary">🎨 Couleurs</summary>
      <div class="section-body">
        <ColorField
          v-for="field in colorFields"
          :key="field.key"
          :label="field.label"
          :value="currentColors[field.key]"
          @update="val => updateOverride(field.key, val)"
        />
      </div>
    </details>

    <!-- Décorations -->
    <details class="customizer-section">
      <summary class="section-summary">✨ Décorations</summary>
      <div class="section-body">
        <div class="field-group">
          <label class="field-label">Style de bordure</label>
          <select
            class="field-select"
            :value="currentDecorations.borderStyle"
            @change="onSelectChange($event, 'borderStyle')"
          >
            <option value="none">Aucune</option>
            <option value="solid">Plein</option>
            <option value="dashed">Tirets</option>
            <option value="double">Double</option>
          </select>
        </div>

        <SliderField
          label="Rayon des coins"
          :value="currentDecorations.borderRadius"
          :min="0"
          :max="24"
          unit="px"
          @update="val => updateOverride('borderRadius', val)"
        />

        <div class="field-group">
          <label class="field-label">Séparateur</label>
          <select
            class="field-select"
            :value="currentDecorations.separatorStyle"
            @change="onSelectChange($event, 'separatorStyle')"
          >
            <option value="none">Aucun</option>
            <option value="line">Ligne</option>
            <option value="dots">Pointillés</option>
            <option value="wave">Vague</option>
          </select>
        </div>

        <SliderField
          label="Opacité overlay couverture"
          :value="currentDecorations.coverOverlayOpacity"
          :min="0"
          :max="1"
          :step="0.05"
          @update="val => updateOverride('coverOverlayOpacity', val)"
        />
      </div>
    </details>

    <!-- Espacements -->
    <details class="customizer-section">
      <summary class="section-summary">📏 Espacements</summary>
      <div class="section-body">
        <SliderField
          label="Marge contenu"
          :value="currentSpacing.contentPadding"
          :min="100"
          :max="300"
          unit="px"
          @update="val => updateOverride('contentPadding', val)"
        />
        <SliderField
          label="Espacement photos"
          :value="currentSpacing.photoGap"
          :min="0"
          :max="24"
          unit="px"
          @update="val => updateOverride('photoGap', val)"
        />
        <SliderField
          label="Espacement sections"
          :value="currentSpacing.sectionGap"
          :min="8"
          :max="48"
          unit="px"
          @update="val => updateOverride('sectionGap', val)"
        />
      </div>
    </details>

    <!-- Contraste WCAG -->
    <details class="customizer-section">
      <summary class="section-summary">
        ♿ Accessibilité
        <span v-if="worstLevel === 'FAIL'" class="wcag-badge wcag-fail">FAIL</span>
        <span v-else-if="worstLevel === 'AA'" class="wcag-badge wcag-aa">AA</span>
        <span v-else class="wcag-badge wcag-aaa">AAA</span>
      </summary>
      <div class="section-body">
        <div
          v-for="check in contrastChecks"
          :key="check.label"
          class="contrast-row"
        >
          <div class="contrast-label">{{ check.label }}</div>
          <div class="contrast-info">
            <span
              class="contrast-swatch"
              :style="{ background: check.foreground }"
              :title="check.foreground"
            ></span>
            <span class="contrast-on">sur</span>
            <span
              class="contrast-swatch"
              :style="{ background: check.background, border: '1px solid #ccc' }"
              :title="check.background"
            ></span>
            <span class="contrast-ratio">{{ check.ratio.toFixed(1) }}:1</span>
            <span
              class="wcag-badge"
              :class="{
                'wcag-aaa': check.level === 'AAA',
                'wcag-aa': check.level === 'AA',
                'wcag-fail': check.level === 'FAIL',
              }"
            >{{ check.level }}</span>
          </div>
        </div>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useEditorStore } from '../../stores/editor.store'
import { ThemeService } from '../../services/theme.service'
import type { ThemeOverrides, ContrastCheck } from '../../models/theme.types'
import ColorField from './theme/ColorField.vue'
import SliderField from './theme/SliderField.vue'

const editorStore = useEditorStore()
const themeService = ThemeService.getInstance()

// -- Resolved theme (base + overrides) for displaying current values --------

const resolvedTheme = computed(() =>
  themeService.resolveTheme(editorStore.selectedThemeId, editorStore.themeOverrides),
)

const currentColors = computed(() => resolvedTheme.value.colors)
const currentDecorations = computed(() => resolvedTheme.value.decorations)
const currentSpacing = computed(() => resolvedTheme.value.spacing)

const hasOverrides = computed(() =>
  Object.keys(editorStore.themeOverrides).length > 0,
)

// -- Color field definitions ------------------------------------------------

const colorFields = [
  { key: 'primary' as const, label: 'Couleur primaire' },
  { key: 'secondary' as const, label: 'Couleur secondaire' },
  { key: 'accent' as const, label: 'Accent' },
  { key: 'background' as const, label: 'Fond de page' },
  { key: 'textPrimary' as const, label: 'Texte principal' },
  { key: 'textSecondary' as const, label: 'Texte secondaire' },
  { key: 'borderColor' as const, label: 'Bordures' },
]

// -- WCAG contrast checks ---------------------------------------------------

const contrastChecks = computed<ContrastCheck[]>(() =>
  themeService.checkThemeContrasts(editorStore.selectedThemeId, editorStore.themeOverrides),
)

const worstLevel = computed(() => {
  const checks = contrastChecks.value
  if (checks.some(c => c.level === 'FAIL')) return 'FAIL'
  if (checks.some(c => c.level === 'AA')) return 'AA'
  return 'AAA'
})

// -- Debounced override application -----------------------------------------

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const pendingOverrides = ref<ThemeOverrides>({ ...editorStore.themeOverrides })

// Keep pending in sync if store changes externally (theme switch, reset)
watch(() => editorStore.themeOverrides, (v) => {
  pendingOverrides.value = { ...v }
}, { deep: true })

const updateOverride = (key: string, value: unknown) => {
  pendingOverrides.value = { ...pendingOverrides.value, [key]: value }

  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    editorStore.setThemeOverrides({ ...pendingOverrides.value })
  }, 300)
}

const onSelectChange = (event: Event, key: string) => {
  const select = event.target as HTMLSelectElement
  updateOverride(key, select.value)
}

const resetAll = () => {
  pendingOverrides.value = {}
  editorStore.resetThemeOverrides()
}
</script>

<style scoped>
.theme-customizer {
  padding: 12px 16px;
}

.customizer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.customizer-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-text-1, #1a1a1a);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.customizer-reset {
  background: none;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11px;
  color: #666;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.customizer-reset:hover {
  background: #f2f2f2;
  color: #333;
}

/* -- Sections accordion -- */
.customizer-section {
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
}

.section-summary {
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fafafa;
  list-style: none;
}
.section-summary::-webkit-details-marker { display: none; }
.section-summary::before {
  content: '▶';
  font-size: 9px;
  transition: transform 0.2s;
}
details[open] > .section-summary::before {
  transform: rotate(90deg);
}

.section-body {
  padding: 8px 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* -- Form fields -- */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 11px;
  font-weight: 500;
  color: #555;
}

.field-select {
  padding: 4px 8px;
  border: 1px solid #d0d0d0;
  border-radius: 6px;
  font-size: 12px;
  background: #fff;
  color: #333;
  cursor: pointer;
}

/* -- Contrast rows -- */
.contrast-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contrast-label {
  font-size: 11px;
  font-weight: 500;
  color: #555;
}

.contrast-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
}

.contrast-swatch {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 3px;
  flex-shrink: 0;
}

.contrast-on {
  color: #999;
  font-size: 10px;
}

.contrast-ratio {
  font-weight: 600;
  color: #333;
}

/* -- WCAG badges -- */
.wcag-badge {
  display: inline-block;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.wcag-aaa {
  background: #e8f5e9;
  color: #2e7d32;
}
.wcag-aa {
  background: #fff3e0;
  color: #e65100;
}
.wcag-fail {
  background: #ffebee;
  color: #c62828;
}
</style>
