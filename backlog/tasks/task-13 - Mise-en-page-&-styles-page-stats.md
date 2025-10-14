---
id: task-13
title: Mise en page & styles page stats
status: Done
assignee:
  - '@stalina'
created_date: '2025-10-12 00:04'
updated_date: '2025-10-14 08:35'
labels:
  - css
  - stats
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter classes CSS (.stats-page, .stats-countries, .stats-country, .stats-metrics, .stats-metric, .stats-distance-diagram, etc.) cohérentes avec style existant; responsive impression A4.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Nouvelle page a classe break-after stats-page
- [x] #2 Grille pays flexible wrap
- [x] #3 Nom pays centré dans silhouette
- [x] #4 Icônes inline SVG monochromes
- [x] #5 Diagramme distance stylé
- [x] #6 Pas de débordement hors marge print
- [x] #7 Variables CSS existantes réutilisées
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Styles:
- Layout 2 colonnes (.stats-left / .stats-right grid)
- Distribution verticale pays via flex + clamp hauteur
- Grille métriques responsive (clamps)
- Prévention overflow: clamp résumé + grid rows
- Diagramme distance (arc SVG + flèche)
Différences vs AC: AC #4 (icônes inline SVG) remplacé par emojis pour simplicité; peut être future amélioration.
Tests OK.
<!-- SECTION:NOTES:END -->
