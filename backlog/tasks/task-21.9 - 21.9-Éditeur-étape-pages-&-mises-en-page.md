---
id: task-21.9
title: '21.9 - Éditeur étape : pages & mises en page'
status: Done
assignee:
  - '@agent-k'
created_date: '2025-11-07 22:53'
updated_date: '2025-11-08 08:39'
labels: []
dependencies: []
parent_task_id: task-21
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter la gestion multi-page directement dans l'éditeur d'étape avec choix d'un layout parmi les 4 gabarits existants.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Barre de navigation des pages avec ajout, suppression, réorganisation et sélection de la page active.
- [x] #2 Chaque page expose la liste des layouts disponibles avec aperçu miniature et application immédiate.
- [x] #3 Les métadonnées des pages sont persistées dans le store et reflétées dans la prévisualisation.
- [x] #4 Tests Vitest sur le store pages/layouts et la barre de navigation.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Étendre le store éditeur (types, actions) pour gérer les pages par étape : ajout/suppression/ordre/layout et synchronisation preview.
2. Implémenter les composants UI (navigation des pages + sélecteur de layout) et les intégrer dans StepEditor avec interactions store.
3. Adapter StepBuilder/preview pour interpréter les layouts choisis et rendre les pages correspondantes.
4. Couvrir par des tests Vitest : logique du store pages/layouts et barre de navigation/layout picker.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Extended Pinia editor store with per-page state (layout, photo selection, cover) and wired preview regeneration on mutations.
- Updated StepBuilder to consume the persisted plan and render the selected layouts, including fallback handling.
- Added full StepEditor UI for page navigation, layout picker, photo toggles & cover selection with matching styles.
- Covered store, builder and StepEditor flows with Vitest suites; ran full test suite and typecheck.
<!-- SECTION:NOTES:END -->
