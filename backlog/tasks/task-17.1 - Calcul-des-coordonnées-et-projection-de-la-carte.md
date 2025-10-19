---
id: task-17.1
title: Calcul des coordonnées et projection de la carte
status: To Do
assignee: []
created_date: '2025-10-19 17:41'
labels:
  - carte
  - backend
dependencies: []
parent_task_id: task-17
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Calculer le bounding box englobant toutes les étapes du voyage et définir la projection/viewBox pour positionner correctement l'itinéraire et les points.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Fonction qui calcule min/max lat/lon de toutes les étapes
- [ ] #2 Calcul d'un viewBox SVG approprié avec marges (padding)
- [ ] #3 Fonction de conversion lat/lon → coordonnées SVG (pixels)
- [ ] #4 Tests unitaires validant les calculs de projection
<!-- AC:END -->
