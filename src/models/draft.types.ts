import type { Trip } from './types'
import type { PhotoRatio, StepPageState } from './editor.types'
import type { PhotoAdjustments, CropSettings, PhotoFilterPreset, PhotoOrientation } from './gallery.types'

/**
 * Snapshot sérialisable d'une photo de l'éditeur.
 * Le champ `file` (non sérialisable) est remplacé par un blob stocké séparément dans IndexedDB.
 */
export interface DraftPhotoEntry {
  id: string
  index: number
  name: string
  ratio: PhotoRatio
  width: number
  height: number
  orientation: PhotoOrientation
  fileSize: number
  filterPreset: PhotoFilterPreset
  adjustments: PhotoAdjustments
  rotation: number
  crop: CropSettings
}

/**
 * Métadonnées résumées du brouillon (pour l'affichage dans la carte de reprise).
 */
export interface DraftInfo {
  tripName: string
  savedAt: number
  totalSteps: number
  totalPhotos: number
}

/**
 * Snapshot complet de l'état éditeur, sérialisable en JSON.
 * Les blobs des photos sont stockés séparément dans un object store IndexedDB dédié.
 */
export interface DraftSnapshot {
  /** Version du schéma pour les migrations futures */
  version: 1
  /** Timestamp de sauvegarde (ms) */
  savedAt: number
  /** Trip éditable (clone profond) */
  trip: Trip
  /** Index de l'étape courante */
  currentStepIndex: number
  /** Photos par step id (métadonnées seulement, pas les blobs) */
  stepPhotosByStep: Record<number, DraftPhotoEntry[]>
  /** Layout de pages par step id */
  stepPageStates: Record<number, StepPageState>
}
