---
id: task-12
title: Calculs statistiques voyage
status: In Progress
assignee:
  - '@stalina'
created_date: '2025-10-12 00:04'
updated_date: '2025-10-12 17:50'
labels:
  - stats
  - calcul
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implémenter fonctions de calcul: total km (trip.total_km fallback distance cumulée), durée en jours, nombre d'étapes, nombre total de photos, distance max depuis point de départ (haversine).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Fonction util statDistance(lat1,lon1,lat2,lon2) haversine
- [x] #2 Retombe sur trip.total_km si fourni sinon calcule cumul (approx)
- [x] #3 Durée = (end-start)+1 en jours
- [x] #4 Nombre photos = somme photosMapping
- [x] #5 Distance max correctement identifiée
- [x] #6 Renvoie objet stats typed
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémenté dans buildStatsSection():
- Calcul km (trip.total_km sinon cumul Haversine)
- Durée jours (end-start+1)
- Comptage photos via photosMapping
- Steps count
- Distance max depuis première étape (Haversine) + identification step la plus éloignée
- Retour valeurs intégrées dans page statistiques
- Typage implicite via const locaux
Tests: existants verts (5)
<!-- SECTION:NOTES:END -->
