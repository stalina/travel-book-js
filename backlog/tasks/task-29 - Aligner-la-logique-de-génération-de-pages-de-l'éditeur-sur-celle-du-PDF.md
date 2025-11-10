---
id: task-29
title: Aligner la logique de génération de pages de l'éditeur sur celle du PDF
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-10 10:44'
updated_date: '2025-11-10 10:48'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
L'éditeur génère actuellement une page full-page par photo lors du chargement initial. Le PDF utilise un algorithme sophistiqué (buildAutomaticPages) qui optimise les layouts selon les ratios des photos. Il faut réutiliser cette même logique dans l'éditeur.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 L'éditeur utilise la même logique buildAutomaticPages que StepBuilder
- [x] #2 Les pages proposées dans l'éditeur correspondent exactement à celles du PDF généré
- [x] #3 La logique est centralisée pour éviter la duplication de code
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Extraire buildAutomaticPages de StepBuilder vers un utilitaire partagé
2. Adapter l'utilitaire pour fonctionner avec EditorPhoto au lieu de PhotoWithMeta
3. Remplacer la logique simple de populateDefaultPagesForStep par l'algorithme automatique
4. Vérifier que les tests existants passent et en ajouter si nécessaire
5. Tester avec le voyage Slovénie pour vérifier la correspondance
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Problème identifié et corrigé:

- **Cause racine**: `populateDefaultPagesForStep()` créait une page full-page par photo, alors que le PDF utilise `buildAutomaticPages()` qui optimise les layouts selon les ratios (PORTRAIT/LANDSCAPE)

- **Solution**: Création d'un utilitaire partagé `layout-generator.ts` exportant `generateAutomaticPages()` et `inferLayoutFromCount()`

- **Modifications**:
  1. Nouveau fichier `src/utils/layout-generator.ts` avec la logique automatique centralisée
  2. Adaptation de `StepBuilder.buildAutomaticPages()` pour utiliser l'utilitaire
  3. Modification de `editor.store.ts` pour utiliser `generateAutomaticPages()` dans `populateDefaultPagesForStep()`

- **Tests**: Tous les tests passent (187 tests)

**Résultat**: L'éditeur génère maintenant exactement les mêmes layouts que le PDF, évitant le décalage constaté (ex: 19 pages full-page au lieu de quelques pages optimisées pour "C'est la fête à la grenouille !!")
<!-- SECTION:NOTES:END -->
