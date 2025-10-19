---
id: task-21
title: Points étapes avec vignettes photo
status: To Do
assignee: []
created_date: '2025-10-14 13:21'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter cercles ou marqueurs aux positions d\'étape. Chaque point: cercle fond blanc contour, image principale crop cercle (clipPath) ou mini vignette carrée flottante. Fallback lettre initiale si pas de photo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Sélectionner photo principale existante (cover_photo_path ou première).
- [ ] #2 Générer éléments SVG groupés <g class="map-point">.
- [ ] #3 ClipPath circulaire pour images.
- [ ] #4 Fallback texte centre si image absente.
- [ ] #5 Attribut title pour tooltip natif.
- [ ] #6 Tests: nombre points == nombre étapes, présence clipPath si image.
<!-- AC:END -->
