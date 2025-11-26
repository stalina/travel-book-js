import Clarity from '@microsoft/clarity'

/**
 * Service de tracking analytics avec Microsoft Clarity
 * Pattern Singleton pour centraliser tous les appels analytics
 * Utilise le package officiel @microsoft/clarity
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
   * Initialise Microsoft Clarity avec le package officiel
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
      // Initialisation via le package officiel @microsoft/clarity
      Clarity.init(this.clarityProjectId)
      this.clarityInitialized = true
      console.log('[Analytics] Microsoft Clarity initialized with project ID:', this.clarityProjectId)
    } catch (error) {
      console.error('[Analytics] Failed to initialize Clarity:', error)
    }
  }

  /**
   * Track un événement personnalisé
   * @param event - Type d'événement à tracker
   * @param metadata - Métadonnées optionnelles associées à l'événement
   */
  public trackEvent(event: AnalyticsEvent, metadata?: AnalyticsMetadata): void {
    if (!this.clarityInitialized) {
      return
    }

    try {
      // Utilisation de l'API officielle Clarity.event()
      Clarity.event(event)

      // Log les métadonnées si présentes (pour debug)
      if (metadata && Object.keys(metadata).length > 0) {
        console.debug(`[Analytics] Event: ${event}`, metadata)
        
        // Ajouter les métadonnées comme tags personnalisés
        Object.entries(metadata).forEach(([key, value]) => {
          if (value !== undefined) {
            Clarity.setTag(`${event}_${key}`, String(value))
          }
        })
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
    if (!this.clarityInitialized) {
      return
    }

    try {
      // Clarity track automatiquement les pages, on peut juste logger
      if (metadata) {
        console.debug(`[Analytics] Page view: ${pageName}`, metadata)
        
        // Ajouter la source de trafic comme tag
        if (metadata.source) {
          Clarity.setTag('traffic_source', String(metadata.source))
        }
      }
    } catch (error) {
      console.error('[Analytics] Failed to track page view:', pageName, error)
    }
  }

  /**
   * Identifie un utilisateur (optionnel, pour sessions multi-visites)
   * @param userId - Identifiant utilisateur anonyme
   * @param friendlyName - Nom convivial (optionnel)
   */
  public identifyUser(userId: string, friendlyName?: string): void {
    if (!this.clarityInitialized) {
      return
    }

    try {
      Clarity.identify(userId, undefined, undefined, friendlyName)
    } catch (error) {
      console.error('[Analytics] Failed to identify user:', error)
    }
  }

  /**
   * Définit un tag personnalisé pour la session
   * @param key - Clé du tag
   * @param value - Valeur du tag
   */
  public setCustomTag(key: string, value: string | string[]): void {
    if (!this.clarityInitialized) {
      return
    }

    try {
      Clarity.setTag(key, value)
    } catch (error) {
      console.error('[Analytics] Failed to set custom tag:', key, error)
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
