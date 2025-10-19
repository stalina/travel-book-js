---
id: task-20
title: Tracer polyline itinéraire voyage
status: To Do
assignee: []
created_date: '2025-10-14 13:20'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Construire polyline reliant les étapes dans l\'ordre chronologique. Utiliser interpolation directe entre points projetés. Optionnel: arrondir / lisser (future amélioration).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Extraire étapes triées par timestamp.
- [ ] #2 Générer attribut d SVG path simplifié (M x y L x y ...).
- [ ] #3 Appliquer style stroke principal (couleur thème, largeur adaptée impression).
- [ ] #4 Gérer cas <2 points (ne rien tracer).
- [ ] #5 Tests: path commence par M et contient nombre segments attendu.
<!-- AC:END -->
