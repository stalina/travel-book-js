---
id: task-17
title: Créer une page de résumé du voyage sous forme de carte
status: Done
assignee: []
created_date: '2025-10-19 17:19'
updated_date: '2025-10-27 22:55'
labels: []
dependencies: []
ordinal: 25000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
L'objectif est de créer une nouvelle page qui contiendra une cartographie en pleine page avec l'ensemble du parcours et les étapes du voyage sous forme de petite vignette.

**Où doit se trouver cette page** : La page doit se trouver après la page de Statistique et avant la première étape.
**Quel visuel pour la cartographie** : La cartographie doit être sous forme de carte satelite
**Où placer les vignettes** : les vignettes doivent être placé selon les points GPS associés à l'étape
**Quel visuel pour les vignettes** : Les vignettes sont des ronds dans lesquels se trouve un miniature de la photo pricipale de l'étape

L'objectif est que nous puissons voir la globalité du parcour sur cette étape
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémentation carte pleine page:

- Ajout section map-page insérée après stats-page dans generate.service.ts
- Calcul dynamique du bounding box (calculateBoundingBox) et conversion en viewBox ajusté via fetchTilesForBbox
- Récupération tuiles satellite Esri WorldImagery avec limitation adaptative du zoom + expansion périphérique (MAX_TILES_PER_AXIS=6 + EXTRA_TILE_PADDING) pour conserver les étapes visibles
- Passage SVG en preserveAspectRatio="xMidYMid slice" pour remplir entièrement la page sans marges grises
- Padding bbox porté à 30% pour éviter le rognage des marqueurs en mode slice
- Génération du tracé itinéraire (generatePathData) avec commandes M/L
- Vignettes étape via foreignObject HTML (generateStepMarkers) avec photo principale ou fallback 📍
- Corrections style: .map-marker border-box pour éviter le clipping des ronds
- Tests Vitest étendus (11 tests sur la page carte) validant: présence page, viewBox, path, absence path 1 étape, vignettes, fallback, position GPS, fond tuiles, preserveAspectRatio slice
- Optimisation: fetch bulk elevations conservée, aucune dépendance serveur, tout s exécute côté navigateur

Impact performance: passage de ~6 à un maximum de 30 tuiles dans certains cas mais toujours borné pour éviter surcharge réseau. Temps de génération < 2s en test.

Prochaines pistes (hors périmètre tâche): clustering vignettes qui se chevauchent, amélioration accessibilité (titles/aria), option de désactivation carte.,-s Done
<!-- SECTION:NOTES:END -->
