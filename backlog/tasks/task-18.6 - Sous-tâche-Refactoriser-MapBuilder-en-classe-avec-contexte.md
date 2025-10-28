---
id: task-18.6
title: 'Sous-tâche: Refactoriser MapBuilder en classe avec contexte'
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 20:51'
labels:
  - refactoring
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Transformer map.builder.ts en classe MapBuilder avec méthodes projection/tracé SVG
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Classe MapBuilder créée
- [x] #2 Méthodes publiques: build()
- [x] #3 Méthodes privées: calculateBoundingBox, calculateViewBox, latLonToSvg, generatePathData, generateStepMarkers
- [x] #4 Migrations effectuées
- [x] #5 Tests adaptés
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
# Refactorisation MapBuilder terminée

## Changements effectués

### Structure de la classe
- Classe MapBuilder avec injection de dépendances (trip, photosMapping, photoDataUrlMap)
- Propriétés privées readonly pour l'immutabilité
- Méthode publique async build() retournant Promise<string>

### Méthodes privées implémentées
1. calculateBoundingBox(): BBox | null - Calcule l'enveloppe géographique
2. calculateViewBox(bbox, padding): ViewBox - Génère viewBox SVG avec padding
3. latLonToSvg(lat, lon, viewBox): SvgCoord - Projection GPS → SVG
4. generatePathData(viewBox): string - Génère le tracé M/L (vide si 1 étape)
5. generateStepMarkers(viewBox): string - Génère les vignettes foreignObject
6. async fetchTilesForBbox(bbox): Promise<{tiles, adjustedViewBox}> - Récupère tuiles ArcGIS
7. generateBackground(tiles, bbox, viewBox): string - Fond satellite ou fallback

### Migrations
- generate.service.ts : Utilise new MapBuilder(...).build() au lieu de buildMapSection()
- Fonction buildMapSection() conservée (deprecated) comme wrapper pour rétrocompatibilité

### Tests
- map.builder.spec.ts refactorisé pour tester la classe MapBuilder
- 9 tests de classe + 2 tests de rétrocompatibilité
- Résultats : 83/84 tests passent (1 test infrastructure réseau échoue)

## Détails techniques

### Format du path SVG
- Coordonnées séparées par espaces (pas virgules) : M 123.45 678.90 L
- Comportement spécial : path vide si une seule étape

### Gestion des photos
- photosMapping : Record<number, Record<number, any>> (stepId → photos)
- Extraction photo principale : Object.values(stepMapping)[0]
- Fallback icône 📍 si pas de photo

### Tuiles satellite
- Serveur : ArcGIS World_Imagery
- Calcul zoom automatique selon span géographique
- Max 9 tuiles pour limiter la charge
- Fallback dégradé stylisé si échec fetch

## Fichiers modifiés
- src/services/builders/map.builder.ts (refactorisé en classe)
- src/services/generate.service.ts (migration MapBuilder)
- tests/builders/map.builder.spec.ts (tests adaptés)

## Performance
- Méthode async build() pour tuiles satellite non-bloquante
- Préservation des optimisations existantes (viewBox ajusté, padding)

## Compatibilité
- Type MapBuilderContext exporté pour usage externe
- buildMapSection() deprecated mais fonctionnel (délègue à MapBuilder)
<!-- SECTION:NOTES:END -->
