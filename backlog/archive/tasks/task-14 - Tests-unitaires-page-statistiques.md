---
id: task-14
title: Tests unitaires page statistiques
status: Done
assignee:
  - '@stalina'
created_date: '2025-10-12 00:04'
updated_date: '2025-10-14 08:36'
labels:
  - tests
  - stats
dependencies: []
ordinal: 15000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Étendre generate.service.spec.ts pour valider: présence .stats-page, valeurs km/jours/steps/photos, distance max approx, présence codes pays.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Test sélectionne plusieurs steps multi-pays
- [x] #2 Vérifie arrondi km
- [x] #3 Vérifie distance max > 0
- [x] #4 Vérifie nombre photos
- [x] #5 Aucun fetch réseau additionnel
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Tests actuels:
- Présence page stats après cover
- Vérification km/jours/étapes/photos
- Scenario multi-pays couvrant distance max
- Aucune requête réseau additionnelle (logs montrent aucune fetch supplémentaire)
Tous verts (5).
<!-- SECTION:NOTES:END -->
