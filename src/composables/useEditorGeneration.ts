import { useTripStore } from '../stores/trip.store'
import { useEditorStore } from '../stores/editor.store'
import { artifactGenerator, type GenerateOptions, type GeneratedArtifacts } from '../services/generate.service'
import { viewerController } from '../controllers/ViewerController'

/**
 * Gestion centralisée de la génération depuis l'éditeur.
 * Facilite la prévisualisation et l'export tout en synchronisant les états UI.
 */
export function useEditorGeneration() {
  const tripStore = useTripStore()
  const editorStore = useEditorStore()

  const buildOptions = (): GenerateOptions | undefined => {
    const planText = tripStore.photosPlanText?.trim()
    return planText ? { photosPlan: planText } : undefined
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
    if (editorStore.isPreviewLoading || editorStore.isExporting) {
      return null
    }

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
    }
  }

  const openPreviewInViewer = async (): Promise<void> => {
    const artifacts = await previewTravelBook()
    if (!artifacts) return
    await viewerController.openInNewTab(artifacts)
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

      await viewerController.download(artifacts, `${normalizedName || 'travel_book'}.html`)
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
