import type { Step } from './types'
import type { CropSettings, PhotoAdjustments, PhotoFilterPreset, PhotoOrientation } from './gallery.types'

export type PhotoRatio = 'PORTRAIT' | 'LANDSCAPE' | 'UNKNOWN'

export interface EditorStepPhoto {
  id: string
  index: number
  url: string
  ratio: PhotoRatio
  name: string
  file?: File
  width: number
  height: number
  orientation: PhotoOrientation
  fileSize: number
  filterPreset: PhotoFilterPreset
  adjustments: PhotoAdjustments
  rotation: number
  crop: CropSettings
}

export interface StepProposalPhoto {
  id: string
  index: number
  url: string
  ratio: PhotoRatio
  isCover: boolean
  label: string
}

export interface StepProposalStatsEntry {
  label: string
  value: string
}

export interface StepProposal {
  stepId: number
  summary: string
  description: string
  generatedAt: number
  stats: StepProposalStatsEntry[]
  coverPhotoIndex: number | null
  photos: StepProposalPhoto[]
}

export interface StepContextSnapshot {
  step: Step
  dayNumber: number
  totalDays: number
}

export type StepPageLayout = 'grid-2x2' | 'hero-plus-2' | 'three-columns' | 'full-page'

export interface EditorStepPage {
  id: string
  layout: StepPageLayout
  photoIndices: number[]
}

export interface StepPageState {
  pages: EditorStepPage[]
  activePageId: string | null
  coverPhotoIndex: number | null
  /**
   * Format de la page de couverture: 'text-image' = texte + image (image modifiable),
   * 'text-only' = texte en pleine page (pas d'image)
   */
  coverFormat?: 'text-image' | 'text-only'
}

export interface StepPagePlanItem {
  layout: StepPageLayout
  photoIndices: number[]
}

export type StepPlanPage = StepPagePlanItem | number[]

export interface StepGenerationPlan {
  cover?: number
  pages: StepPlanPage[]
}
