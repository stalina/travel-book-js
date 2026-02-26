/**
 * Système de thèmes visuels pour le Travel Book.
 *
 * Un thème définit l'ensemble des paramètres visuels (couleurs, polices,
 * décorations, espacements) appliqués lors de la génération HTML.
 * Les variables CSS correspondantes sont injectées dans le <head> du document
 * via un bloc <style id="theme-overrides">.
 */

// ---------------------------------------------------------------------------
// Couleurs
// ---------------------------------------------------------------------------

export interface ThemeColors {
  /** Couleur principale (accent, barres, marqueurs) */
  primary: string
  /** Couleur secondaire (badges, sous-titres) */
  secondary: string
  /** Couleur d'accent complémentaire (liens, survol) */
  accent: string
  /** Couleur de fond de page */
  background: string
  /** Couleur du texte principal */
  textPrimary: string
  /** Couleur du texte secondaire (légendes, meta) */
  textSecondary: string
  /** Couleur des bordures */
  borderColor: string
}

// ---------------------------------------------------------------------------
// Polices
// ---------------------------------------------------------------------------

export interface ThemeFonts {
  /** Police des titres (h1, h2, noms d'étapes) */
  headingFamily: string
  /** Police du corps de texte */
  bodyFamily: string
  /** Police des labels/légendes (statistiques, dates) */
  labelFamily: string
}

// ---------------------------------------------------------------------------
// Décorations
// ---------------------------------------------------------------------------

export interface ThemeDecorations {
  /** Style de bordure (none | solid | dashed | double) */
  borderStyle: 'none' | 'solid' | 'dashed' | 'double'
  /** Rayon des coins en px */
  borderRadius: number
  /** Style de séparateur entre sections */
  separatorStyle: 'none' | 'line' | 'dots' | 'wave'
  /** Opacité de l'overlay sur la couverture (0-1) */
  coverOverlayOpacity: number
}

// ---------------------------------------------------------------------------
// Espacements
// ---------------------------------------------------------------------------

export interface ThemeSpacing {
  /** Padding du contenu principal en px */
  contentPadding: number
  /** Espacement entre photos en px */
  photoGap: number
  /** Espacement entre sections/pages en px */
  sectionGap: number
}

// ---------------------------------------------------------------------------
// Configuration complète d'un thème
// ---------------------------------------------------------------------------

export interface ThemeConfig {
  /** Identifiant unique du thème */
  id: string
  /** Nom affiché à l'utilisateur */
  name: string
  /** Description courte du thème */
  description: string
  /** Catégorie pour le regroupement UI */
  category: 'default' | 'nature' | 'seasonal' | 'event'
  /** Icône emoji pour la miniature */
  icon: string

  colors: ThemeColors
  fonts: ThemeFonts
  decorations: ThemeDecorations
  spacing: ThemeSpacing
}

// ---------------------------------------------------------------------------
// Surcharges utilisateur (toutes les propriétés visuelles sont optionnelles)
// ---------------------------------------------------------------------------

export type ThemeOverrides = Partial<ThemeColors & ThemeFonts & ThemeDecorations & ThemeSpacing>

// ---------------------------------------------------------------------------
// Résultat de vérification de contraste WCAG
// ---------------------------------------------------------------------------

export interface ContrastCheck {
  /** Description de la paire testée (ex : "Texte principal / Fond") */
  label: string
  /** Couleur de premier plan */
  foreground: string
  /** Couleur d'arrière-plan */
  background: string
  /** Ratio de contraste (1–21) */
  ratio: number
  /** Niveau WCAG atteint : AAA (>= 7), AA (>= 4.5), ou FAIL */
  level: 'AAA' | 'AA' | 'FAIL'
}
