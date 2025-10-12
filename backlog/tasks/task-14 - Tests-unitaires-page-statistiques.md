---
id: task-14
title: Tests unitaires page statistiques
status: In Progress
assignee:
  - '@stalina'
created_date: '2025-10-12 00:04'
updated_date: '2025-10-12 17:52'
labels:
  - tests
  - stats
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Étendre generate.service.spec.ts pour valider: présence .stats-page, valeurs km/jours/steps/photos, distance max approx, présence codes pays.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Test sélectionne plusieurs steps multi-pays
- [ ] #2 Vérifie arrondi km
- [ ] #3 Vérifie distance max > 0
- [ ] #4 Vérifie nombre photos
- [ ] #5 Aucun fetch réseau additionnel
<!-- AC:END -->
