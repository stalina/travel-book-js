---
id: task-21.2.4
title: Auto-save et historique
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-02 23:11'
updated_date: '2025-11-03 00:00'
labels: []
dependencies: []
parent_task_id: task-21.2
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implémenter l'auto-save automatique avec feedback visuel et l'historique undo/redo.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Détection automatique des changements (input/blur events)
- [x] #2 Debounce de 1 seconde avant déclenchement sauvegarde
- [x] #3 Indicateur visuel de statut avec animation pulse
- [x] #4 Historique undo/redo (minimum 20 actions)
- [x] #5 Raccourcis clavier Ctrl+Z (undo) / Ctrl+Shift+Z (redo)
- [x] #6 Composable useAutoSave() avec debounce
- [x] #7 Composable useHistory() avec stack d'actions
- [x] #8 Tests unitaires auto-save et historique
<!-- AC:END -->
