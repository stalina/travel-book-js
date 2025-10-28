---
id: task-18.12
title: 'Sous-tâche: Refactoriser tests unitaires pour architecture classe'
status: To Do
assignee: []
created_date: '2025-10-28 19:37'
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
- [ ] #1 Tests LoggerService adaptés avec instanciation classe
- [ ] #2 Tests ElevationService adaptés avec mock du cache
- [ ] #3 Tests builders adaptés avec new Builder(...)
- [ ] #4 Tests services métier adaptés avec injection dépendances mockées
- [ ] #5 Helpers de test créés (builders de mocks réutilisables)
- [ ] #6 Couverture de tests maintenue > 80%
<!-- AC:END -->
