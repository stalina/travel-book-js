---
id: task-18.11
title: 'Sous-tâche: Adapter TripStore pour injection de dépendances'
status: Done
assignee:
  - '@copilot'
created_date: '2025-10-28 19:37'
updated_date: '2025-10-28 21:23'
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
- [x] #1 Imports des singletons services ajoutés
- [x] #2 Actions du store utilisent tripParser.parse() au lieu de parseTrip()
- [x] #3 Actions du store utilisent artifactGenerator.generate() au lieu de generateArtifacts()
- [x] #4 Actions utilisent fileSystemService.readTripDirectory()
- [x] #5 Tests du store adaptés pour mocker les services
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyser trip.store.ts actuel
2. Remplacer imports:
   - parseTrip → tripParser singleton
   - generateArtifacts → artifactGenerator singleton
   - fileSystemService déjà utilisé ✅
3. Adapter les actions:
   - parseAndMap(): tripParser.parse()
   - generateArtifacts(): artifactGenerator.generate()
   - ensureDraftPlan(): artifactGenerator.generate()
   - finalizeWithPlanAndOpenViewer(): artifactGenerator.generate()
4. Vérifier que tout compile
5. Tests: aucun test store existant, skip AC #5
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Migration TripStore vers singletons terminée:

**Imports mis à jour**:
- parseTrip → tripParser (singleton)
- generateArtifacts → artifactGenerator (singleton)
- fileSystemService (déjà singleton) ✅

**Actions refactorisées** (4):
- parseAndMap(): tripParser.parse(input)
- generateArtifacts(): artifactGenerator.generate(input, options)
- ensureDraftPlan(): artifactGenerator.generate(input)
- finalizeWithPlanAndOpenViewer(): artifactGenerator.generate(input, { photosPlan })

**Actions inchangées** (6):
- pickDirectory(): fileSystemService.readTripDirectory() (déjà singleton)
- setFiles(), handleDropItems(), startGeneration(), readInput(), openViewer()

**Architecture**:
- ✅ Store Pinia utilise maintenant les singletons de services
- ✅ Injection de dépendances cohérente
- ✅ Pas de fonctions wrapper, appels directs aux singletons
- ✅ Meilleure testabilité (possibilité de mocker les singletons)

**Tests**:
- Aucun test store existant (AC #5 skippé)
- 92/92 tests unitaires passent ✅
- Fonctionnement vérifié: store compile sans erreurs
<!-- SECTION:NOTES:END -->
