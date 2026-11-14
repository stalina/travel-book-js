import { useTripStore } from '../stores/trip.store'
import { useEditorStore } from '../stores/editor.store'
import { artifactGenerator, type GenerateOptions, type GeneratedArtifacts } from '../services/generate.service'
import type { StepGenerationPlan } from '../models/editor.types'
import type { Trip } from '../models/types'
import { toRaw } from 'vue'

// Module-level lock to prevent concurrent preview generations
let previewLock = false

/**
 * Gestion centralisée de la génération depuis l'éditeur.
 * Facilite la prévisualisation et l'export tout en synchronisant les états UI.
 */
export function useEditorGeneration() {
  const tripStore = useTripStore()
  const editorStore = useEditorStore()

  /**
   * Photos de l'éditeur par étape, positionnées selon leur index (index 1 → position 0)
   * pour rester alignées avec les index utilisés dans les plans de pages.
   */
  const buildEditorStepPhotos = (): Record<number, Array<File | undefined>> => {
    const result: Record<number, Array<File | undefined>> = {}
    for (const [stepId, photos] of Object.entries(editorStore.stepPhotosByStep)) {
      const files: Array<File | undefined> = []
      for (const photo of photos ?? []) {
        if (photo.file && Number.isInteger(photo.index) && photo.index >= 1) {
          files[photo.index - 1] = toRaw(photo.file)
        }
      }
      result[Number(stepId)] = files
    }
    return result
  }

  const buildOptions = (): GenerateOptions => {
    const planText = tripStore.photosPlanText?.trim()
    const trip = editorStore.currentTrip

    // Le voyage et les photos de l'éditeur font foi : ils intègrent les modifications de
    // l'utilisateur et sont disponibles même après la reprise d'un brouillon (sans dossier source).
    const editorData: Pick<GenerateOptions, 'trip' | 'stepPhotos'> = trip
      ? {
          // Copie simple : la génération annote les étapes (altitude) et ne doit pas toucher à l'état réactif
          trip: JSON.parse(JSON.stringify(toRaw(trip))) as Trip,
          stepPhotos: buildEditorStepPhotos()
        }
      : {}

    // Construire les plans d'étapes depuis l'éditeur
    const stepPlans: Record<number, StepGenerationPlan> = {}
    if (trip?.steps) {
      for (const step of trip.steps) {
        const plan = editorStore.buildStepPlan(step.id)
        if (plan) {
          stepPlans[step.id] = plan
        }
      }
    }

    // Si on a des plans d'étapes de l'éditeur, on les utilise
    if (Object.keys(stepPlans).length > 0) {
      return { ...editorData, stepPlans, hiddenStepIds: editorStore.hiddenStepIds }
    }

    // Sinon, fallback sur le planText
    return planText
      ? { ...editorData, photosPlan: planText, hiddenStepIds: editorStore.hiddenStepIds }
      : { ...editorData, hiddenStepIds: editorStore.hiddenStepIds }
  }

  const ensureArtifacts = async (): Promise<GeneratedArtifacts> => {
    await tripStore.generateArtifacts(buildOptions())
    if (!tripStore.artifacts) {
      throw new Error('La génération n\'a produit aucun artefact.')
    }
    return tripStore.artifacts
  }

  const setError = (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error)
    editorStore.setPreviewError(message)
  }

  const previewTravelBook = async (): Promise<GeneratedArtifacts | null> => {
    // Prevent concurrent preview generations using a module-level lock.
    // This avoids race conditions when multiple components trigger preview at the same time.
    if (previewLock || editorStore.isPreviewLoading || editorStore.isExporting) {
      return null
    }
    // If the preview is not stale and we already have artifacts and a valid preview HTML,
    // avoid re-generating. This prevents unnecessary work when the content hasn't changed.
    if (!editorStore.isPreviewStale && tripStore.artifacts && editorStore.previewHtml) {
      return tripStore.artifacts
    }

    previewLock = true
    editorStore.setPreviewError(null)
    editorStore.setPreviewLoading(true)

    try {
      const artifacts = await ensureArtifacts()
      const html = await artifactGenerator.buildSingleFileHtmlString(artifacts)
      editorStore.setPreviewHtml(html)
      return artifacts
    } catch (error) {
      editorStore.setPreviewHtml(null)
      setError(error)
      return null
    } finally {
      editorStore.setPreviewLoading(false)
      previewLock = false
    }
  }

  const openPreviewInViewer = async (): Promise<void> => {
    const artifacts = await previewTravelBook()
    if (!artifacts) return
    // Build a single-file HTML blob and open in new tab
    const blob = await artifactGenerator.buildSingleFileHtml(artifacts)
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    // Note: we intentionally do not revoke immediately to avoid invalidating the opened tab
  }

  const exportTravelBook = async (): Promise<void> => {
    if (editorStore.isExporting || editorStore.isPreviewLoading) {
      return
    }

    editorStore.setPreviewError(null)
    editorStore.setExporting(true)

    try {
      const artifacts = await ensureArtifacts()

      if (!editorStore.previewHtml) {
        const html = await artifactGenerator.buildSingleFileHtmlString(artifacts)
        editorStore.setPreviewHtml(html)
      }

      const tripName = editorStore.currentTrip?.name?.trim() || 'travel_book'
      const normalizedName = tripName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9-_ ]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase()

  // Build blob and trigger download
  const blob = await artifactGenerator.buildSingleFileHtml(artifacts)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${normalizedName || 'travel_book'}.html`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
    } catch (error) {
      setError(error)
    } finally {
      editorStore.setExporting(false)
    }
  }

  return {
    previewTravelBook,
    openPreviewInViewer,
    exportTravelBook
  }
}
