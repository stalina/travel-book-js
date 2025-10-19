---
id: task-17.7
title: Tests unitaires de la page carte
status: To Do
assignee: []
created_date: '2025-10-19 17:46'
labels:
  - carte
  - tests
dependencies: []
parent_task_id: task-17
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter des tests dans generate.service.spec.ts pour valider la génération de la page carte.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Test : présence de .map-page après .stats-page
- [ ] #2 Test : nombre de vignettes = nombre d'étapes
- [ ] #3 Test : path contient les commandes M/L appropriées
- [ ] #4 Test : coordonnées dans les limites du viewBox
- [ ] #5 Test : fallback si absence de photo pour une étape
- [ ] #6 Tous les tests passent (npm test)
<!-- AC:END -->
