---
id: task-9
title: Tests et validation de la couverture
status: Done
assignee: []
created_date: '2025-10-11 23:24'
updated_date: '2025-10-11 23:30'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Créer ou adapter des tests Vitest pour vérifier la génération de la page de couverture dans le HTML final.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Test charge un trip mock avec cover_photo et vérifie présence des classes cover-page
- [x] #2 Test fallback sans cover_photo: utilise première photo d'étape
- [x] #3 Test sans aucune photo: fond de secours présent
- [x] #4 Test présence année et titre
- [x] #5 Tests passent via npm test
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Tests ajoutés dans generate.service.spec.ts (année, titre, cover_photo, fallback).
<!-- SECTION:NOTES:END -->
