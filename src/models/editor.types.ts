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

/**
 * Format de la page de couverture d'une étape :
 * - 'text-image'  : texte à gauche, 1 image à droite
 * - 'text-only'   : texte occupant toute la largeur (pas d'image)
 * - 'image-full'  : 1 image pleine page (sans texte de description, infos étape conservées)
 * - 'image-two'   : 2 images côte à côte (sans texte de description, infos étape conservées)
 */
export type CoverFormat = 'text-image' | 'text-only' | 'image-full' | 'image-two'

export interface EditorStepPage {
  id: string
  layout: StepPageLayout
  photoIndices: number[]
}

export interface StepPageState {
  pages: EditorStepPage[]
  activePageId: string | null
  coverPhotoIndex: number | null
  /** Index de la 2e photo pour le format 'image-two' */
  cover2PhotoIndex?: number | null
  /** Format de la page de couverture (voir CoverFormat) */
  coverFormat?: CoverFormat
}

export interface StepPagePlanItem {
  layout: StepPageLayout
  photoIndices: number[]
}

export type StepPlanPage = StepPagePlanItem | number[]

export interface StepGenerationPlan {
  /** Index de la photo de couverture principale */
  cover?: number
  /** Index de la 2e photo de couverture (format image-two) */
  cover2?: number
  /** Format de la page de couverture */
  coverFormat?: CoverFormat
  pages: StepPlanPage[]
}
