import type { ContrastCheck, ThemeColors, ThemeConfig, ThemeDecorations, ThemeFonts, ThemeOverrides, ThemeSpacing } from '../models/theme.types'

// ---------------------------------------------------------------------------
// Thème par défaut (correspond aux variables CSS actuelles)
// ---------------------------------------------------------------------------

const DEFAULT_THEME: ThemeConfig = {
  id: 'default',
  name: 'Classique',
  description: 'Le thème par défaut du Travel Book, turquoise et bleu foncé.',
  category: 'default',
  icon: '🌍',
  colors: {
    primary: 'rgb(71, 174, 162)',
    secondary: 'rgb(0, 46, 61)',
    accent: 'rgb(71, 174, 162)',
    background: '#ffffff',
    textPrimary: 'rgb(0, 46, 61)',
    textSecondary: '#4b5a6c',
    borderColor: '#e7eaee',
  },
  fonts: {
    headingFamily: '"BrandonGrotesque", sans-serif',
    bodyFamily: '"Noto Serif", serif',
    labelFamily: '"BrandonGrotesque", sans-serif',
  },
  decorations: {
    borderStyle: 'none',
    borderRadius: 0,
    separatorStyle: 'line',
    coverOverlayOpacity: 0.35,
  },
  spacing: {
    contentPadding: 202,
    photoGap: 8,
    sectionGap: 24,
  },
}

// ---------------------------------------------------------------------------
// Thème Montagne
// ---------------------------------------------------------------------------

const MOUNTAIN_THEME: ThemeConfig = {
  id: 'mountain',
  name: 'Montagne',
  description: 'Palette terre et forêt pour les voyages en altitude.',
  category: 'nature',
  icon: '🏔️',
  colors: {
    primary: '#2d6b4f',
    secondary: '#5c3d2e',
    accent: '#8fbc8f',
    background: '#faf8f5',
    textPrimary: '#3b2e1e',
    textSecondary: '#6b5d50',
    borderColor: '#d4c8b8',
  },
  fonts: {
    headingFamily: '"BrandonGrotesque", sans-serif',
    bodyFamily: '"Noto Serif", serif',
    labelFamily: '"BrandonGrotesque", sans-serif',
  },
  decorations: {
    borderStyle: 'solid',
    borderRadius: 4,
    separatorStyle: 'line',
    coverOverlayOpacity: 0.4,
  },
  spacing: {
    contentPadding: 202,
    photoGap: 10,
    sectionGap: 28,
  },
}

// ---------------------------------------------------------------------------
// Thème Vacances
// ---------------------------------------------------------------------------

const VACATION_THEME: ThemeConfig = {
  id: 'vacation',
  name: 'Vacances',
  description: 'Palette soleil et mer pour les escapades estivales.',
  category: 'nature',
  icon: '🏖️',
  colors: {
    primary: '#e87d3e',
    secondary: '#1976d2',
    accent: '#ffb74d',
    background: '#fffdf8',
    textPrimary: '#263238',
    textSecondary: '#546e7a',
    borderColor: '#b0bec5',
  },
  fonts: {
    headingFamily: '"BrandonGrotesque", sans-serif',
    bodyFamily: '"Noto Serif", serif',
    labelFamily: '"BrandonGrotesque", sans-serif',
  },
  decorations: {
    borderStyle: 'none',
    borderRadius: 8,
    separatorStyle: 'dots',
    coverOverlayOpacity: 0.3,
  },
  spacing: {
    contentPadding: 202,
    photoGap: 12,
    sectionGap: 24,
  },
}

// ---------------------------------------------------------------------------
// Thème Ski
// ---------------------------------------------------------------------------

const SKI_THEME: ThemeConfig = {
  id: 'ski',
  name: 'Ski',
  description: 'Palette froide neige et sapins pour les séjours au ski.',
  category: 'nature',
  icon: '⛷️',
  colors: {
    primary: '#1565c0',
    secondary: '#0d47a1',
    accent: '#4fc3f7',
    background: '#f5f9ff',
    textPrimary: '#1a237e',
    textSecondary: '#455a64',
    borderColor: '#bbdefb',
  },
  fonts: {
    headingFamily: '"Montserrat", sans-serif',
    bodyFamily: '"Noto Serif", serif',
    labelFamily: '"Montserrat", sans-serif',
  },
  decorations: {
    borderStyle: 'solid',
    borderRadius: 6,
    separatorStyle: 'line',
    coverOverlayOpacity: 0.35,
  },
  spacing: {
    contentPadding: 202,
    photoGap: 8,
    sectionGap: 24,
  },
}

// ---------------------------------------------------------------------------
// Thème Noël
// ---------------------------------------------------------------------------

const CHRISTMAS_THEME: ThemeConfig = {
  id: 'christmas',
  name: 'Noël',
  description: 'Rouge et vert classique pour les fêtes de fin d\'année.',
  category: 'seasonal',
  icon: '🎄',
  colors: {
    primary: '#c62828',
    secondary: '#2e7d32',
    accent: '#ffd54f',
    background: '#fffdf5',
    textPrimary: '#3e2723',
    textSecondary: '#5d4037',
    borderColor: '#d7ccc8',
  },
  fonts: {
    headingFamily: '"Playfair Display", serif',
    bodyFamily: '"Noto Serif", serif',
    labelFamily: '"BrandonGrotesque", sans-serif',
  },
  decorations: {
    borderStyle: 'solid',
    borderRadius: 4,
    separatorStyle: 'dots',
    coverOverlayOpacity: 0.4,
  },
  spacing: {
    contentPadding: 202,
    photoGap: 10,
    sectionGap: 28,
  },
}

// ---------------------------------------------------------------------------
// Thème Halloween
// ---------------------------------------------------------------------------

const HALLOWEEN_THEME: ThemeConfig = {
  id: 'halloween',
  name: 'Halloween',
  description: 'Orange et noir pour une ambiance frissonnante.',
  category: 'seasonal',
  icon: '🎃',
  colors: {
    primary: '#e65100',
    secondary: '#4a148c',
    accent: '#ff9800',
    background: '#1a1a2e',
    textPrimary: '#f5f5f5',
    textSecondary: '#b0bec5',
    borderColor: '#4a4a6a',
  },
  fonts: {
    headingFamily: '"Playfair Display", serif',
    bodyFamily: '"Noto Serif", serif',
    labelFamily: '"Montserrat", sans-serif',
  },
  decorations: {
    borderStyle: 'none',
    borderRadius: 8,
    separatorStyle: 'wave',
    coverOverlayOpacity: 0.5,
  },
  spacing: {
    contentPadding: 202,
    photoGap: 10,
    sectionGap: 24,
  },
}

// ---------------------------------------------------------------------------
// Thème Pâques
// ---------------------------------------------------------------------------

const EASTER_THEME: ThemeConfig = {
  id: 'easter',
  name: 'Pâques',
  description: 'Pastels printaniers pour les voyages de printemps.',
  category: 'seasonal',
  icon: '🐣',
  colors: {
    primary: '#7b1fa2',
    secondary: '#4caf50',
    accent: '#f48fb1',
    background: '#faf5ff',
    textPrimary: '#311b92',
    textSecondary: '#6a5b7b',
    borderColor: '#e1bee7',
  },
  fonts: {
    headingFamily: '"Caveat", cursive',
    bodyFamily: '"Noto Serif", serif',
    labelFamily: '"Montserrat", sans-serif',
  },
  decorations: {
    borderStyle: 'dashed',
    borderRadius: 12,
    separatorStyle: 'dots',
    coverOverlayOpacity: 0.3,
  },
  spacing: {
    contentPadding: 202,
    photoGap: 10,
    sectionGap: 24,
  },
}

// ---------------------------------------------------------------------------
// Thème Anniversaire
// ---------------------------------------------------------------------------

const BIRTHDAY_THEME: ThemeConfig = {
  id: 'birthday',
  name: 'Anniversaire',
  description: 'Festif et coloré pour célébrer les moments spéciaux.',
  category: 'event',
  icon: '🎂',
  colors: {
    primary: '#d81b60',
    secondary: '#6a1b9a',
    accent: '#ffd600',
    background: '#fff8f0',
    textPrimary: '#37474f',
    textSecondary: '#607d8b',
    borderColor: '#f8bbd0',
  },
  fonts: {
    headingFamily: '"Caveat", cursive',
    bodyFamily: '"Montserrat", sans-serif',
    labelFamily: '"Montserrat", sans-serif',
  },
  decorations: {
    borderStyle: 'none',
    borderRadius: 16,
    separatorStyle: 'dots',
    coverOverlayOpacity: 0.3,
  },
  spacing: {
    contentPadding: 202,
    photoGap: 12,
    sectionGap: 24,
  },
}

// ---------------------------------------------------------------------------
// Thème Saint Valentin
// ---------------------------------------------------------------------------

const VALENTINE_THEME: ThemeConfig = {
  id: 'valentine',
  name: 'St Valentin',
  description: 'Roses et rouges romantiques pour les voyages en amoureux.',
  category: 'event',
  icon: '💕',
  colors: {
    primary: '#e91e63',
    secondary: '#880e4f',
    accent: '#f8bbd0',
    background: '#fff0f3',
    textPrimary: '#4a0e23',
    textSecondary: '#7b4960',
    borderColor: '#f48fb1',
  },
  fonts: {
    headingFamily: '"Playfair Display", serif',
    bodyFamily: '"Noto Serif", serif',
    labelFamily: '"Playfair Display", serif',
  },
  decorations: {
    borderStyle: 'none',
    borderRadius: 12,
    separatorStyle: 'wave',
    coverOverlayOpacity: 0.35,
  },
  spacing: {
    contentPadding: 202,
    photoGap: 10,
    sectionGap: 28,
  },
}

// ---------------------------------------------------------------------------
// Thème Soleil / Nature
// ---------------------------------------------------------------------------

const SUNSHINE_THEME: ThemeConfig = {
  id: 'sunshine',
  name: 'Soleil',
  description: 'Jaune lumineux et vert nature pour les aventures en plein air.',
  category: 'nature',
  icon: '☀️',
  colors: {
    primary: '#f9a825',
    secondary: '#33691e',
    accent: '#ffee58',
    background: '#fffff0',
    textPrimary: '#33291a',
    textSecondary: '#5d4e37',
    borderColor: '#dcedc8',
  },
  fonts: {
    headingFamily: '"Montserrat", sans-serif',
    bodyFamily: '"Noto Serif", serif',
    labelFamily: '"Montserrat", sans-serif',
  },
  decorations: {
    borderStyle: 'none',
    borderRadius: 8,
    separatorStyle: 'line',
    coverOverlayOpacity: 0.25,
  },
  spacing: {
    contentPadding: 202,
    photoGap: 10,
    sectionGap: 24,
  },
}

// ---------------------------------------------------------------------------
// Catalogue complet
// ---------------------------------------------------------------------------

const THEME_CATALOG: ThemeConfig[] = [
  DEFAULT_THEME,
  MOUNTAIN_THEME,
  VACATION_THEME,
  SKI_THEME,
  CHRISTMAS_THEME,
  HALLOWEEN_THEME,
  EASTER_THEME,
  BIRTHDAY_THEME,
  VALENTINE_THEME,
  SUNSHINE_THEME,
]

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

/**
 * ThemeService — Singleton gérant le catalogue de thèmes et la résolution
 * des variables CSS correspondantes.
 */
export class ThemeService {
  private constructor() {}

  // -- Catalogue -----------------------------------------------------------

  /** Retourne tous les thèmes disponibles */
  public getAllThemes(): ThemeConfig[] {
    return THEME_CATALOG
  }

  /** Retourne un thème par son id (fallback : thème default) */
  public getTheme(id: string): ThemeConfig {
    return THEME_CATALOG.find(t => t.id === id) ?? DEFAULT_THEME
  }

  /** Retourne le thème par défaut */
  public getDefaultTheme(): ThemeConfig {
    return DEFAULT_THEME
  }

  // -- Résolution avec overrides -------------------------------------------

  /**
   * Fusionne un thème de base avec les surcharges utilisateur.
   * Retourne un ThemeConfig complet prêt à être converti en CSS.
   */
  public resolveTheme(themeId: string, overrides?: ThemeOverrides): ThemeConfig {
    const base = this.getTheme(themeId)
    if (!overrides || Object.keys(overrides).length === 0) {
      return base
    }

    // Extraire les champs par catégorie
    const colorKeys: (keyof ThemeColors)[] = [
      'primary', 'secondary', 'accent', 'background',
      'textPrimary', 'textSecondary', 'borderColor',
    ]
    const fontKeys: (keyof ThemeFonts)[] = [
      'headingFamily', 'bodyFamily', 'labelFamily',
    ]
    const decoKeys: (keyof ThemeDecorations)[] = [
      'borderStyle', 'borderRadius', 'separatorStyle', 'coverOverlayOpacity',
    ]
    const spacingKeys: (keyof ThemeSpacing)[] = [
      'contentPadding', 'photoGap', 'sectionGap',
    ]

    const applyOverrides = <T>(source: T, keys: readonly string[]): T => {
      const result = { ...source } as Record<string, unknown>
      for (const k of keys) {
        const val = (overrides as Record<string, unknown>)[k]
        if (val !== undefined) {
          result[k] = val
        }
      }
      return result as T
    }

    return {
      ...base,
      colors: applyOverrides(base.colors, colorKeys),
      fonts: applyOverrides(base.fonts, fontKeys),
      decorations: applyOverrides(base.decorations, decoKeys),
      spacing: applyOverrides(base.spacing, spacingKeys),
    }
  }

  // -- Génération CSS ------------------------------------------------------

  /**
   * Convertit un ThemeConfig complet en un bloc de déclarations CSS
   * (contenu d'un sélecteur :root) prêt à être injecté dans un <style>.
   *
   * Retourne uniquement les déclarations, sans le sélecteur :root{}.
   * L'appelant est responsable de l'encapsuler si besoin.
   */
  public toCssVariables(theme: ThemeConfig): string {
    const lines: string[] = []

    // Couleurs
    lines.push(`  --theme-color: ${theme.colors.primary};`)
    lines.push(`  --theme-primary: ${theme.colors.primary};`)
    lines.push(`  --theme-secondary: ${theme.colors.secondary};`)
    lines.push(`  --theme-accent: ${theme.colors.accent};`)
    lines.push(`  --theme-bg: ${theme.colors.background};`)
    lines.push(`  --theme-text-primary: ${theme.colors.textPrimary};`)
    lines.push(`  --theme-text-secondary: ${theme.colors.textSecondary};`)
    lines.push(`  --theme-border-color: ${theme.colors.borderColor};`)

    // Polices
    lines.push(`  --theme-heading-font: ${theme.fonts.headingFamily};`)
    lines.push(`  --theme-body-font: ${theme.fonts.bodyFamily};`)
    lines.push(`  --theme-label-font: ${theme.fonts.labelFamily};`)

    // Décorations
    lines.push(`  --theme-border-style: ${theme.decorations.borderStyle};`)
    lines.push(`  --theme-border-radius: ${theme.decorations.borderRadius}px;`)
    lines.push(`  --theme-separator-style: ${theme.decorations.separatorStyle};`)
    lines.push(`  --theme-cover-overlay-opacity: ${theme.decorations.coverOverlayOpacity};`)

    // Espacements
    lines.push(`  --theme-content-padding: ${theme.spacing.contentPadding}px;`)
    lines.push(`  --theme-photo-gap: ${theme.spacing.photoGap}px;`)
    lines.push(`  --theme-section-gap: ${theme.spacing.sectionGap}px;`)

    return lines.join('\n')
  }

  /**
   * Retourne un bloc <style> complet prêt à être injecté dans le <head>.
   * Ne retourne une chaîne vide que si le thème est le default ET sans overrides.
   */
  public buildThemeStyleBlock(themeId: string, overrides?: ThemeOverrides): string {
    const resolved = this.resolveTheme(themeId, overrides)
    // Toujours injecter le bloc pour garantir la cohérence (même pour le thème default)
    const vars = this.toCssVariables(resolved)
    return `<style id="theme-overrides">\n:root {\n${vars}\n}\n</style>`
  }

  // -- Accessibilité WCAG --------------------------------------------------

  /**
   * Parse une couleur CSS (hex, rgb(), ou nom) et retourne [r, g, b].
   * Supporte : #rgb, #rrggbb, rgb(r, g, b).
   */
  public parseColor(color: string): [number, number, number] | null {
    const trimmed = color.trim()

    // #rrggbb
    const hex6 = trimmed.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/)
    if (hex6) {
      return [parseInt(hex6[1], 16), parseInt(hex6[2], 16), parseInt(hex6[3], 16)]
    }

    // #rgb
    const hex3 = trimmed.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/)
    if (hex3) {
      return [
        parseInt(hex3[1] + hex3[1], 16),
        parseInt(hex3[2] + hex3[2], 16),
        parseInt(hex3[3] + hex3[3], 16),
      ]
    }

    // rgb(r, g, b)
    const rgbMatch = trimmed.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])]
    }

    return null
  }

  /**
   * Calcule la luminance relative d'une couleur selon WCAG 2.1.
   * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
   */
  public relativeLuminance(color: string): number | null {
    const rgb = this.parseColor(color)
    if (!rgb) return null

    const [r, g, b] = rgb.map(c => {
      const sRGB = c / 255
      return sRGB <= 0.04045 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  /**
   * Calcule le ratio de contraste entre deux couleurs (WCAG 2.1).
   * Retourne un nombre entre 1 et 21.
   * @see https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio
   */
  public contrastRatio(color1: string, color2: string): number | null {
    const l1 = this.relativeLuminance(color1)
    const l2 = this.relativeLuminance(color2)
    if (l1 === null || l2 === null) return null

    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)
  }

  /**
   * Niveau de conformité WCAG pour texte normal (>= 14px).
   * - AAA : ratio >= 7
   * - AA  : ratio >= 4.5
   * - FAIL : ratio < 4.5
   */
  public wcagLevel(ratio: number): 'AAA' | 'AA' | 'FAIL' {
    if (ratio >= 7) return 'AAA'
    if (ratio >= 4.5) return 'AA'
    return 'FAIL'
  }

  /**
   * Vérifie les contrastes critiques d'un thème résolu.
   * Retourne un tableau de diagnostics pour chaque paire pertinente.
   */
  public checkThemeContrasts(themeId: string, overrides?: ThemeOverrides): ContrastCheck[] {
    const theme = this.resolveTheme(themeId, overrides)
    const pairs: Array<{ label: string; fg: string; bg: string }> = [
      { label: 'Texte principal / Fond', fg: theme.colors.textPrimary, bg: theme.colors.background },
      { label: 'Texte secondaire / Fond', fg: theme.colors.textSecondary, bg: theme.colors.background },
      { label: 'Couleur primaire / Fond', fg: theme.colors.primary, bg: theme.colors.background },
      { label: 'Couleur secondaire / Fond', fg: theme.colors.secondary, bg: theme.colors.background },
      { label: 'Accent / Fond', fg: theme.colors.accent, bg: theme.colors.background },
    ]
    return pairs.map(({ label, fg, bg }) => {
      const ratio = this.contrastRatio(fg, bg)
      return {
        label,
        foreground: fg,
        background: bg,
        ratio: ratio ?? 0,
        level: this.wcagLevel(ratio ?? 0),
      }
    })
  }

  // -- Singleton -----------------------------------------------------------

  private static instance: ThemeService | null = null

  public static getInstance(): ThemeService {
    if (!ThemeService.instance) {
      ThemeService.instance = new ThemeService()
    }
    return ThemeService.instance
  }
}

export const themeService = ThemeService.getInstance()
