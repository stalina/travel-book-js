---
id: task-21.12
title: 21.12 - Refactor stores éditeur & galerie
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-07 22:54'
updated_date: '2025-11-08 13:55'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Cartographier les responsabilités des stores trip/editor/gallery et définir un modèle de données unifié (Trip + photos + pages + preview).
2. Implémenter un nouveau store central (ex. useTravelSessionStore) en migrant progressivement les états/actions critiques, en réutilisant les helpers existants.
3. Adapter les composants/composables (Home, Gallery, Editor, Preview…) pour consommer le nouveau store et supprimer les anciens stores.
4. Mettre à jour/ajouter les tests Vitest (stores, vues) pour couvrir le flux import → édition → preview et garantir l'absence de régressions.
<!-- SECTION:PLAN:END -->
