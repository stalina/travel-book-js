/**
 * AnalyticsService - Service singleton pour Google Analytics 4 via Google Tag Manager
 * 
 * Ce service encapsule la logique d'envoi d'événements à GA4 via le dataLayer de GTM.
 * Il gère le consentement utilisateur et ne pousse des événements que si le consentement est accordé.
 * 
 * Pattern: Singleton (service core stateless)
 * Architecture: ES2015 Class with explicit visibility
 */

/**
 * Structure d'un événement GA4 dans le dataLayer
 */
interface AnalyticsEvent {
  event: string
  [key: string]: string | number | boolean | undefined
}

/**
 * Service de gestion des événements Google Analytics 4
 */
export class AnalyticsService {
  private static instance: AnalyticsService | null = null

  /**
   * Constructeur privé pour implémenter le pattern Singleton
   */
  private constructor() {
    this.initDataLayer()
  }

  /**
   * Obtenir l'instance unique du service
   * @returns L'instance singleton d'AnalyticsService
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  /**
   * Initialise le dataLayer de GTM s'il n'existe pas
   */
  private initDataLayer(): void {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
    }
  }

  /**
   * Vérifie si le consentement pour les analytics a été donné
   * @returns true si le consentement est accordé, false sinon
   */
  private hasConsent(): boolean {
    if (typeof localStorage === 'undefined') return false
    const consent = localStorage.getItem('analytics_consent')
    return consent === 'granted'
  }

  /**
   * Pousse un événement dans le dataLayer de GTM
   * @param event - L'événement à envoyer
   */
  private pushToDataLayer(event: AnalyticsEvent): void {
    if (!this.hasConsent()) {
      console.debug('[Analytics] Event not sent - no consent:', event.event)
      return
    }

    if (typeof window === 'undefined' || !window.dataLayer) {
      console.warn('[Analytics] dataLayer not available')
      return
    }

    window.dataLayer.push(event)
    console.debug('[Analytics] Event sent:', event)
  }

  /**
   * Envoie un événement de vue de page
   * @param pageName - Le nom de la page visitée
   * @param pageTitle - Le titre de la page (optionnel)
   */
  public trackPageView(pageName: string, pageTitle?: string): void {
    this.pushToDataLayer({
      event: 'page_view',
      page_name: pageName,
      page_title: pageTitle || pageName
    })
  }

  /**
   * Envoie un événement de début de création d'album
   */
  public trackAlbumCreationStart(): void {
    this.pushToDataLayer({
      event: 'album_creation_start'
    })
  }

  /**
   * Envoie un événement d'ouverture de l'éditeur
   * @param stepCount - Le nombre d'étapes dans le voyage (optionnel)
   */
  public trackEditorOpened(stepCount?: number): void {
    this.pushToDataLayer({
      event: 'editor_opened',
      step_count: stepCount
    })
  }

  /**
   * Envoie un événement d'ouverture de la prévisualisation
   */
  public trackPreviewOpened(): void {
    this.pushToDataLayer({
      event: 'preview_opened'
    })
  }

  /**
   * Envoie un événement d'export PDF
   */
  public trackPdfExported(): void {
    this.pushToDataLayer({
      event: 'pdf_exported'
    })
  }

  /**
   * Met à jour le consentement utilisateur pour les analytics
   * @param granted - true si le consentement est accordé, false sinon
   */
  public updateConsent(granted: boolean): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('analytics_consent', granted ? 'granted' : 'denied')
    }

    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'consent_update',
        analytics_consent: granted ? 'granted' : 'denied'
      })
    }
  }
}

/**
 * Instance exportée du service Analytics
 */
export const analyticsService = AnalyticsService.getInstance()

/**
 * Extension de l'interface Window pour inclure dataLayer
 */
declare global {
  interface Window {
    dataLayer: AnalyticsEvent[]
  }
}
