---
id: task-18.2
title: 'Sous-tâche: Refactoriser ElevationService en singleton ES2015'
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 19:54'
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
- [x] #1 Classe ElevationService créée avec cache Map en propriété
- [x] #2 Méthodes publiques: getElevation, getElevationsBulk
- [x] #3 Méthodes privées: normalizeKey, processQueue, fetchBatch
- [x] #4 Pattern singleton implémenté
- [x] #5 Tests unitaires adaptés
<!-- AC:END -->
