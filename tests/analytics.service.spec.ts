import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AnalyticsService, AnalyticsEvent } from '../src/services/analytics.service'

describe('AnalyticsService', () => {
  let service: AnalyticsService

  beforeEach(() => {
    // Reset singleton pour chaque test
    // @ts-ignore - Accès privé pour les tests
    AnalyticsService.instance = null
    service = AnalyticsService.getInstance()
  })

  it('devrait être un singleton', () => {
    const instance1 = AnalyticsService.getInstance()
    const instance2 = AnalyticsService.getInstance()
    expect(instance1).toBe(instance2)
  })

  it('devrait retourner "direct" si pas de referrer', () => {
    // Mock document.referrer vide
    Object.defineProperty(document, 'referrer', {
      value: '',
      writable: true,
      configurable: true
    })

    const source = service.getTrafficSource()
    expect(source).toBe('direct')
  })

  it('devrait extraire le hostname du referrer', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'https://www.google.com/search?q=travel+book',
      writable: true,
      configurable: true
    })

    const source = service.getTrafficSource()
    expect(source).toBe('www.google.com')
  })

  it('devrait gérer les erreurs de parsing d\'URL', () => {
    Object.defineProperty(document, 'referrer', {
      value: 'not-a-valid-url',
      writable: true,
      configurable: true
    })

    const source = service.getTrafficSource()
    expect(source).toBe('unknown')
  })

  it('ne devrait pas planter si trackEvent est appelé sans initialisation', () => {
    // Sans project ID, les méthodes doivent être silencieuses
    expect(() => {
      service.trackEvent(AnalyticsEvent.LANDING_VIEW)
    }).not.toThrow()
  })

  it('ne devrait pas planter si trackPageView est appelé sans initialisation', () => {
    expect(() => {
      service.trackPageView('test')
    }).not.toThrow()
  })

  it('devrait initialiser sans erreur même sans project ID', () => {
    // Simuler l'absence de variable d'env
    vi.stubEnv('VITE_CLARITY_PROJECT_ID', '')
    
    expect(() => {
      service.initialize()
    }).not.toThrow()
  })
})
