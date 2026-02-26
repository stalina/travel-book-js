---
id: TASK-21.6
title: Thèmes et templates personnalisables
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-30 22:12'
updated_date: '2026-02-13 21:40'
labels: []
dependencies: []
parent_task_id: TASK-21
priority: low
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Bibliothèque de thèmes visuels et templates de mise en page avec prévisualisation instantanée et personnalisation fine (couleurs, polices, layouts)

L'objectifs est de proposer à l'utilisateur des thèmes prédéfinis et modifiable pour la création et l'export PDF de son albulm de voyage.

Les thèmes prédéfinis peuvent être : 
 * Montagne
* Ski
* Noël
* Halloween
* Paques
* Anniversaire
* Saint valentin
* Vacances
* Soleil
* Nature
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Phase 1: ThemeConfig types définis (ThemeColors, ThemeFonts, ThemeDecorations, ThemeSpacing, ThemeOverrides)
- [x] #2 Phase 1: ThemeService singleton avec catalogue 3 thèmes (default, montagne, vacances)
- [x] #3 Phase 1: CSS variables thème dans style.css avec rétrocompatibilité
- [x] #4 Phase 1: Injection theme-overrides dans generate.service et buildSingleFileHtml avec ordre CSS correct
- [x] #5 Phase 1: editor.store étendu (selectedThemeId, themeOverrides, setTheme, invalidation preview)
- [x] #6 Phase 1: Persistance thème dans DraftSnapshot et draft-storage.service
- [x] #7 Phase 1: ThemeSelector.vue intégré dans EditorView
- [x] #8 Phase 1: Preview inline (step) et dialog appliquent correctement le thème sélectionné
- [x] #9 Phase 1: 20 tests unitaires theme.service.spec.ts passent
- [x] #10 Phase 2: ThemeCustomizer.vue avec color pickers et validation WCAG
- [ ] #11 Phase 3: Polices embarquées + 7 thèmes supplémentaires
- [ ] #12 Phase 4: DocumentTemplate et variantes de layout
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
Phase 1 — Infrastructure + 3 thèmes de base
1. Créer src/models/theme.types.ts (ThemeConfig, ThemeColors, ThemeFonts, ThemeDecorations, ThemeSpacing, ThemeOverrides)
2. Créer src/services/theme.service.ts (Singleton, catalogue 3 thèmes, resolveTheme, toCssVariables)
3. Étendre CSS variables dans public/assets/style.css (--theme-primary, --theme-heading-font, etc.)
4. Ajouter themeId/themeOverrides dans GenerateOptions (src/models/editor.types.ts)
5. Injecter bloc <style id="theme-overrides"> dans generate.service.ts buildHtmlHead()
6. Étendre editor.store.ts (selectedThemeId, themeOverrides, actions)
7. Étendre draft-storage.service.ts (persister thème dans DraftSnapshot)
8. Propager thème dans useEditorGeneration.ts buildOptions()
9. Créer src/components/editor/ThemeSelector.vue (grille cartes miniatures)
10. Remplacer placeholder dans EditorView.vue par <ThemeSelector />
11. Définir 3 thèmes : Default, Montagne, Vacances
12. Tests : theme.service.spec.ts, generate.service, draft-storage

Phase 2 — Personnalisation complète
13. Créer ThemeCustomizer.vue (color pickers, selects polices, sliders)
14. Intégrer dans EditorView.vue sous ThemeSelector
15. Debounce preview sur themeOverrides
16. Validation contraste WCAG dans ThemeService
17. Tests customizer

Phase 3 — Polices + 10 thèmes
18. Embarquer Playfair Display, Montserrat, Caveat dans public/assets/fonts/
19. Compléter catalogue : Ski, Noël, Halloween, Pâques, Anniversaire, St Valentin, Soleil, Nature
20. Vignettes miniatures thèmes
21. Tests polices + thèmes

Phase 4 — Templates globaux
22. Modèle DocumentTemplate (coverLayout, statsLayout, stepLayout)
23. Paramétrer builders pour variantes template
24. Sélecteur template dans UI
25. Tests intégration complète
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Phase 1 — Infrastructure thèmes + 3 thèmes de base

### Fichiers créés
- `src/models/theme.types.ts` — Types TypeScript (ThemeConfig, ThemeColors, ThemeFonts, ThemeDecorations, ThemeSpacing, ThemeOverrides)
- `src/services/theme.service.ts` — Singleton ThemeService avec catalogue 3 thèmes, resolveTheme avec overrides, toCssVariables, buildThemeStyleBlock
- `src/components/editor/ThemeSelector.vue` — Grille de cartes avec gradient preview, état actif surligné
- `tests/services/theme.service.spec.ts` — 20 tests unitaires

### Fichiers modifiés
- `public/assets/style.css` — Migration complète vers CSS custom properties (--theme-*), rétrocompatibilité via aliases (--dark-1, --grey-23, etc.)
- `src/services/generate.service.ts` — Injection <style id="theme-overrides"> dans buildHtmlHead(), fix ordre CSS dans buildSingleFileHtml() (theme-overrides en dernier dans <head>)
- `src/stores/editor.store.ts` — Nouveaux state (selectedThemeId, themeOverrides), actions (setTheme, setThemeOverrides, resetThemeOverrides), invalidation step previews, injection thème dans buildStepPreviewDocument()
- `src/models/draft.types.ts` — Ajout themeId/themeOverrides optionnels dans DraftSnapshot
- `src/services/draft-storage.service.ts` — Persistance thème dans IndexedDB
- `src/composables/useEditorGeneration.ts` — Propagation themeId/themeOverrides dans GenerateOptions
- `src/views/EditorView.vue` — Remplacement placeholder par <ThemeSelector />

### Bugs corrigés
- Fix ordre CSS : theme-overrides était placé AVANT le CSS inliné dans buildSingleFileHtml(), causant un override par les valeurs :root par défaut. Corrigé par extraction et ré-injection en fin de <head>.
- Fix step preview : buildStepPreviewDocument() n'injectait pas le bloc thème. Ajout des paramètres themeId/themeOverrides.
- Fix invalidation : invalidatePreview() ne vidait pas previewHtmlByStep. Ajout du clear + regenerateStepPreview() explicite dans les setters de thème.

### Vérification visuelle
- Dialog preview : testé Classique/Montagne/Vacances — couleurs CSS variables correctement résolues
- Inline step preview : testé switching 3 thèmes — <style id="theme-overrides"> mis à jour dans l'iframe à chaque changement

### Tests
- 319 tests passent (20 nouveaux + 299 existants)
- 0 erreurs TypeScript (hors faux positifs .vue habituels)

## Phase 2 — Personnalisation complète

### Fichiers créés
- `src/components/editor/ThemeCustomizer.vue` — Panneau personnalisation avec accordéons (Couleurs, Décorations, Espacements, Accessibilité)
- `src/components/editor/theme/ColorField.vue` — Color picker natif + input texte hex
- `src/components/editor/theme/SliderField.vue` — Slider range avec affichage valeur/unité

### Fichiers modifiés
- `src/models/theme.types.ts` — Ajout interface ContrastCheck
- `src/services/theme.service.ts` — Ajout méthodes WCAG : parseColor(), relativeLuminance(), contrastRatio(), wcagLevel(), checkThemeContrasts()
- `src/views/EditorView.vue` — Intégration ThemeCustomizer sous ThemeSelector dans onglet Thèmes
- `tests/services/theme.service.spec.ts` — 20 tests supplémentaires (parseColor, luminance, contraste, wcagLevel, checkThemeContrasts)

### Fonctionnalités
- 7 color pickers avec aperçu visuel et saisie hex
- Sliders pour borderRadius, coverOverlayOpacity, contentPadding, photoGap, sectionGap
- Selects pour borderStyle et separatorStyle
- Debounce 300ms sur les overrides avant régénération preview
- Section Accessibilité WCAG avec 5 paires de contraste, ratio, badges AAA/AA/FAIL
- Bouton Réinitialiser conditionnel (visible uniquement si overrides actifs)

### Tests
- 339 tests passent (40 theme.service + 299 existants)
<!-- SECTION:NOTES:END -->
