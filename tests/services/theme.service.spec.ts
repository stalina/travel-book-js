import { describe, it, expect, beforeEach } from 'vitest'
import { ThemeService } from '../../src/services/theme.service'
import type { ThemeConfig, ThemeOverrides } from '../../src/models/theme.types'

describe('ThemeService', () => {
  let service: ThemeService

  beforeEach(() => {
    service = ThemeService.getInstance()
  })

  // ---------- Catalogue ---------------------------------------------------

  describe('catalogue', () => {
    it('retourne au moins 3 thèmes', () => {
      const themes = service.getAllThemes()
      expect(themes.length).toBeGreaterThanOrEqual(3)
    })

    it('contient le thème default', () => {
      const theme = service.getTheme('default')
      expect(theme.id).toBe('default')
      expect(theme.name).toBe('Classique')
    })

    it('contient le thème montagne', () => {
      const theme = service.getTheme('mountain')
      expect(theme.id).toBe('mountain')
      expect(theme.name).toBe('Montagne')
    })

    it('contient le thème vacances', () => {
      const theme = service.getTheme('vacation')
      expect(theme.id).toBe('vacation')
      expect(theme.name).toBe('Vacances')
    })

    it('retourne le thème default pour un id inconnu', () => {
      const theme = service.getTheme('non-existant')
      expect(theme.id).toBe('default')
    })

    it('chaque thème a toutes les propriétés requises', () => {
      for (const theme of service.getAllThemes()) {
        expect(theme.id).toBeTruthy()
        expect(theme.name).toBeTruthy()
        expect(theme.description).toBeTruthy()
        expect(theme.icon).toBeTruthy()
        expect(theme.colors).toBeDefined()
        expect(theme.colors.primary).toBeTruthy()
        expect(theme.colors.secondary).toBeTruthy()
        expect(theme.fonts).toBeDefined()
        expect(theme.fonts.headingFamily).toBeTruthy()
        expect(theme.fonts.bodyFamily).toBeTruthy()
        expect(theme.decorations).toBeDefined()
        expect(theme.spacing).toBeDefined()
      }
    })
  })

  // ---------- Résolution avec overrides -----------------------------------

  describe('resolveTheme', () => {
    it('retourne le thème de base sans overrides', () => {
      const resolved = service.resolveTheme('default')
      const base = service.getTheme('default')
      expect(resolved).toEqual(base)
    })

    it('retourne le thème de base avec overrides vides', () => {
      const resolved = service.resolveTheme('default', {})
      const base = service.getTheme('default')
      expect(resolved).toEqual(base)
    })

    it('applique un override de couleur primaire', () => {
      const overrides: ThemeOverrides = { primary: '#ff0000' }
      const resolved = service.resolveTheme('default', overrides)
      expect(resolved.colors.primary).toBe('#ff0000')
      // Les autres couleurs restent identiques
      const base = service.getTheme('default')
      expect(resolved.colors.secondary).toBe(base.colors.secondary)
    })

    it('applique un override de police', () => {
      const overrides: ThemeOverrides = { headingFamily: '"Comic Sans MS"' }
      const resolved = service.resolveTheme('mountain', overrides)
      expect(resolved.fonts.headingFamily).toBe('"Comic Sans MS"')
    })

    it('applique un override de décoration', () => {
      const overrides: ThemeOverrides = { borderRadius: 16 }
      const resolved = service.resolveTheme('vacation', overrides)
      expect(resolved.decorations.borderRadius).toBe(16)
    })

    it('applique un override d\'espacement', () => {
      const overrides: ThemeOverrides = { photoGap: 24 }
      const resolved = service.resolveTheme('default', overrides)
      expect(resolved.spacing.photoGap).toBe(24)
    })

    it('applique plusieurs overrides simultanément', () => {
      const overrides: ThemeOverrides = {
        primary: '#aa0000',
        bodyFamily: '"Georgia", serif',
        borderStyle: 'dashed',
        contentPadding: 100,
      }
      const resolved = service.resolveTheme('default', overrides)
      expect(resolved.colors.primary).toBe('#aa0000')
      expect(resolved.fonts.bodyFamily).toBe('"Georgia", serif')
      expect(resolved.decorations.borderStyle).toBe('dashed')
      expect(resolved.spacing.contentPadding).toBe(100)
    })

    it('ne modifie pas le thème de base (immutabilité)', () => {
      const baseBefore = JSON.parse(JSON.stringify(service.getTheme('default')))
      service.resolveTheme('default', { primary: '#ff0000' })
      const baseAfter = service.getTheme('default')
      expect(baseAfter).toEqual(baseBefore)
    })
  })

  // ---------- Génération CSS ----------------------------------------------

  describe('toCssVariables', () => {
    it('génère des déclarations CSS valides', () => {
      const theme = service.getTheme('default')
      const css = service.toCssVariables(theme)
      expect(css).toContain('--theme-color:')
      expect(css).toContain('--theme-primary:')
      expect(css).toContain('--theme-secondary:')
      expect(css).toContain('--theme-heading-font:')
      expect(css).toContain('--theme-body-font:')
      expect(css).toContain('--theme-border-radius:')
      expect(css).toContain('--theme-content-padding:')
    })

    it('contient les valeurs du thème', () => {
      const theme = service.getTheme('mountain')
      const css = service.toCssVariables(theme)
      expect(css).toContain(theme.colors.primary)
      expect(css).toContain(theme.colors.secondary)
    })

    it('conserve --theme-color comme alias de primary', () => {
      const theme = service.getTheme('vacation')
      const css = service.toCssVariables(theme)
      // --theme-color et --theme-primary doivent pointer vers la même valeur
      const colorLine = css.split('\n').find(l => l.includes('--theme-color:'))
      const primaryLine = css.split('\n').find(l => l.includes('--theme-primary:'))
      expect(colorLine).toContain(theme.colors.primary)
      expect(primaryLine).toContain(theme.colors.primary)
    })
  })

  // ---------- Bloc <style> complet ----------------------------------------

  describe('buildThemeStyleBlock', () => {
    it('retourne un bloc <style id="theme-overrides">', () => {
      const block = service.buildThemeStyleBlock('default')
      expect(block).toContain('<style id="theme-overrides">')
      expect(block).toContain(':root {')
      expect(block).toContain('</style>')
    })

    it('inclut les overrides dans le bloc', () => {
      const block = service.buildThemeStyleBlock('default', { primary: '#ff0000' })
      expect(block).toContain('#ff0000')
    })

    it('génère un bloc valide pour chaque thème du catalogue', () => {
      for (const theme of service.getAllThemes()) {
        const block = service.buildThemeStyleBlock(theme.id)
        expect(block).toContain('<style id="theme-overrides">')
        expect(block).toContain(theme.colors.primary)
      }
    })
  })

  // ---------- parseColor ---------------------------------------------------

  describe('parseColor', () => {
    it('parse #rrggbb', () => {
      expect(service.parseColor('#ff8800')).toEqual([255, 136, 0])
    })

    it('parse #rgb raccourci', () => {
      expect(service.parseColor('#f80')).toEqual([255, 136, 0])
    })

    it('parse rgb(r, g, b)', () => {
      expect(service.parseColor('rgb(71, 174, 162)')).toEqual([71, 174, 162])
    })

    it('retourne null pour une couleur invalide', () => {
      expect(service.parseColor('bleu')).toBeNull()
      expect(service.parseColor('')).toBeNull()
    })

    it('gère les espaces autour', () => {
      expect(service.parseColor('  #abc  ')).toEqual([170, 187, 204])
    })
  })

  // ---------- relativeLuminance --------------------------------------------

  describe('relativeLuminance', () => {
    it('noir = 0', () => {
      expect(service.relativeLuminance('#000000')).toBeCloseTo(0, 4)
    })

    it('blanc = 1', () => {
      expect(service.relativeLuminance('#ffffff')).toBeCloseTo(1, 4)
    })

    it('retourne null si couleur invalide', () => {
      expect(service.relativeLuminance('invalid')).toBeNull()
    })
  })

  // ---------- contrastRatio ------------------------------------------------

  describe('contrastRatio', () => {
    it('noir sur blanc = 21:1', () => {
      const ratio = service.contrastRatio('#000000', '#ffffff')
      expect(ratio).toBeCloseTo(21, 0)
    })

    it('blanc sur blanc = 1:1', () => {
      const ratio = service.contrastRatio('#ffffff', '#ffffff')
      expect(ratio).toBeCloseTo(1, 0)
    })

    it('est symétrique', () => {
      const r1 = service.contrastRatio('#2d6b4f', '#faf8f5')
      const r2 = service.contrastRatio('#faf8f5', '#2d6b4f')
      expect(r1).toBeCloseTo(r2!, 4)
    })

    it('retourne null si couleur invalide', () => {
      expect(service.contrastRatio('invalid', '#fff')).toBeNull()
    })
  })

  // ---------- wcagLevel ----------------------------------------------------

  describe('wcagLevel', () => {
    it('ratio >= 7 → AAA', () => {
      expect(service.wcagLevel(7)).toBe('AAA')
      expect(service.wcagLevel(21)).toBe('AAA')
    })

    it('ratio >= 4.5 et < 7 → AA', () => {
      expect(service.wcagLevel(4.5)).toBe('AA')
      expect(service.wcagLevel(6.9)).toBe('AA')
    })

    it('ratio < 4.5 → FAIL', () => {
      expect(service.wcagLevel(1)).toBe('FAIL')
      expect(service.wcagLevel(4.4)).toBe('FAIL')
    })
  })

  // ---------- checkThemeContrasts ------------------------------------------

  describe('checkThemeContrasts', () => {
    it('retourne 5 entrées pour le thème default', () => {
      const checks = service.checkThemeContrasts('default')
      expect(checks).toHaveLength(5)
    })

    it('chaque entrée a label, ratio, level', () => {
      const checks = service.checkThemeContrasts('default')
      for (const c of checks) {
        expect(c.label).toBeTruthy()
        expect(c.ratio).toBeGreaterThan(0)
        expect(['AAA', 'AA', 'FAIL']).toContain(c.level)
      }
    })

    it('le thème default a au moins AA pour texte principal/fond', () => {
      const checks = service.checkThemeContrasts('default')
      const textPrimary = checks.find(c => c.label.includes('Texte principal'))
      expect(textPrimary).toBeDefined()
      expect(['AA', 'AAA']).toContain(textPrimary!.level)
    })

    it('le thème montagne a au moins AA pour texte principal/fond', () => {
      const checks = service.checkThemeContrasts('mountain')
      const textPrimary = checks.find(c => c.label.includes('Texte principal'))
      expect(textPrimary).toBeDefined()
      expect(['AA', 'AAA']).toContain(textPrimary!.level)
    })

    it('respecte les overrides pour le calcul', () => {
      // Texte blanc sur fond blanc = quasi 1:1 → FAIL
      const checks = service.checkThemeContrasts('default', {
        textPrimary: '#ffffff',
        background: '#ffffff',
      })
      const textPrimary = checks.find(c => c.label.includes('Texte principal'))
      expect(textPrimary!.level).toBe('FAIL')
      expect(textPrimary!.ratio).toBeCloseTo(1, 0)
    })
  })
})
