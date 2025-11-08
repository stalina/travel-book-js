import type { PhotoAdjustments, PhotoFilterPreset } from '../models/gallery.types'

interface PhotoFilterDefinition {
  id: PhotoFilterPreset
  label: string
  description: string
  filter: string
}

export const PHOTO_FILTER_PRESETS: PhotoFilterDefinition[] = [
  {
    id: 'original',
    label: 'Original',
    description: 'Sans retouche',
    filter: 'brightness(1) contrast(1) saturate(1)'
  },
  {
    id: 'vivid',
    label: 'Vivid',
    description: 'Couleurs saturées, contraste renforcé',
    filter: 'brightness(1.02) contrast(1.1) saturate(1.3)'
  },
  {
    id: 'nature',
    label: 'Nature',
    description: 'Verts renforcés, ambiance fraîche',
    filter: 'saturate(1.15) hue-rotate(-10deg)'
  },
  {
    id: 'urban',
    label: 'Urban',
    description: 'Noirs profonds et détails accentués',
    filter: 'contrast(1.25) saturate(0.9) brightness(0.95)'
  },
  {
    id: 'vintage',
    label: 'Vintage',
    description: 'Tonalités chaudes, effet pellicule',
    filter: 'sepia(0.35) contrast(0.95) saturate(0.9) brightness(1.05)'
  },
  {
    id: 'bw',
    label: 'Noir & Blanc',
    description: 'Contraste doux monochrome',
    filter: 'grayscale(1) contrast(1.1)'
  }
]

export function buildCssFilter(
  adjustments: PhotoAdjustments,
  preset: PhotoFilterPreset
): string {
  const presetDef = PHOTO_FILTER_PRESETS.find(def => def.id === preset) ?? PHOTO_FILTER_PRESETS[0]

  const brightness = (100 + adjustments.brightness) / 100
  const contrast = (100 + adjustments.contrast) / 100
  const saturation = (100 + adjustments.saturation) / 100
  const warmth = adjustments.warmth / 2 // warmth [-100, 100] -> [-50deg, 50deg]

  const manual = [
    `brightness(${brightness.toFixed(2)})`,
    `contrast(${contrast.toFixed(2)})`,
    `saturate(${saturation.toFixed(2)})`,
    `hue-rotate(${warmth.toFixed(2)}deg)`
  ]

  return `${presetDef.filter} ${manual.join(' ')}`.trim()
}

export function clampAdjustment(value: number): number {
  return Math.max(-100, Math.min(100, value))
}
