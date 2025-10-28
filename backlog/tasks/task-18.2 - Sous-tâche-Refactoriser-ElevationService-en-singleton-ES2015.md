---
id: task-18.2
title: 'Sous-tâche: Refactoriser ElevationService en singleton ES2015'
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 19:51'
labels:
  - refactoring
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Transformer elevation.service.ts en classe singleton avec cache et queue comme propriétés de classe
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Classe ElevationService créée avec cache Map en propriété
- [ ] #2 Méthodes publiques: getElevation, getElevationsBulk
- [ ] #3 Méthodes privées: normalizeKey, processQueue, fetchBatch
- [ ] #4 Pattern singleton implémenté
- [ ] #5 Tests unitaires adaptés
<!-- AC:END -->
