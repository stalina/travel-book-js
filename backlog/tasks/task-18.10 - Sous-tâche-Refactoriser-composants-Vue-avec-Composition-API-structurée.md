---
id: task-18.10
title: 'Sous-tâche: Refactoriser composants Vue avec Composition API structurée'
status: To Do
assignee: []
created_date: '2025-10-28 19:37'
labels:
  - refactoring
  - vue
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Améliorer les composants Vue (HomeView, GenerationView, ViewerView) avec composition API organisée et helpers TypeScript en classes
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Créer des composables TypeScript en classes (useFileSelection, useGeneration)
- [ ] #2 Refactoriser HomeView avec composable useFileSelection
- [ ] #3 Refactoriser GenerationView avec composable useGeneration
- [ ] #4 Refactoriser ViewerView avec logique extraction en classe ViewerController
- [ ] #5 Séparer logique métier (classes TS) de la présentation (templates Vue)
- [ ] #6 Types et interfaces clairs pour props/events
<!-- AC:END -->
