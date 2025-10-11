---
id: task-8
title: Styles CSS pour la page de couverture
status: Done
assignee: []
created_date: '2025-10-11 23:23'
updated_date: '2025-10-11 23:30'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter les styles nécessaires dans assets/style.css pour le layout de la couverture (texte centré, overlay lisible, gestion responsive/print).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Ajout d'un bloc .cover-page occupant toute la page
- [x] #2 .cover-background en background-image couvrant (object-fit: cover)
- [x] #3 Titre centré verticalement/horizontalement
- [x] #4 Année affichée dans un petit rectangle ou badge discret
- [x] #5 Compatibilité impression: pas de marges brisées, utilise les mêmes dimensions que les autres pages
- [x] #6 Pas d'impact régressif sur les classes existantes
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Styles .cover-page .cover-background .cover-overlay .cover-year .cover-title ajoutés; aucun impact régressif constaté.
<!-- SECTION:NOTES:END -->
