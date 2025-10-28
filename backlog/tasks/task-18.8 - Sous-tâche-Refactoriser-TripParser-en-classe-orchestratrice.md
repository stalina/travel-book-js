---
id: task-18.8
title: 'Sous-tâche: Refactoriser TripParser en classe orchestratrice'
status: To Do
assignee: []
created_date: '2025-10-28 19:36'
labels:
  - refactoring
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Transformer parse.service.ts en classe TripParser avec injection FileSystemService
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Classe TripParser créée avec constructeur(fileSystemService)
- [ ] #2 Méthode publique parse(input)
- [ ] #3 Méthodes privées: loadTripJson, mapToTrip, loadStepPhotos, saveToWindow
- [ ] #4 Export singleton tripParser
- [ ] #5 Migrations et tests adaptés
<!-- AC:END -->
