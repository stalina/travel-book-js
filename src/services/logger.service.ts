/**
 * Service de logging centralisé pour le travel book
 * Permet de gérer différents niveaux de log et d'activer/désactiver le mode debug
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

/**
 * Service de logging centralisé avec pattern Singleton
 * Gère les logs de différents niveaux (DEBUG, INFO, WARN, ERROR) et le timing des opérations
 */
export class LoggerService {
  private static instance: LoggerService
  private debugEnabled = false
  private readonly prefix = '[TravelBook]'

  /**
   * Constructeur privé pour forcer l'utilisation du pattern Singleton
   */
  private constructor() {}

  /**
   * Obtient l'instance unique du LoggerService
   * @returns L'instance singleton de LoggerService
   */
  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }

  /**
   * Active ou désactive le mode debug
   * Peut être appelé depuis la console: window.TravelBook.enableDebug(true)
   * @param enabled - true pour activer, false pour désactiver
   */
  public setDebugEnabled(enabled: boolean): void {
    this.debugEnabled = enabled
    if (enabled) {
      // eslint-disable-next-line no-console
      console.log(`${this.prefix} Mode debug activé`)
    }
  }

  /**
   * Vérifie si le mode debug est activé
   * @returns true si le mode debug est actif
   */
  public isDebugEnabled(): boolean {
    return this.debugEnabled
  }

  /**
   * Log de niveau DEBUG - affiché uniquement si le mode debug est activé
   * @param module - Nom du module émettant le log
   * @param message - Message à logger
   * @param data - Données optionnelles à afficher
   */
  public debug(module: string, message: string, data?: any): void {
    if (!this.debugEnabled) return
    
    const args = data !== undefined 
      ? [`${this.prefix}[DEBUG][${module}]`, message, data]
      : [`${this.prefix}[DEBUG][${module}]`, message]
    
    // eslint-disable-next-line no-console
    console.log(...args)
  }

  /**
   * Log de niveau INFO - toujours affiché (étapes importantes)
   * @param module - Nom du module émettant le log
   * @param message - Message à logger
   * @param data - Données optionnelles à afficher
   */
  public info(module: string, message: string, data?: any): void {
    const args = data !== undefined
      ? [`${this.prefix}[${module}]`, message, data]
      : [`${this.prefix}[${module}]`, message]
    
    // eslint-disable-next-line no-console
    console.log(...args)
  }

  /**
   * Log de niveau WARN - toujours affiché
   * @param module - Nom du module émettant le log
   * @param message - Message à logger
   * @param data - Données optionnelles à afficher
   */
  public warn(module: string, message: string, data?: any): void {
    const args = data !== undefined
      ? [`${this.prefix}[WARN][${module}]`, message, data]
      : [`${this.prefix}[WARN][${module}]`, message]
    
    // eslint-disable-next-line no-console
    console.warn(...args)
  }

  /**
   * Log de niveau ERROR - toujours affiché
   * @param module - Nom du module émettant le log
   * @param message - Message à logger
   * @param error - Erreur optionnelle à afficher
   */
  public error(module: string, message: string, error?: any): void {
    const args = error !== undefined
      ? [`${this.prefix}[ERROR][${module}]`, message, error]
      : [`${this.prefix}[ERROR][${module}]`, message]
    
    // eslint-disable-next-line no-console
    console.error(...args)
  }

  /**
   * Mesure le temps d'exécution d'une opération (début)
   * @param label - Label unique pour identifier l'opération
   */
  public time(label: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${label}:start`)
    }
  }

  /**
   * Termine la mesure de temps et affiche le résultat
   * @param label - Label de l'opération à mesurer
   * @param showInProduction - Si true, affiche même en production
   */
  public timeEnd(label: string, showInProduction = false): void {
    if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
      try {
        performance.mark(`${label}:end`)
        performance.measure(label, `${label}:start`, `${label}:end`)
        const entries = performance.getEntriesByName(label)
        const last = entries[entries.length - 1]
        
        if (showInProduction || this.debugEnabled) {
          // eslint-disable-next-line no-console
          console.log(`${this.prefix}[TIMING]`, label, `${Math.round(last.duration)}ms`)
        }
      } catch {
        // Ignore errors silently
      }
    }
  }
}

// Export singleton instance
export const loggerService = LoggerService.getInstance()

// Wrapper rétrocompatible (DEPRECATED - à supprimer après migration complète)
/** @deprecated Utiliser loggerService à la place */
export const logger = loggerService

// Exposer le logger globalement pour permettre l'activation du debug depuis la console
if (typeof window !== 'undefined') {
  (window as any).TravelBook = {
    enableDebug: (enabled: boolean) => loggerService.setDebugEnabled(enabled),
    isDebugEnabled: () => loggerService.isDebugEnabled()
  }
}
