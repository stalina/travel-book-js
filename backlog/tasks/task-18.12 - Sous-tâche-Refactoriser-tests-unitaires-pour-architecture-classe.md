---
id: task-18.12
title: 'Sous-tâche: Refactoriser tests unitaires pour architecture classe'
status: To Do
assignee: []
created_date: '2025-10-28 19:37'
updated_date: '2025-10-30 16:20'
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
- [ ] #4 Tests services métier adaptés avec injection dépendances mockées
- [x] #5 Helpers de test créés (builders de mocks réutilisables)
- [x] #6 Couverture de tests maintenue > 80%
<!-- AC:END -->
