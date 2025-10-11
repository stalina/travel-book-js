---
id: task-9
title: Tests et validation de la couverture
status: To Do
assignee: []
created_date: '2025-10-11 23:24'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Créer ou adapter des tests Vitest pour vérifier la génération de la page de couverture dans le HTML final.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Test charge un trip mock avec cover_photo et vérifie présence des classes cover-page
- [ ] #2 Test fallback sans cover_photo: utilise première photo d'étape
- [ ] #3 Test sans aucune photo: fond de secours présent
- [ ] #4 Test présence année et titre
- [ ] #5 Tests passent via npm test
<!-- AC:END -->
