---
id: task-17
title: Analyser besoins page carte interactive imprimée
status: To Do
assignee: []
created_date: '2025-10-14 13:19'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Analyser objectifs de la nouvelle page carte après la page statistiques: afficher l\'itinéraire global du voyage (polyline), les points d\'étapes avec leur photo principale (ou fallback), sur un fond cartographique statique (sans tuiles dynamiques) compatible export/impression. Identifier données déjà disponibles (locations.json, trip.json) et transformations nécessaires (projection plate / bounding box).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Lister les sources de données nécessaires (trip, locations, photos).
- [ ] #2 Définir contraintes: 100% côté client, aucun appel réseau additionnel, impression A4/format livre.
- [ ] #3 Choisir approche projection (ex: normaliser lat/lon vers box SVG).
- [ ] #4 Identifier besoins performance (pré-calcul distances déjà fait ?).
- [ ] #5 Identifier fallback en absence de photo pour un point.
- [ ] #6 Définir ordre d\'insertion: après stats page dans generate.service.
<!-- AC:END -->
