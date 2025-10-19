---
id: task-17.3
title: Génération du tracé de l'itinéraire (SVG path)
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
Créer une fonction qui génère un élément SVG <path> reliant toutes les étapes dans l'ordre chronologique.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Génération d'un path SVG avec commandes M (move) et L (line) pour chaque étape
- [ ] #2 Utilisation des coordonnées projetées (lat/lon → SVG)
- [ ] #3 Style du tracé configurable (couleur, épaisseur, trait plein/pointillé)
- [ ] #4 Le path respecte l'ordre chronologique des étapes
- [ ] #5 Gestion des cas limites (1 seule étape, étapes très proches)
<!-- AC:END -->
