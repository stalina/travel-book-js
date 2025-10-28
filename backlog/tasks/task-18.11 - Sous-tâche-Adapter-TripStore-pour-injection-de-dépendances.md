---
id: task-18.11
title: 'Sous-tâche: Adapter TripStore pour injection de dépendances'
status: To Do
assignee: []
created_date: '2025-10-28 19:37'
labels:
  - refactoring
  - pinia
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modifier trip.store.ts pour utiliser les singletons de services (tripParser, artifactGenerator, fileSystemService)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Imports des singletons services ajoutés
- [ ] #2 Actions du store utilisent tripParser.parse() au lieu de parseTrip()
- [ ] #3 Actions du store utilisent artifactGenerator.generate() au lieu de generateArtifacts()
- [ ] #4 Actions utilisent fileSystemService.readTripDirectory()
- [ ] #5 Tests du store adaptés pour mocker les services
<!-- AC:END -->
