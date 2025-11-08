<template>
  <section class="gallery-filters">
    <div class="filters-row">
      <label class="filter search">
        <span>Recherche</span>
        <input
          type="search"
          :value="filters.search"
          placeholder="Rechercher par étape, lieu ou fichier"
          @input="onSearch"
        />
      </label>

      <label class="filter select">
        <span>Lieu</span>
        <select multiple size="4" :value="filters.locations" @change="onLocationsChange">
          <option v-for="option in locationOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <div class="filter dates">
        <label>
          <span>Du</span>
          <input type="date" :value="filters.startDate ?? ''" @change="onDateChange('startDate', $event)" />
        </label>
        <label>
          <span>Au</span>
          <input type="date" :value="filters.endDate ?? ''" @change="onDateChange('endDate', $event)" />
        </label>
      </div>

      <label class="filter select tags">
        <span>Tags</span>
        <select multiple size="6" :value="filters.tags" @change="onTagsChange">
          <option v-for="option in tagOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="filter select sort">
        <span>Tri</span>
        <select :value="filters.sortBy" @change="onSortChange">
          <option value="date">Date</option>
          <option value="name">Nom de fichier</option>
          <option value="size">Taille</option>
          <option value="score">Score IA</option>
        </select>
        <button class="sort-direction" :title="sortTitle" @click="toggleSortDirection">
          {{ filters.sortDirection === 'asc' ? '⬆️' : '⬇️' }}
        </button>
      </label>
    </div>

    <div class="filters-footer">
      <div class="chips" v-if="filters.tags.length || filters.locations.length">
        <span v-for="tag in filters.locations" :key="`loc-${tag}`" class="chip">
          📍 {{ tag }}
        </span>
        <span v-for="tag in filters.tags" :key="`tag-${tag}`" class="chip">
          🏷️ {{ tag }}
        </span>
      </div>
      <BaseButton v-if="hasActiveFilters" variant="ghost" size="sm" @click="reset">
        Réinitialiser les filtres
      </BaseButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '../BaseButton.vue'
import { useGalleryFilters } from '../../composables/useGalleryFilters'
import type { GalleryFilters } from '../../models/gallery.types'

const { filters, locationOptions, tagOptions, updateFilter, reset, hasActiveFilters } = useGalleryFilters()

const onSearch = (event: Event) => {
  updateFilter('search', (event.target as HTMLInputElement).value)
}

const onLocationsChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const values = Array.from(select.selectedOptions).map(option => option.value)
  updateFilter('locations', values)
}

const onTagsChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  const values = Array.from(select.selectedOptions).map(option => option.value)
  updateFilter('tags', values)
}

const onDateChange = (key: 'startDate' | 'endDate', event: Event) => {
  const input = event.target as HTMLInputElement
  updateFilter(key, input.value ? input.value : null)
}

const onSortChange = (event: Event) => {
  updateFilter('sortBy', (event.target as HTMLSelectElement).value as GalleryFilters['sortBy'])
}

const toggleSortDirection = () => {
  updateFilter('sortDirection', filters.value.sortDirection === 'asc' ? 'desc' : 'asc')
}

const sortTitle = computed(() => (filters.value.sortDirection === 'asc' ? 'Tri croissant' : 'Tri décroissant'))
</script>

<style scoped>
.gallery-filters {
  padding: var(--spacing-lg) var(--spacing-xl);
  background: linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.filters-row {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(160px, 1fr) minmax(240px, 1.1fr) minmax(220px, 1fr) minmax(160px, 0.8fr);
  gap: var(--spacing-lg);
}

.filter {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm, 14px);
  color: var(--color-text-secondary, #555);
}

.filter input,
.filter select {
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border, #e0e0e0);
  background: white;
  font-size: var(--font-size-sm, 14px);
}

.filter select[multiple] {
  height: 100%;
}

.filter.dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.filter.tags select {
  min-height: 120px;
}

.filter.sort {
  position: relative;
}

.sort-direction {
  position: absolute;
  right: 8px;
  top: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
}

.filters-footer {
  margin-top: var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.chip {
  background: rgba(0,0,0,0.05);
  border-radius: var(--radius-full);
  padding: 4px 12px;
  font-size: 12px;
}

@media (max-width: 1200px) {
  .filters-row {
    grid-template-columns: repeat(2, minmax(220px, 1fr));
  }
}

@media (max-width: 768px) {
  .filters-row {
    grid-template-columns: 1fr;
  }

  .filter select[multiple] {
    min-height: 120px;
  }

  .filters-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
}
</style>
