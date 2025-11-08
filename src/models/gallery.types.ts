import type { Trip } from './types'

export type PhotoFilterPreset = 'original' | 'vivid' | 'nature' | 'urban' | 'vintage' | 'bw'

export type CropRatio = 'original' | '16:9' | '4:3' | '1:1' | '9:16' | 'free'

export interface PhotoAdjustments {
  brightness: number
  contrast: number
  saturation: number
  warmth: number
}

export interface CropSettings {
  ratio: CropRatio
  zoom: number
  offsetX: number
  offsetY: number
}

export interface PhotoQualityInsight {
  type: 'low-resolution' | 'potential-blur' | 'under-exposed' | 'over-exposed'
  message: string
}

export type PhotoOrientation = 'landscape' | 'portrait' | 'square'

export interface GalleryPhoto {
  id: string
  stepId: number
  stepName: string
  stepDate: number
  location: string
  countryCode: string
  tags: string[]
  file: File
  objectUrl: string
  width: number
  height: number
  orientation: PhotoOrientation
  fileSize: number
  filterPreset: PhotoFilterPreset
  adjustments: PhotoAdjustments
  crop: CropSettings
  rotation: number
  aiFavoriteScore: number
  aiFavorite: boolean
  customFavorite: boolean
  hidden: boolean
  qualityInsights: PhotoQualityInsight[]
  palette: string[]
}

export type LayoutType = 'grid-2x2' | 'hero-plus-2' | 'three-columns' | 'full-page'

export interface LayoutSuggestion {
  id: string
  type: LayoutType
  title: string
  description: string
  photoIds: string[]
  rationale: string
}

export interface GalleryFilters {
  search: string
  locations: string[]
  tags: string[]
  startDate: string | null
  endDate: string | null
  sortBy: 'date' | 'name' | 'size' | 'score'
  sortDirection: 'asc' | 'desc'
}

export interface GalleryInitializationPayload {
  trip: Trip
  stepPhotos: Record<number, File[]>
}
