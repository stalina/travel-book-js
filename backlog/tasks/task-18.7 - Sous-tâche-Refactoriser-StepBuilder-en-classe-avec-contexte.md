---
id: task-18.7
title: 'Sous-tâche: Refactoriser StepBuilder en classe avec contexte'
status: Done
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 21:03'
labels:
  - refactoring
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Transformer step.builder.ts en classe StepBuilder pour génération HTML des étapes
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Classe StepBuilder créée
- [x] #2 Méthode publique build()
- [x] #3 Méthodes privées pour layout photos et HTML
- [x] #4 Migrations effectuées
- [x] #5 Tests adaptés
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Refactorisation StepBuilder terminée avec succès:

**Classe créée** (14 méthodes):
- Constructor(trip, step, photosMapping, photoDataUrlMap, stepPlan?)
- public async build(): Promise<string>
- 13 méthodes privées: planLayout, calculateMapDotPosition, buildStepInfo, calculateTripPercentage, calculateDayNumber, ccToEmoji, resolvedPhotoUrl, buildCoverPageWithPhoto, buildCoverPageWithoutPhoto, buildPhotoPage, buildOneOrTwoPhotosPage, buildThreeOrFourPhotosPage

**Migrations effectuées**:
- generate.service.ts: utilise maintenant `new StepBuilder(...).build()`
- Wrapper buildStepSection() conservé pour rétrocompatibilité

**Tests adaptés**:
- Tous les tests convertis pour utiliser directement la classe StepBuilder
- Pattern: `const builder = new StepBuilder(trip, step, photosMapping, photoDataUrlMap, stepPlan?); const html = await builder.build()`
- Imports nettoyés (suppression de buildStepSection et StepBuilderContext)

**Résultats**: 84/84 tests passent ✅
<!-- SECTION:NOTES:END -->
