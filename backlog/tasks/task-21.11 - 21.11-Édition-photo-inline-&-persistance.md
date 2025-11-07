---
id: task-21.11
title: 21.11 - Édition photo inline & persistance
status: To Do
assignee: []
created_date: '2025-11-07 22:54'
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
- [ ] #1 Chaque vignette de page permet d'ouvrir l'éditeur photo dans le contexte de l'étape (sans navigation).
- [ ] #2 Les ajustements (filtres, crop, rotation) sont sauvegardés dans le store de l'étape et reflétés dans la preview.
- [ ] #3 Undo/redo par photo reste fonctionnel après fermeture/réouverture de l'éditeur.
- [ ] #4 Tests Vitest validant la persistance des ajustements et l'intégration store + composants.
<!-- AC:END -->
