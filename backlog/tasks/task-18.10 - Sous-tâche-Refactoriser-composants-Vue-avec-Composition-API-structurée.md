---
id: task-18.10
title: 'Sous-tâche: Refactoriser composants Vue avec Composition API structurée'
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-28 19:37'
updated_date: '2025-10-28 21:19'
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
- [x] #1 Créer des composables TypeScript en classes (useFileSelection, useGeneration)
- [x] #2 Refactoriser HomeView avec composable useFileSelection
- [x] #3 Refactoriser GenerationView avec composable useGeneration
- [x] #4 Refactoriser ViewerView avec logique extraction en classe ViewerController
- [x] #5 Séparer logique métier (classes TS) de la présentation (templates Vue)
- [x] #6 Types et interfaces clairs pour props/events
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyser les composants Vue actuels (déjà en Composition API)
2. Identifier la logique à extraire en composables/classes
3. Créer useFileSelection composable pour HomeView:
   - Gestion sélection fichiers/dossiers
   - Drag & drop
   - Interaction avec File System Access API
4. Créer useGeneration composable pour GenerationView:
   - Gestion des étapes de génération
   - État working/error
   - Orchestration du flux
5. Créer ViewerController classe pour ViewerView:
   - Gestion ouverture nouvel onglet
   - Téléchargement fichier
   - Gestion des URL objects
6. Refactoriser les composants pour utiliser les composables
7. Vérifier que tout fonctionne (tests manuels car pas de tests Vue)
<!-- SECTION:PLAN:END -->
