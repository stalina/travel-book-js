---
id: task-29
title: Aligner la logique de génération de pages de l'éditeur sur celle du PDF
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-10 10:44'
updated_date: '2025-11-10 10:44'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
L'éditeur génère actuellement une page full-page par photo lors du chargement initial. Le PDF utilise un algorithme sophistiqué (buildAutomaticPages) qui optimise les layouts selon les ratios des photos. Il faut réutiliser cette même logique dans l'éditeur.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 L'éditeur utilise la même logique buildAutomaticPages que StepBuilder
- [ ] #2 Les pages proposées dans l'éditeur correspondent exactement à celles du PDF généré
- [ ] #3 La logique est centralisée pour éviter la duplication de code
<!-- AC:END -->
