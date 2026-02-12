---
id: task-17.7
title: Tests unitaires de la page carte
status: Done
assignee:
  - '@copilot'
created_date: '2025-10-19 17:46'
updated_date: '2025-10-27 22:55'
labels:
  - carte
  - tests
dependencies: []
parent_task_id: task-17
ordinal: 19000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter des tests dans generate.service.spec.ts pour valider la génération de la page carte.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Test : présence de .map-page après .stats-page
- [x] #2 Test : nombre de vignettes = nombre d'étapes
- [x] #3 Test : path contient les commandes M/L appropriées
- [x] #4 Test : coordonnées dans les limites du viewBox
- [x] #5 Test : fallback si absence de photo pour une étape
- [x] #6 Tous les tests passent (npm test)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Tests unitaires complets pour la page carte:
✓ Présence .map-page après .stats-page
✓ Nombre vignettes = nombre étapes (3)
✓ Path contient M/L (tracé)
✓ Coordonnées dans viewBox (foreignObject x/y)
✓ Fallback icône si absence photo
✓ ViewBox SVG correct
✓ Cas 1 étape (pas de path)
✓ Photo dans vignette (data URL)
Tous tests passent: 15/15 ✓
<!-- SECTION:NOTES:END -->
