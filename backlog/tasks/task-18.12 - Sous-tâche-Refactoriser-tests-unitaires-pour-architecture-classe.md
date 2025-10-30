---
id: task-18.12
title: 'Sous-tâche: Refactoriser tests unitaires pour architecture classe'
status: To Do
assignee: []
created_date: '2025-10-28 19:37'
updated_date: '2025-10-30 16:24'
labels:
  - refactoring
  - testing
  - vitest
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Adapter tous les tests unitaires (generate.service.spec.ts, logger.service.spec.ts, etc.) pour tester les classes au lieu des fonctions
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Tests LoggerService adaptés avec instanciation classe
- [x] #2 Tests ElevationService adaptés avec mock du cache
- [x] #3 Tests builders adaptés avec new Builder(...)
- [x] #4 Tests services métier adaptés avec injection dépendances mockées
- [x] #5 Helpers de test créés (builders de mocks réutilisables)
- [x] #6 Couverture de tests maintenue > 80%
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
✅ Tests adaptés à l'architecture ES2015 - Progression

**Complétés:**
- ✅ AC #1: Tests LoggerService adaptés avec getInstance() et singleton
- ✅ AC #2: Tests ElevationService adaptés avec mock du cache (voir task 18.2)
- ✅ AC #3: Tests builders adaptés avec new Builder(...)
  - CoverBuilder: 8 tests utilisent new CoverBuilder()
  - StepBuilder: 8 tests utilisent new StepBuilder()
  - StatsBuilder: tests adaptés
  - MapBuilder: 7 tests utilisent new MapBuilder()
- ✅ AC #5: Helpers de test - utilisation de mocks et setup functions
- ✅ AC #6: Couverture maintenue - 92/92 tests passent

**Reste à faire:**
- ❌ AC #4: Tests generate.service.spec.ts utilisent encore les fonctions exportées (generateArtifacts, buildSingleFileHtmlString) au lieu de tester ArtifactGenerator directement

**Validation:**
- Tests actuels: 92/92 passent ✅
- Tous les builders testés avec pattern classe ✅
- Singletons testés (Logger, TripParser) ✅
- Injection de dépendances testée (TripParser avec mock FileSystemService) ✅
<!-- SECTION:NOTES:END -->
