import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoggerService, loggerService } from '../src/services/logger.service';

// Déclarer le type pour window.TravelBook
declare global {
  interface Window {
    TravelBook: {
      enableDebug: (enabled: boolean) => void;
      isDebugEnabled: () => boolean;
    };
  }
}

describe('logger.service', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Espionner les méthodes console
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Réinitialiser le mode debug
    loggerService.setDebugEnabled(false);
  });

  afterEach(() => {
    // Restaurer les mocks
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('Singleton Pattern', () => {
    it('devrait retourner toujours la même instance', () => {
      const instance1 = LoggerService.getInstance();
      const instance2 = LoggerService.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('devrait avoir la même instance que loggerService exporté', () => {
      const instance = LoggerService.getInstance();
      expect(instance).toBe(loggerService);
    });
  });

  describe('setDebugEnabled', () => {
    it('devrait activer le mode debug', () => {
      loggerService.setDebugEnabled(true);
      loggerService.debug('test', 'message debug');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][DEBUG][test]'),
        expect.stringContaining('message debug')
      );
    });

    it('devrait désactiver le mode debug', () => {
      loggerService.setDebugEnabled(true);
      consoleLogSpy.mockClear(); // Nettoyer le message de confirmation
      loggerService.setDebugEnabled(false);
      loggerService.debug('test', 'message debug');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('ne devrait rien afficher en mode normal', () => {
      loggerService.debug('test', 'message debug');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('devrait afficher les logs debug quand le mode est activé', () => {
      loggerService.setDebugEnabled(true);
      loggerService.debug('test', 'message debug');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][DEBUG][test]'),
        expect.stringContaining('message debug')
      );
    });

    it('devrait supporter les objets dans les logs debug', () => {
      loggerService.setDebugEnabled(true);
      const data = { count: 5, items: ['a', 'b'] };
      loggerService.debug('test', 'message', data);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][DEBUG][test]'),
        expect.stringContaining('message'),
        data
      );
    });
  });

  describe('info', () => {
    it('devrait toujours afficher les logs info', () => {
      loggerService.info('test', 'message info');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        expect.stringContaining('message info')
      );
    });

    it('devrait supporter les objets dans les logs info', () => {
      const data = { status: 'ok' };
      loggerService.info('test', 'message', data);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        expect.stringContaining('message'),
        data
      );
    });

    it('devrait afficher les logs info même en mode debug', () => {
      loggerService.setDebugEnabled(true);
      loggerService.info('test', 'message info');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        expect.stringContaining('message info')
      );
    });
  });

  describe('warn', () => {
    it('devrait toujours afficher les warnings', () => {
      loggerService.warn('test', 'message warning');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][WARN][test]'),
        expect.stringContaining('message warning')
      );
    });

    it('devrait supporter les objets dans les warnings', () => {
      const error = { code: 404 };
      loggerService.warn('test', 'erreur', error);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][WARN][test]'),
        expect.stringContaining('erreur'),
        error
      );
    });
  });

  describe('error', () => {
    it('devrait toujours afficher les erreurs', () => {
      loggerService.error('test', 'message erreur');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][ERROR][test]'),
        expect.stringContaining('message erreur')
      );
    });

    it('devrait supporter les objets Error', () => {
      const err = new Error('test error');
      loggerService.error('test', 'erreur critique', err);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][ERROR][test]'),
        expect.stringContaining('erreur critique'),
        err
      );
    });

    it('devrait supporter les objets dans les erreurs', () => {
      const context = { file: 'test.ts', line: 42 };
      loggerService.error('test', 'erreur', context);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][ERROR][test]'),
        expect.stringContaining('erreur'),
        context
      );
    });
  });

  describe('time et timeEnd', () => {
    it('devrait mesurer et afficher le temps écoulé', () => {
      loggerService.time('operation-test');
      // Simuler un délai
      loggerService.timeEnd('operation-test', true);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][TIMING]'),
        expect.stringContaining('operation-test'),
        expect.stringMatching(/\d+ms/)
      );
    });

    it('devrait gérer plusieurs timers simultanés', () => {
      loggerService.time('op1');
      loggerService.time('op2');
      loggerService.timeEnd('op1', true);
      loggerService.timeEnd('op2', true);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][TIMING]'),
        expect.stringContaining('op1'),
        expect.stringMatching(/\d+ms/)
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][TIMING]'),
        expect.stringContaining('op2'),
        expect.stringMatching(/\d+ms/)
      );
    });

    it('ne devrait pas afficher le timing sans showInProduction ni debug', () => {
      loggerService.time('hidden-op');
      loggerService.timeEnd('hidden-op', false);
      
      // Le log de timing ne devrait pas être appelé
      const timingCalls = consoleLogSpy.mock.calls.filter(
        call => typeof call[0] === 'string' && call[0].includes('[TIMING]')
      );
      expect(timingCalls).toHaveLength(0);
    });

    it('devrait afficher le timing en mode debug même sans showInProduction', () => {
      loggerService.setDebugEnabled(true);
      loggerService.time('debug-op');
      loggerService.timeEnd('debug-op', false);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][TIMING]'),
        expect.stringContaining('debug-op'),
        expect.stringMatching(/\d+ms/)
      );
    });
  });

  describe('API globale window.TravelBook', () => {
    it('devrait exposer enableDebug', () => {
      expect(window.TravelBook).toBeDefined();
      expect(typeof window.TravelBook.enableDebug).toBe('function');
    });

    it('devrait permettre d\'activer le debug via window.TravelBook', () => {
      window.TravelBook.enableDebug(true);
      loggerService.debug('test', 'debug via API globale');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][DEBUG][test]'),
        expect.stringContaining('debug via API globale')
      );
    });

    it('devrait permettre de désactiver le debug via window.TravelBook', () => {
      window.TravelBook.enableDebug(true);
      consoleLogSpy.mockClear(); // Nettoyer le message de confirmation
      window.TravelBook.enableDebug(false);
      loggerService.debug('test', 'ne devrait pas apparaître');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('formatage des messages', () => {
    it('devrait formater correctement avec un seul argument', () => {
      loggerService.info('test', 'message simple');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        expect.stringContaining('message simple')
      );
    });

    it('devrait formater correctement avec un objet de données', () => {
      const obj = { a: 1, b: 2 };
      loggerService.info('test', 'message', obj);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        expect.stringContaining('message'),
        obj
      );
    });

    it('devrait gérer les messages vides', () => {
      loggerService.info('test', '');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        ''
      );
    });

    it('devrait gérer les contextes vides', () => {
      loggerService.info('', 'message sans contexte');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][]'),
        expect.stringContaining('message sans contexte')
      );
    });
  });
});
