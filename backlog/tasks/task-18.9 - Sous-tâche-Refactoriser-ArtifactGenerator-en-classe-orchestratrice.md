---
id: task-18.9
title: 'Sous-tâche: Refactoriser ArtifactGenerator en classe orchestratrice'
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 21:12'
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
- [x] #1 Classe ArtifactGenerator créée avec injection loggerService, elevationService
- [x] #2 Méthode publique generate(input, options)
- [x] #3 Méthodes privées: loadTripData, processPhotos, buildArtifacts
- [x] #4 Utilisation des builders via new CoverBuilder(...).build()
- [x] #5 Export singleton artifactGenerator + fonction wrapper rétrocompatible
- [x] #6 Tests adaptés
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyser generate.service.ts actuel (433 lignes)
2. Identifier les sections logiques à extraire en méthodes privées
3. Créer classe ArtifactGenerator avec constructeur(elevationService, loggerService)
4. Créer méthode publique async generate(input, options)
5. Extraire méthodes privées:
   - loadAssets(): CSS, fonts
   - processPhotos(): mapping, ratios, data URLs
   - generatePhotosPlan(): photos_by_pages.txt logic
   - buildHtmlHead(): head section
   - buildHtmlBody(): orchestration builders
   - buildSingleFileHtml(): final assembly
6. Migrer utilisation des builders (déjà fait pour Stats, Map, Step - reste Cover)
7. Export singleton + wrapper rétrocompatible
8. Vérifier que les tests passent (generate.service.spec.ts existe déjà avec 16 tests)
<!-- SECTION:PLAN:END -->
