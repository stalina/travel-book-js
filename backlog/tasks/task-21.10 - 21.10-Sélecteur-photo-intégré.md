---
id: task-21.10
title: 21.10 - Sélecteur photo intégré
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-07 22:53'
updated_date: '2025-11-08 08:49'
labels: []
dependencies: []
parent_task_id: task-21
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Remplacer la modale séparée par un sélecteur de photos intégré à chaque slot de page, avec filtrage et upload.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Chaque slot photo propose un panel latéral de sélection listant les photos de l'étape avec recherche et filtres basiques.
- [ ] #2 Possibilité d'uploader une nouvelle image depuis le slot et de l'associer à l'étape.
- [ ] #3 Les photos sélectionnées s'affichent immédiatement dans la page et dans la preview.
- [ ] #4 Tests Vitest sur le sélecteur (composable/store) et scénarios de remplissage de slots.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Étudier maquettes & StepEditor pour définir UX du sélecteur intégré.
2. Créer composable/store photo selector (filtres, recherche, upload) et brancher au store éditeur.
3. Remplacer PhotoGrid placeholders par slots interactifs avec panel latéral.
4. Relier à preview regeneration et couvrir avec tests store/composant.
<!-- SECTION:PLAN:END -->
