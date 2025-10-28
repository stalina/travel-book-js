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

class Logger {
  private debugEnabled = false
  private readonly prefix = '[TravelBook]'

  /**
   * Active ou désactive le mode debug
   * Peut être appelé depuis la console: window.TravelBook.enableDebug(true)
   */
  setDebugEnabled(enabled: boolean): void {
    this.debugEnabled = enabled
    if (enabled) {
      // eslint-disable-next-line no-console
      console.log(`${this.prefix} Mode debug activé`)
    }
  }

  /**
   * Vérifie si le mode debug est activé
   */
  isDebugEnabled(): boolean {
    return this.debugEnabled
  }

  /**
   * Log de niveau DEBUG - affiché uniquement si le mode debug est activé
   */
  debug(module: string, message: string, data?: any): void {
    if (!this.debugEnabled) return
    
    const args = data !== undefined 
      ? [`${this.prefix}[DEBUG][${module}]`, message, data]
      : [`${this.prefix}[DEBUG][${module}]`, message]
    
    // eslint-disable-next-line no-console
    console.log(...args)
  }

  /**
   * Log de niveau INFO - toujours affiché (étapes importantes)
   */
  info(module: string, message: string, data?: any): void {
    const args = data !== undefined
      ? [`${this.prefix}[${module}]`, message, data]
      : [`${this.prefix}[${module}]`, message]
    
    // eslint-disable-next-line no-console
    console.log(...args)
  }

  /**
   * Log de niveau WARN - toujours affiché
   */
  warn(module: string, message: string, data?: any): void {
    const args = data !== undefined
      ? [`${this.prefix}[WARN][${module}]`, message, data]
      : [`${this.prefix}[WARN][${module}]`, message]
    
    // eslint-disable-next-line no-console
    console.warn(...args)
  }

  /**
   * Log de niveau ERROR - toujours affiché
   */
  error(module: string, message: string, error?: any): void {
    const args = error !== undefined
      ? [`${this.prefix}[ERROR][${module}]`, message, error]
      : [`${this.prefix}[ERROR][${module}]`, message]
    
    // eslint-disable-next-line no-console
    console.error(...args)
  }

  /**
   * Mesure le temps d'exécution d'une opération
   */
  time(label: string): void {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${label}:start`)
    }
  }

  /**
   * Termine la mesure de temps et affiche le résultat
   */
  timeEnd(label: string, showInProduction = false): void {
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
      } catch {}
    }
  }
}

// Instance singleton
export const logger = new Logger()

// Exposer le logger globalement pour permettre l'activation du debug depuis la console
if (typeof window !== 'undefined') {
  (window as any).TravelBook = {
    enableDebug: (enabled: boolean) => logger.setDebugEnabled(enabled),
    isDebugEnabled: () => logger.isDebugEnabled()
  }
}
