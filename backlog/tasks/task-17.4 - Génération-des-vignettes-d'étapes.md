---
id: task-17.4
title: Génération des vignettes d'étapes
status: To Do
assignee: []
created_date: '2025-10-19 17:42'
labels:
  - carte
  - svg
dependencies: []
parent_task_id: task-17
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Pour chaque étape, créer une vignette ronde positionnée selon ses coordonnées GPS, contenant la miniature de sa photo principale.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Récupération de la photo principale de chaque étape (depuis photosMapping)
- [ ] #2 Création d'un élément SVG <circle> ou HTML <div> rond positionné en absolu
- [ ] #3 Photo affichée en background clippé circulaire
- [ ] #4 Fallback : icône/couleur si aucune photo disponible
- [ ] #5 Taille des vignettes adaptée (responsive ou fixe avec ratio)
- [ ] #6 Z-index approprié (vignettes au-dessus du tracé)
<!-- AC:END -->
