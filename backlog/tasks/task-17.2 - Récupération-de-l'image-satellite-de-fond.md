---
id: task-17.2
title: Récupération de l'image satellite de fond
status: To Do
assignee: []
created_date: '2025-10-19 17:41'
labels:
  - carte
  - assets
dependencies: []
parent_task_id: task-17
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Intégrer une tuile de carte satellite statique couvrant la zone du voyage (contrainte : côté navigateur uniquement, pas de serveur).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Utiliser un service de tuiles statiques compatible (ex: Mapbox Static API, ou génération pré-exportée)
- [ ] #2 Image de fond encodée en data URL ou stockée dans assets
- [ ] #3 Fallback : fond de carte simple (couleur/gradient) si image indisponible
- [ ] #4 Respect contrainte : tout exécutable côté client
- [ ] #5 Documentation de la méthode choisie
<!-- AC:END -->
