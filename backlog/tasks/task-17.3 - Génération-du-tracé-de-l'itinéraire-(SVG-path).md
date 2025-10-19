---
id: task-17.3
title: Génération du tracé de l'itinéraire (SVG path)
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-19 17:42'
updated_date: '2025-10-19 17:58'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Créer fonction generatePathData() pour créer le SVG path
2. Utiliser latLonToSvg() pour convertir chaque étape
3. Générer la commande M pour le premier point
4. Générer les commandes L pour les points suivants
5. Ajouter le path au SVG dans buildMapSection()
6. Gérer les cas limites (1 étape, étapes proches)
7. Ajouter tests unitaires
<!-- SECTION:PLAN:END -->
