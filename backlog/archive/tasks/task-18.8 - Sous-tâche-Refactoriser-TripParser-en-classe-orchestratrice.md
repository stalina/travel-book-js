---
id: task-18.8
title: 'Sous-tâche: Refactoriser TripParser en classe orchestratrice'
status: Done
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 21:07'
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
- [x] #1 Classe TripParser créée avec constructeur(fileSystemService)
- [x] #2 Méthode publique parse(input)
- [x] #3 Méthodes privées: loadTripJson, mapToTrip, loadStepPhotos, saveToWindow
- [x] #4 Export singleton tripParser
- [x] #5 Migrations et tests adaptés
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Refactorisation TripParser terminée avec succès:

**Classe créée** (Orchestrator):
- Constructor(fileSystemService: FileSystemService)
- Singleton pattern avec getInstance()
- private readonly pour injection de dépendance

**Méthode publique**:
- async parse(input: FFInput): Promise<void>
- Logs avec loggerService (debug, error)
- Gestion erreurs avec try/catch

**Méthodes privées**:
- loadTripJson(): charge et parse trip.json
- mapToTrip(): transforme JSON brut en objet Trip typé
- loadStepPhotos(): charge toutes les photos par étape
- saveToWindow(): stocke dans window.__parsedTrip

**Export**:
- Singleton tripParser exporté
- Wrapper parseTrip() pour rétrocompatibilité

**Tests créés**:
- parse.service.spec.ts avec 8 tests
- Mock FileSystemService pour isolation
- Tests: parsing réussi, mapping étapes, chargement photos, gestion erreurs, null values, singleton

**Résultats**: 92/92 tests passent ✅ (+8 nouveaux tests)
<!-- SECTION:NOTES:END -->
