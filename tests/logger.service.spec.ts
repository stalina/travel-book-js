import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger } from '../src/services/logger.service';

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
    logger.setDebugEnabled(false);
  });

  afterEach(() => {
    // Restaurer les mocks
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('setDebugEnabled', () => {
    it('devrait activer le mode debug', () => {
      logger.setDebugEnabled(true);
      logger.debug('test', 'message debug');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][DEBUG][test]'),
        expect.stringContaining('message debug')
      );
    });

    it('devrait désactiver le mode debug', () => {
      logger.setDebugEnabled(true);
      consoleLogSpy.mockClear(); // Nettoyer le message de confirmation
      logger.setDebugEnabled(false);
      logger.debug('test', 'message debug');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('ne devrait rien afficher en mode normal', () => {
      logger.debug('test', 'message debug');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('devrait afficher les logs debug quand le mode est activé', () => {
      logger.setDebugEnabled(true);
      logger.debug('test', 'message debug');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][DEBUG][test]'),
        expect.stringContaining('message debug')
      );
    });

    it('devrait supporter les objets dans les logs debug', () => {
      logger.setDebugEnabled(true);
      const data = { count: 5, items: ['a', 'b'] };
      logger.debug('test', 'message', data);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][DEBUG][test]'),
        expect.stringContaining('message'),
        data
      );
    });
  });

  describe('info', () => {
    it('devrait toujours afficher les logs info', () => {
      logger.info('test', 'message info');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        expect.stringContaining('message info')
      );
    });

    it('devrait supporter les objets dans les logs info', () => {
      const data = { status: 'ok' };
      logger.info('test', 'message', data);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        expect.stringContaining('message'),
        data
      );
    });

    it('devrait afficher les logs info même en mode debug', () => {
      logger.setDebugEnabled(true);
      logger.info('test', 'message info');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        expect.stringContaining('message info')
      );
    });
  });

  describe('warn', () => {
    it('devrait toujours afficher les warnings', () => {
      logger.warn('test', 'message warning');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][WARN][test]'),
        expect.stringContaining('message warning')
      );
    });

    it('devrait supporter les objets dans les warnings', () => {
      const error = { code: 404 };
      logger.warn('test', 'erreur', error);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][WARN][test]'),
        expect.stringContaining('erreur'),
        error
      );
    });
  });

  describe('error', () => {
    it('devrait toujours afficher les erreurs', () => {
      logger.error('test', 'message erreur');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][ERROR][test]'),
        expect.stringContaining('message erreur')
      );
    });

    it('devrait supporter les objets Error', () => {
      const err = new Error('test error');
      logger.error('test', 'erreur critique', err);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][ERROR][test]'),
        expect.stringContaining('erreur critique'),
        err
      );
    });

    it('devrait supporter les objets dans les erreurs', () => {
      const context = { file: 'test.ts', line: 42 };
      logger.error('test', 'erreur', context);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][ERROR][test]'),
        expect.stringContaining('erreur'),
        context
      );
    });
  });

  describe('time et timeEnd', () => {
    it('devrait mesurer et afficher le temps écoulé', () => {
      logger.time('operation-test');
      // Simuler un délai
      logger.timeEnd('operation-test', true);
      
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][TIMING]'),
        expect.stringContaining('operation-test'),
        expect.stringMatching(/\d+ms/)
      );
    });

    it('devrait gérer plusieurs timers simultanés', () => {
      logger.time('op1');
      logger.time('op2');
      logger.timeEnd('op1', true);
      logger.timeEnd('op2', true);
      
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
      logger.time('hidden-op');
      logger.timeEnd('hidden-op', false);
      
      // Le log de timing ne devrait pas être appelé
      const timingCalls = consoleLogSpy.mock.calls.filter(
        call => typeof call[0] === 'string' && call[0].includes('[TIMING]')
      );
      expect(timingCalls).toHaveLength(0);
    });

    it('devrait afficher le timing en mode debug même sans showInProduction', () => {
      logger.setDebugEnabled(true);
      logger.time('debug-op');
      logger.timeEnd('debug-op', false);
      
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
      logger.debug('test', 'debug via API globale');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][DEBUG][test]'),
        expect.stringContaining('debug via API globale')
      );
    });

    it('devrait permettre de désactiver le debug via window.TravelBook', () => {
      window.TravelBook.enableDebug(true);
      consoleLogSpy.mockClear(); // Nettoyer le message de confirmation
      window.TravelBook.enableDebug(false);
      logger.debug('test', 'ne devrait pas apparaître');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('formatage des messages', () => {
    it('devrait formater correctement avec un seul argument', () => {
      logger.info('test', 'message simple');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        expect.stringContaining('message simple')
      );
    });

    it('devrait formater correctement avec un objet de données', () => {
      const obj = { a: 1, b: 2 };
      logger.info('test', 'message', obj);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        expect.stringContaining('message'),
        obj
      );
    });

    it('devrait gérer les messages vides', () => {
      logger.info('test', '');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][test]'),
        ''
      );
    });

    it('devrait gérer les contextes vides', () => {
      logger.info('', 'message sans contexte');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[TravelBook][]'),
        expect.stringContaining('message sans contexte')
      );
    });
  });
});
