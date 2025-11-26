import { ref } from 'vue'
import { useTripStore } from '../stores/trip.store'
import { analyticsService, AnalyticsEvent } from '../services/analytics.service'

/**
 * Composable pour gérer le processus de génération du travel book
 * Encapsule la logique d'orchestration, gestion des étapes et états d'erreur
 */
export function useGeneration() {
  const store = useTripStore()
  const stepIndex = ref(0)
  const error = ref('')
  const isWorking = ref(false)

  /**
   * Initialise le processus de génération (lecture, parsing, préparation plan)
   */
  async function initialize() {
    try {
      stepIndex.value = 1
      await store.readInput()
      
      stepIndex.value = 2
      await store.parseAndMap()
      
      stepIndex.value = 3
      await store.ensureDraftPlan()
      
      return true
    } catch (e: any) {
      error.value = e?.message || String(e)
      return false
    }
  }

  /**
   * Finalise la génération et ouvre le viewer
   */
  async function generateNow() {
    try {
      isWorking.value = true
      error.value = ''
      analyticsService.trackEvent(AnalyticsEvent.GENERATE_START)
      
      stepIndex.value = 4
      await store.finalizeWithPlanAndOpenViewer()
      
      stepIndex.value = 5
      analyticsService.trackEvent(AnalyticsEvent.GENERATE_SUCCESS)
      analyticsService.trackEvent(AnalyticsEvent.VIEWER_OPEN)
      return true
    } catch (e: any) {
      error.value = e?.message || String(e)
      analyticsService.trackEvent(AnalyticsEvent.GENERATE_ERROR, { error: e?.message })
      return false
    } finally {
      isWorking.value = false
    }
  }

  /**
   * Recharge le plan par défaut
   */
  async function reloadDefault() {
    try {
      isWorking.value = true
      error.value = ''
      
      store.photosPlanText = ''
      await store.ensureDraftPlan()
      
      return true
    } catch (e: any) {
      error.value = e?.message || String(e)
      return false
    } finally {
      isWorking.value = false
    }
  }

  return {
    stepIndex,
    error,
    isWorking,
    initialize,
    generateNow,
    reloadDefault
  }
}
