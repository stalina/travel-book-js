---
id: task-16
title: Refonte visuelle page statistiques
status: In Progress
assignee:
  - '@stalina'
created_date: '2025-10-12 08:55'
updated_date: '2025-10-12 09:00'
labels:
  - stats
  - ui
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Passer layout en 2 colonnes (1/3 pays sur fond sombre vertical, 2/3 résumé). Colonne droite: titre 'Résumé du voyage', sous-titre trip.summary, grille 2x2 des 4 indicateurs, schéma distance sous métriques + nom de la ville de départ sous le diagramme.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Colonne gauche fond sombre occupe 1/3 largeur
- [x] #2 Pays listés verticalement centrés
- [x] #3 Colonne droite contient titre + sous-titre summary
- [x] #4 Métriques présentées en grille 2x2 sans bordures
- [x] #5 Schéma distance sous métriques
- [x] #6 Nom ville départ sous schéma
- [x] #7 Responsive impression conserve pagination
- [x] #8 Tests ajustés (titre, summary)
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Layout 2 colonnes implémenté (stats-layout). Pays en colonne sombre gauche (1/3). Colonne droite: titre, summary, grille 2x2 métriques, diagramme distance + ville départ. Tests MAJ OK.
<!-- SECTION:NOTES:END -->
