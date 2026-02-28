---
id: TASK-39
title: Masquer une étape de l'album via icône de visibilité
status: Done
assignee:
  - '@copilot'
created_date: '2026-02-28 14:05'
updated_date: '2026-02-28 14:33'
labels:
  - editor
  - feature
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permettre à l'utilisateur de masquer/afficher une étape et son contenu pour l'exclure de l'album généré, depuis la liste des étapes dans la sidebar de l'éditeur.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Une icône œil/œil-barré est affichée dans chaque StepItem de la liste
- [x] #2 Cliquer sur l'icône bascule l'état visible/masqué de l'étape sans sélectionner l'étape
- [x] #3 Une étape masquée est visuellement distinguée (opacité réduite, titre barré ou badge)
- [x] #4 Les étapes masquées sont exclues de l'HTML généré dans ArtifactGenerator
- [x] #5 L'état de visibilité des étapes est persisté dans le DraftSnapshot et restauré à la reprise
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Ajouter hiddenStepIds (Set<number>) dans editor.store.ts + action toggleStepVisibility
2. Ajouter hiddenStepIds?: number[] dans DraftSnapshot pour persistance
3. Modifier StepItem.vue : icône œil avec prop isHidden + emit toggle-visibility
4. Modifier StepList.vue : passer isHidden et gérer toggle-visibility
5. Modifier generate.service.ts : filtrer les étapes masquées (option hiddenStepIds)
6. Connecter useGeneration.ts pour passer hiddenStepIds depuis le store
7. Mettre à jour la sauvegarde/restauration du brouillon
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémentation de la fonctionnalité masquage d'étapes en 7 fichiers.

- `src/models/draft.types.ts` : ajout de `hiddenStepIds?: number[]` dans `DraftSnapshot`
- `src/services/draft-storage.service.ts` : sérialisation/restauration du Set via `Array.from()`
- `src/stores/editor.store.ts` : état `hiddenStepIds` (ref<Set<number>>), actions `toggleStepVisibility()` et `isStepHidden()`, persistance et restauration
- `src/components/editor/StepItem.vue` : prop `isHidden`, emit `toggle-visibility`, icône SVG œil/œil-barré, styles `.hidden` (opacité 45%, bordure pointillée, titre barré)
- `src/components/editor/StepList.vue` : câblage prop/event vers le store
- `src/services/generate.service.ts` : option `hiddenStepIds?: Set<number>` dans `GenerateOptions`, filtrage des étapes avant génération des pages (`CoverBuilder`, `StatsBuilder`, `MapBuilder` et pages d'étapes utilisent le trip filtré)
- `src/composables/useEditorGeneration.ts` : passage de `hiddenStepIds` depuis le store

Vérification Playwright avec le dataset Tour de France Fictif (10 étapes) :
- UI : icônes œil visibles sur chaque étape, état masqué visuellement correct
- Toggle : bascule fonctionne sans sélectionner l'étape
- Génération HTML : Lyon (id:7) et Marseille (id:10) masqués → 0 occurrences dans l'HTML ; Nice, Paris, Reims visibles → présents. 302 tests unitaires passent sans régression.
<!-- SECTION:NOTES:END -->
