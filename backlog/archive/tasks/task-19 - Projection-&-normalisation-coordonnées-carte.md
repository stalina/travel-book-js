---
id: task-19
title: Projection & normalisation coordonnées carte
status: To Do
assignee: []
created_date: '2025-10-14 13:20'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implémenter transformation lat/lon -> coordonnées SVG: calculer bounding box englobant toutes les étapes (avec marge). Normaliser en pourcentage (0-100) ou dans viewBox (0..W,0..H).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Calculer min/max lat/lon de toutes les étapes.
- [ ] #2 Ajouter marge configurable (ex 2%).
- [ ] #3 Fonction utilitaire project(lat,lon) retourne {x,y}.
- [ ] #4 Gérer inversion axe Y (lat plus grand vers haut).
- [ ] #5 Tests unitaires projection cohérente (points extrêmes sur bords).
- [ ] #6 Documentation interne dans code.
<!-- AC:END -->
