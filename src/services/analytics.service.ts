/**
 * Service de tracking analytics avec Microsoft Clarity
 * Pattern Singleton pour centraliser tous les appels analytics
 */

/**
 * Types d'événements trackés dans l'application
 */
export enum AnalyticsEvent {
  // Landing page
  LANDING_VIEW = 'landing_view',
  
  // Upload & Création
  UPLOAD_START = 'upload_start',
  UPLOAD_SUCCESS = 'upload_success',
  UPLOAD_ERROR = 'upload_error',
  ALBUM_CREATE_START = 'album_create_start',
  
  // Editor
  EDITOR_VIEW = 'editor_view',
  EDITOR_STEP_EDIT = 'editor_step_edit',
  EDITOR_PHOTO_ADD = 'editor_photo_add',
  EDITOR_PHOTO_REMOVE = 'editor_photo_remove',
  EDITOR_METADATA_EDIT = 'editor_metadata_edit',
  
  // Generation & Viewer
  GENERATE_START = 'generate_start',
  GENERATE_SUCCESS = 'generate_success',
  GENERATE_ERROR = 'generate_error',
  VIEWER_OPEN = 'viewer_open',
  
  // Export
  EXPORT_PDF_START = 'export_pdf_start',
  EXPORT_PDF_SUCCESS = 'export_pdf_success',
  EXPORT_PDF_ERROR = 'export_pdf_error'
}

/**
 * Interface pour les métadonnées d'événements
 */
export interface AnalyticsMetadata {
  [key: string]: string | number | boolean | undefined
}

/**
 * Service de tracking analytics utilisant Microsoft Clarity
 * Singleton qui encapsule tous les appels analytics
 */
export class AnalyticsService {
  private static instance: AnalyticsService | null = null
  private clarityInitialized = false
  private readonly clarityProjectId: string

  /**
   * Constructeur privé pour forcer l'utilisation du pattern Singleton
   */
  private constructor() {
    // ID du projet Clarity (à configurer via variable d'environnement ou constante)
    this.clarityProjectId = import.meta.env.VITE_CLARITY_PROJECT_ID || ''
  }

  /**
   * Obtient l'instance unique du AnalyticsService
   * @returns L'instance singleton de AnalyticsService
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  /**
   * Initialise Microsoft Clarity
   * À appeler au démarrage de l'application
   */
  public initialize(): void {
    if (this.clarityInitialized) {
      return
    }

    // Ne pas initialiser si pas de project ID configuré
    if (!this.clarityProjectId) {
      console.warn('[Analytics] Clarity project ID not configured')
      return
    }

    try {
      // Injection du script Clarity
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(function (c: any, l: any, a: string, r: string, i: string, t?: any, y?: any) {
        c[a] =
          c[a] ||
          function () {
            // eslint-disable-next-line prefer-rest-params
            ;(c[a].q = c[a].q || []).push(arguments)
          }
        t = l.createElement(r)
        t.async = 1
        t.src = 'https://www.clarity.ms/tag/' + i
        y = l.getElementsByTagName(r)[0]
        y.parentNode.insertBefore(t, y)
      })(window, document, 'clarity', 'script', this.clarityProjectId)

      this.clarityInitialized = true
      console.log('[Analytics] Microsoft Clarity initialized')
    } catch (error) {
      console.error('[Analytics] Failed to initialize Clarity:', error)
    }
  }

  /**
   * Vérifie si Clarity est disponible
   * @returns true si Clarity est chargé et prêt
   */
  private isClarityAvailable(): boolean {
    return this.clarityInitialized && typeof window !== 'undefined' && 'clarity' in window
  }

  /**
   * Track un événement personnalisé
   * @param event - Type d'événement à tracker
   * @param metadata - Métadonnées optionnelles associées à l'événement
   */
  public trackEvent(event: AnalyticsEvent, metadata?: AnalyticsMetadata): void {
    if (!this.isClarityAvailable()) {
      return
    }

    try {
      // Clarity utilise clarity("event", eventName)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).clarity('event', event)

      // Log les métadonnées si présentes (pour debug)
      if (metadata && Object.keys(metadata).length > 0) {
        console.debug(`[Analytics] Event: ${event}`, metadata)
      }
    } catch (error) {
      console.error('[Analytics] Failed to track event:', event, error)
    }
  }

  /**
   * Track une page vue
   * @param pageName - Nom de la page
   * @param metadata - Métadonnées optionnelles (referrer, etc.)
   */
  public trackPageView(pageName: string, metadata?: AnalyticsMetadata): void {
    if (!this.isClarityAvailable()) {
      return
    }

    try {
      // Clarity track automatiquement les pages, mais on peut ajouter un événement custom
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).clarity('set', 'page', pageName)

      if (metadata) {
        console.debug(`[Analytics] Page view: ${pageName}`, metadata)
      }
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', pageName, error)
    }
  }

  /**
   * Identifie un utilisateur (optionnel, pour sessions multi-visites)
   * @param userId - Identifiant utilisateur anonyme
   */
  public identifyUser(userId: string): void {
    if (!this.isClarityAvailable()) {
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).clarity('identify', userId)
    } catch (error) {
      console.error('[Analytics] Failed to identify user:', error)
    }
  }

  /**
   * Définit une propriété personnalisée pour la session
   * @param key - Clé de la propriété
   * @param value - Valeur de la propriété
   */
  public setCustomProperty(key: string, value: string | number | boolean): void {
    if (!this.isClarityAvailable()) {
      return
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(window as any).clarity('set', key, value)
    } catch (error) {
      console.error('[Analytics] Failed to set custom property:', key, error)
    }
  }

  /**
   * Obtient la source de trafic (referrer)
   * @returns URL du referrer ou 'direct' si aucun
   */
  public getTrafficSource(): string {
    if (typeof document === 'undefined') {
      return 'unknown'
    }

    const referrer = document.referrer
    if (!referrer) {
      return 'direct'
    }

    try {
      const referrerUrl = new URL(referrer)
      return referrerUrl.hostname
    } catch {
      return 'unknown'
    }
  }
}

// Export de l'instance singleton
export const analyticsService = AnalyticsService.getInstance()
