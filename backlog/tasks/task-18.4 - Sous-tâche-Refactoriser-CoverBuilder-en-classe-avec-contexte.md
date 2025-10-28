---
id: task-18.4
title: 'Sous-tâche: Refactoriser CoverBuilder en classe avec contexte'
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 20:03'
labels:
  - refactoring
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Transformer cover.builder.ts en classe CoverBuilder avec trip/photos injectés via constructeur
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Classe CoverBuilder créée avec constructeur(trip, photosMapping, photoDataUrlMap)
- [ ] #2 Méthode publique build() retourne HTML
- [ ] #3 Méthodes privées: extractYear, selectCoverPhoto, generateHtml
- [ ] #4 Migrations vers new CoverBuilder(...).build()
- [ ] #5 Tests adaptés pour instanciation de classe
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyser la structure actuelle de cover.builder.ts (fonction buildCoverSection + type CoverBuilderContext)
2. Créer la classe CoverBuilder avec constructeur acceptant trip, photosMapping, photoDataUrlMap en readonly private
3. Extraire la logique en méthodes privées: extractYear(), selectCoverPhoto(), generateHtml()
4. Implémenter méthode publique build() qui orchestres ces méthodes privées
5. Ajouter JSDoc complète pour classe et méthodes publiques
6. Exporter wrapper déprécié buildCoverSection() pour compatibilité
7. Migrer les imports dans generate.service.ts vers new CoverBuilder(...).build()
8. Adapter les tests dans cover.builder.spec.ts pour instanciation de classe
9. Valider avec npm run test
<!-- SECTION:PLAN:END -->
