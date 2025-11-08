import type { CropSettings, PhotoAdjustments, PhotoFilterPreset } from './gallery.types'

export const DEFAULT_PHOTO_FILTER: PhotoFilterPreset = 'original'

export const DEFAULT_PHOTO_ADJUSTMENTS: PhotoAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0
}

export const DEFAULT_PHOTO_CROP: CropSettings = {
  ratio: 'original',
  zoom: 1,
  offsetX: 0,
  offsetY: 0
}
