---
id: task-17.4
title: Génération des vignettes d'étapes
status: Done
assignee:
  - '@copilot'
created_date: '2025-10-19 17:42'
updated_date: '2025-10-27 22:55'
labels:
  - carte
  - svg
dependencies: []
parent_task_id: task-17
ordinal: 22000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Pour chaque étape, créer une vignette ronde positionnée selon ses coordonnées GPS, contenant la miniature de sa photo principale.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Récupération de la photo principale de chaque étape (depuis photosMapping)
- [x] #2 Création d'un élément SVG <circle> ou HTML <div> rond positionné en absolu
- [x] #3 Photo affichée en background clippé circulaire
- [x] #4 Fallback : icône/couleur si aucune photo disponible
- [x] #5 Taille des vignettes adaptée (responsive ou fixe avec ratio)
- [x] #6 Z-index approprié (vignettes au-dessus du tracé)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Créer fonction generateStepMarkers() pour créer les vignettes
2. Pour chaque étape, récupérer la photo principale
3. Créer des éléments SVG <foreignObject> contenant des div circulaires
4. Positionner selon latLonToSvg()
5. Appliquer background-image avec la photo
6. Fallback icône si pas de photo
7. Intégrer dans buildMapSection()
8. Ajouter tests
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémentation complète des vignettes:
- generateStepMarkers(): crée foreignObject SVG pour vignettes HTML
- Récupération photo principale depuis photosMapping
- Background-image avec photo (data URL ou URL)
- Fallback icône 📍 si pas de photo
- Taille vignette: 40px, positionnée avec latLonToSvg()
- Tests: 3 vignettes, photo, fallback
- Tous tests passent (13/13)
<!-- SECTION:NOTES:END -->
