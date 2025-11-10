---
id: task-11
title: Ajouter page statistiques voyage
status: Done
assignee:
  - '@stalina'
created_date: '2025-10-12 00:03'
updated_date: '2025-10-14 08:36'
labels:
  - generation
  - stats
dependencies: []
priority: high
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Créer 2e page après couverture avec maps des pays traversés + statistiques (km, jours, étapes, photos, distance max du point le plus éloigné).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Page générée juste après la couverture
- [x] #2 Affiche chaque pays unique (ordre de traversée) avec silhouette SVG locale existante ou placeholder
- [x] #3 Nom du pays en FR dans la silhouette
- [x] #4 Statistiques: kilomètres (arrondi), nombre de jours, nombre d'étapes, nombre de photos (toutes steps)
- [x] #5 Calcul distance du point le plus éloigné de la première étape (en km, arrondi)
- [x] #6 Schéma distance visuel (home -> point max)
- [x] #7 Styles compatibles impression (respect break-after)
- [x] #8 Tests unitaires validant présence et valeurs
- [x] #9 Pas de dépendance réseau supplémentaire
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Ajouter buildStatsSection après buildCoverSection\n2. Calculer métriques (km, jours, étapes, photos, distance max)\n3. Collecter pays + SVG + noms FR\n4. Générer HTML structuré stats-page\n5. Ajouter styles .stats- dans style.css\n6. Ajouter tests unitaires couverture + stats\n7. MAJ README et instructions Copilot\n8. Commit & PR
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémentation complète: buildStatsSection, calculs internes, styles, tests pass (npm test).
<!-- SECTION:NOTES:END -->
