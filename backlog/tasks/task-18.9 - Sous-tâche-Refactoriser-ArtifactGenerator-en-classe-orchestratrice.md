---
id: task-18.9
title: 'Sous-tâche: Refactoriser ArtifactGenerator en classe orchestratrice'
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
Transformer generate.service.ts en classe ArtifactGenerator qui orchestre tous les builders
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Classe ArtifactGenerator créée avec injection loggerService, elevationService
- [ ] #2 Méthode publique generate(input, options)
- [ ] #3 Méthodes privées: loadTripData, processPhotos, buildArtifacts
- [ ] #4 Utilisation des builders via new CoverBuilder(...).build()
- [ ] #5 Export singleton artifactGenerator + fonction wrapper rétrocompatible
- [ ] #6 Tests adaptés
<!-- AC:END -->
