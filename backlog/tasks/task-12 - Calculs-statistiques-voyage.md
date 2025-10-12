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
- [ ] #1 Fonction util statDistance(lat1,lon1,lat2,lon2) haversine
- [ ] #2 Retombe sur trip.total_km si fourni sinon calcule cumul (approx)
- [ ] #3 Durée = (end-start)+1 en jours
- [ ] #4 Nombre photos = somme photosMapping
- [ ] #5 Distance max correctement identifiée
- [ ] #6 Renvoie objet stats typed
<!-- AC:END -->
