---
id: task-21.12
title: 21.12 - Refactor stores éditeur & galerie
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-07 22:54'
updated_date: '2025-11-08 12:13'
labels: []
dependencies: []
parent_task_id: task-21
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Unifier les stores editor/trip/gallery pour partager le state étapes, pages, photos et éviter les doublons.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Création d'un store unifié gérant étapes, pages, photos et sélection active.
- [ ] #2 Migration des composants existants vers le nouveau store sans régressions.
- [ ] #3 Suppression des stores redondants et mise à jour des tests associés.
- [ ] #4 Tests de régression Vitest couvrant les flux import → édition → preview.
<!-- AC:END -->
