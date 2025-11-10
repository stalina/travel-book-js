---
id: task-25
title: Ajouter un test sur les miniatures des pages
status: Done
assignee:
  - '@copilot'
created_date: '2025-11-10 10:02'
updated_date: '2025-11-10 10:04'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Un test de régression doit garantir que les miniatures du bandeau pages affichent toujours le rendu de mise en page activé.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Le test échoue si les classes mini-layout sont absentes
- [x] #2 Le test couvre le cas couverture et layout classique
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyser PagesStrip.vue et ses tests existants
2. Ajouter un TU vérifiant la présence des classes miniatures pour la couverture et une page classique
3. Lancer npm test ciblé pour valider la régression
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Ajout d'un test de régression dans tests/editor/PagesStrip.spec.ts
- Vérifie la présence des structures de miniatures pour la couverture et une page classique
- Tests Vitest ciblés exécutés avec npm test -- PagesStrip
<!-- SECTION:NOTES:END -->
