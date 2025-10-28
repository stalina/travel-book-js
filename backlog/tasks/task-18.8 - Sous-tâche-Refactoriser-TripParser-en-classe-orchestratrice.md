---
id: task-18.8
title: 'Sous-tâche: Refactoriser TripParser en classe orchestratrice'
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 21:05'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyser parse.service.ts actuel (fonction parseTrip)
2. Créer classe TripParser avec constructeur(fileSystemService)
3. Créer méthode publique async parse(input)
4. Créer méthodes privées: loadTripJson, mapToTrip, loadStepPhotos, saveToWindow
5. Export singleton tripParser
6. Migrer trip.store.ts vers le singleton
7. Tests: créer parse.service.spec.ts avec mocks FileSystemService
8. Vérifier que tous les tests passent
<!-- SECTION:PLAN:END -->
