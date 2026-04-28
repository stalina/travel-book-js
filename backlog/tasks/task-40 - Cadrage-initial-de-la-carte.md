---
id: TASK-40
title: Cadrage initial de la carte
status: Done
assignee: []
created_date: '2026-03-08 22:30'
updated_date: '2026-03-08 22:36'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter une tâche pour implémenter le cadrage initial de la carte (centrage/zoom sur une section du parcours). Le focus peut être une bbox, une liste d'IDs d'étapes ou un centre+zoom.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Supporter bbox, stepIds ou centre+zoom
- [x] #2 Comportement par défaut inchangé
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation: MapBuilder updated to accept initialFocus (bbox, stepIds, center+zoom). Added helpers: computeBBoxFromStepIds, computeBBoxFromCenterZoom, zoomToDegreeSpan. Added unit tests at tests/map.builder.spec.ts and committed changes on feat/map.
<!-- SECTION:NOTES:END -->
