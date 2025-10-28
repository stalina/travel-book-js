---
id: task-18.2
title: 'Sous-tâche: Refactoriser ElevationService en singleton ES2015'
status: Done
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 19:55'
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
✅ Refactorisation d'ElevationService terminée avec succès

**Changements effectués:**
- Classe ElevationService créée avec pattern Singleton ES2015
- Cache Map encapsulé comme propriété privée de classe
- Queue et pendingByKey encapsulés comme propriétés privées
- Méthodes publiques: getElevation(), getElevationsBulk()
- Méthodes privées: normalizeKey(), processQueue(), fetchBatch()
- Visibilité explicite (public/private) sur toutes les méthodes
- JSDoc complet pour chaque méthode publique
- Logs de debug ajoutés via loggerService

**Migrations effectuées:**
- generate.service.ts: migration vers elevationService.getElevationsBulk()
- step.builder.ts: migration vers elevationService.getElevation()
- tests/builders/step.builder.spec.ts: mocks adaptés pour elevationService

**Validation:**
- ✅ Tous les tests passent (83/83)
- ✅ Aucune erreur de compilation
- ✅ Wrappers rétrocompatibles disponibles (getElevation, getElevationsBulk - deprecated)
<!-- SECTION:NOTES:END -->
