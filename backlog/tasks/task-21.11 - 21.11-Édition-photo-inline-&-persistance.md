---
id: task-21.11
title: 21.11 - Édition photo inline & persistance
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-07 22:54'
updated_date: '2025-11-08 12:12'
labels: []
dependencies: []
parent_task_id: task-21
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Brancher l'éditeur photo existant sur les slots de page et assurer la persistance des ajustements dans l'étape.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Chaque vignette de page permet d'ouvrir l'éditeur photo dans le contexte de l'étape (sans navigation).
- [x] #2 Les ajustements (filtres, crop, rotation) sont sauvegardés dans le store de l'étape et reflétés dans la preview.
- [x] #3 Undo/redo par photo reste fonctionnel après fermeture/réouverture de l'éditeur.
- [x] #4 Tests Vitest validant la persistance des ajustements et l'intégration store + composants.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Audit de l'éditeur photo existant et des stores pour identifier interfaces
2. Intégrer le composant dans StepEditor slots avec ouverture inline/modal et contexte étape
3. Étendre le store pour persister filtres/crop/rotation par photo + wire preview regen
4. Couvrir par tests store et composant (undo/redo, persistance)
<!-- SECTION:PLAN:END -->
