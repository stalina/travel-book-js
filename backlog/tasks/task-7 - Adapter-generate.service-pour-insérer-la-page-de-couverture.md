---
id: task-7
title: Adapter generate.service pour insérer la page de couverture
status: Done
assignee: []
created_date: '2025-10-11 23:23'
updated_date: '2025-10-11 23:30'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Modifier generate.service.ts pour construire le HTML de la couverture avant le corps existant, en réutilisant les assets et en minimisant le code dupliqué.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Fonction de build de la couverture isolée (ex: buildCoverPage(trip))
- [x] #2 Fallback si aucune cover_photo accessible: prendre première photo disponible d'une étape
- [x] #3 Si aucune photo disponible: fond de couleur de secours
- [x] #4 Insertion du bloc couverture AVANT le premier step
- [x] #5 Respect des classes CSS (nouvelles classes préfixées .cover-)
- [x] #6 Pas d'appel réseau additionnel hors des fetch déjà existants (sauf récupération cover si déjà dans trip)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémenté via buildCoverSection dans generate.service.ts, insertion avant steps.
<!-- SECTION:NOTES:END -->
