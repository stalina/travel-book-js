---
id: task-18.5
title: 'Sous-tâche: Refactoriser StatsBuilder en classe avec contexte'
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 20:34'
labels:
  - refactoring
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Transformer stats.builder.ts en classe StatsBuilder avec injection trip/photosMapping
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Classe StatsBuilder créée avec constructeur
- [x] #2 Méthode publique build() retourne HTML stats
- [x] #3 Méthodes privées pour calculs (haversine, pays, métriques)
- [x] #4 Migrations effectuées
- [x] #5 Tests adaptés
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyser la structure actuelle de stats.builder.ts (fonction buildStatsSection + haversineKm)
2. Créer la classe StatsBuilder avec constructeur acceptant trip, photosMapping en readonly private
3. Extraire la logique en méthodes privées:
   * calculateTotalKilometers(): calcul des km avec Haversine
   * extractUniqueCountries(): pays uniques dans l'ordre d'apparition
   * calculateTotalPhotos(): compte total de photos
   * calculateDays(): calcul nombre de jours
   * findFarthestPoint(): point le plus éloigné du départ
   * generateHtml(): génère le HTML final
4. Implémenter méthode publique build() qui orchestre ces méthodes privées
5. Ajouter JSDoc complète pour classe et méthodes publiques
6. Garder haversineKm() comme fonction utilitaire exportée (réutilisable)
7. Exporter wrapper déprécié buildStatsSection() pour compatibilité
8. Migrer les imports dans generate.service.ts vers new StatsBuilder(...).build()
9. Adapter les tests dans stats.builder.spec.ts pour instanciation de classe
10. Valider avec npm run test
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Refactorisation terminée avec succès :
- Classe StatsBuilder créée avec constructor(trip, photosMapping)
- Méthode publique build() implémentée
- 6 méthodes privées extraites : calculateTotalKilometers(), extractUniqueCountries(), calculateTotalPhotos(), calculateDays(), findFarthestPoint(), generateHtml()
- haversineKm() conservée comme fonction utilitaire réutilisable
- Migration effectuée dans generate.service.ts : new StatsBuilder(trip, photosMapping).build()
- Tests adaptés pour la classe (17 tests passent)
- Fonction buildStatsSection() deprecated exportée pour rétrocompatibilité
- Tous les tests passent (85/85)
<!-- SECTION:NOTES:END -->
