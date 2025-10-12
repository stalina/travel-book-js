---
id: task-11
title: Ajouter page statistiques voyage
status: To Do
assignee: []
created_date: '2025-10-12 00:03'
labels:
  - generation
  - stats
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Créer 2e page après couverture avec maps des pays traversés + statistiques (km, jours, étapes, photos, distance max du point le plus éloigné).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Page générée juste après la couverture
- [ ] #2 Affiche chaque pays unique (ordre de traversée) avec silhouette SVG locale existante ou placeholder
- [ ] #3 Nom du pays en FR dans la silhouette
- [ ] #4 Statistiques: kilomètres (arrondi), nombre de jours, nombre d'étapes, nombre de photos (toutes steps)
- [ ] #5 Calcul distance du point le plus éloigné de la première étape (en km, arrondi)
- [ ] #6 Schéma distance visuel (home -> point max)
- [ ] #7 Styles compatibles impression (respect break-after)
- [ ] #8 Tests unitaires validant présence et valeurs
- [ ] #9 Pas de dépendance réseau supplémentaire
<!-- AC:END -->
