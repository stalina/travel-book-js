---
id: task-18.4
title: 'Sous-tâche: Refactoriser CoverBuilder en classe avec contexte'
status: Done
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 20:06'
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
- [x] #1 Classe CoverBuilder créée avec constructeur(trip, photosMapping, photoDataUrlMap)
- [x] #2 Méthode publique build() retourne HTML
- [x] #3 Méthodes privées: extractYear, selectCoverPhoto, generateHtml
- [x] #4 Migrations vers new CoverBuilder(...).build()
- [x] #5 Tests adaptés pour instanciation de classe
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
CoverBuilder refactorisé en classe avec contexte injecté via constructeur.

Transformations effectuées:
- Création de la classe CoverBuilder avec constructeur(trip, photosMapping, photoDataUrlMap) en readonly private
- Méthode publique build() retourne le HTML complet
- 3 méthodes privées pour décomposer la logique:
  * extractYear(): extrait l'année du voyage
  * selectCoverPhoto(): sélectionne la photo de couverture selon la priorité définie
  * generateHtml(year, coverUrl): génère le HTML final
- Documentation JSDoc complète pour la classe et toutes les méthodes publiques
- Export du wrapper déprécié buildCoverSection() pour compatibilité
- Conservation du type CoverBuilderContext (déprécié)

Migrations:
- generate.service.ts: import CoverBuilder, usage new CoverBuilder(...).build()
- cover.builder.spec.ts: tous les tests adaptés pour instanciation de classe

Résultats:
- 0 erreurs de compilation TypeScript
- 83/83 tests unitaires passent (Vitest)
- Pattern Builder avec contexte appliqué comme défini dans le guide
- Code plus modulaire et testable avec méthodes privées
<!-- SECTION:NOTES:END -->
