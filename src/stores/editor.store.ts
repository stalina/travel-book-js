import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Trip, Step } from '../models/types'
import type { SaveStatus } from '../composables/useAutoSave'

/**
 * Store de l'éditeur d'album
 * Gère l'état de l'édition: voyage actuel, étape sélectionnée, mode preview, etc.
 */
export const useEditorStore = defineStore('editor', () => {
  // State
  const currentTrip = ref<Trip | null>(null)
  const currentStepIndex = ref<number>(0)
  const autoSaveStatus = ref<SaveStatus>('idle')
  const lastSaveTime = ref<Date | null>(null)
  const previewMode = ref<'mobile' | 'desktop' | 'pdf'>('desktop')
  const activeSidebarTab = ref<'steps' | 'themes' | 'options'>('steps')
  const previewHtml = ref<string | null>(null)
  const previewError = ref<string | null>(null)
  const previewUpdatedAt = ref<Date | null>(null)
  const isPreviewLoading = ref(false)
  const isExporting = ref(false)
  const isPreviewStale = ref(true)

  // Getters
  const currentStep = computed(() => {
    if (!currentTrip.value || !currentTrip.value.steps) return null
    return currentTrip.value.steps[currentStepIndex.value] || null
  })

  const totalSteps = computed(() => currentTrip.value?.steps?.length || 0)

  const totalDays = computed(() => {
    if (!currentTrip.value?.start_date || !currentTrip.value?.end_date) return 0
    const start = new Date(currentTrip.value.start_date * 1000)
    const end = new Date(currentTrip.value.end_date * 1000)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  })

  // TODO: Ces stats seront calculées depuis le photosMapping dans une version future
  const totalPhotos = computed(() => 0)
  const estimatedPages = computed(() => {
    // Estimation: 1 page couverture + 1 page stats + 1 page carte + 2-3 pages par étape
    const coverPages = 3
    const stepPages = totalSteps.value * 2.5
    return Math.ceil(coverPages + stepPages)
  })

  // Actions
  const setPreviewLoading = (loading: boolean) => {
    isPreviewLoading.value = loading
  }

  const setExporting = (loading: boolean) => {
    isExporting.value = loading
  }

  const setPreviewHtml = (html: string | null) => {
    previewHtml.value = html
    previewUpdatedAt.value = html ? new Date() : null
    previewError.value = null
    isPreviewStale.value = !html
  }

  const setPreviewError = (message: string | null) => {
    previewError.value = message
  }

  const markPreviewStale = () => {
    if (!isPreviewStale.value) {
      isPreviewStale.value = true
    }
  }

  const invalidatePreview = () => {
    previewHtml.value = null
    previewUpdatedAt.value = null
    previewError.value = null
    isPreviewStale.value = true
  }

  const setTrip = (trip: Trip) => {
    currentTrip.value = trip
    currentStepIndex.value = 0
    invalidatePreview()
  }

  const setCurrentStep = (index: number) => {
    if (currentTrip.value?.steps && index >= 0 && index < currentTrip.value.steps.length) {
      currentStepIndex.value = index
    }
  }

  const updateStepTitle = (stepIndex: number, title: string) => {
    if (currentTrip.value?.steps && stepIndex >= 0 && stepIndex < currentTrip.value.steps.length) {
      currentTrip.value.steps[stepIndex].name = title
      triggerAutoSave()
      markPreviewStale()
    }
  }

  const updateStepDescription = (stepIndex: number, description: string) => {
    if (currentTrip.value?.steps && stepIndex >= 0 && stepIndex < currentTrip.value.steps.length) {
      currentTrip.value.steps[stepIndex].description = description
      triggerAutoSave()
      markPreviewStale()
    }
  }

  const reorderSteps = (newSteps: Step[]) => {
    if (currentTrip.value) {
      currentTrip.value.steps = newSteps
      triggerAutoSave()
      markPreviewStale()
    }
  }

  const setPreviewMode = (mode: 'mobile' | 'desktop' | 'pdf') => {
    previewMode.value = mode
  }

  const setActiveSidebarTab = (tab: 'steps' | 'themes' | 'options') => {
    activeSidebarTab.value = tab
  }

  const triggerAutoSave = () => {
    autoSaveStatus.value = 'saving'
    // Simule une sauvegarde (sera géré par useAutoSave dans EditorView)
    setTimeout(() => {
      autoSaveStatus.value = 'saved'
      lastSaveTime.value = new Date()
      
      // Retour à idle après 2 secondes
      setTimeout(() => {
        if (autoSaveStatus.value === 'saved') {
          autoSaveStatus.value = 'idle'
        }
      }, 2000)
    }, 500)
  }

  const setAutoSaveStatus = (status: SaveStatus) => {
    autoSaveStatus.value = status
  }

  return {
    // State
    currentTrip,
    currentStepIndex,
    autoSaveStatus,
    lastSaveTime,
    previewMode,
    activeSidebarTab,
    previewHtml,
    previewError,
    previewUpdatedAt,
    isPreviewLoading,
    isExporting,
    isPreviewStale,
    // Getters
    currentStep,
    totalPhotos,
    totalSteps,
    totalDays,
    estimatedPages,
    // Actions
    setTrip,
    setCurrentStep,
    updateStepTitle,
    updateStepDescription,
    reorderSteps,
    setPreviewMode,
    setActiveSidebarTab,
    triggerAutoSave,
    setAutoSaveStatus,
    setPreviewLoading,
    setExporting,
    setPreviewHtml,
    setPreviewError,
    markPreviewStale,
    invalidatePreview
  }
})
