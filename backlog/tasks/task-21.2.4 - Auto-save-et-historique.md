---
id: task-21.2.4
title: Auto-save et historique
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-02 23:11'
updated_date: '2025-11-02 23:53'
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
- [ ] #1 Détection automatique des changements (input/blur events)
- [ ] #2 Debounce de 1 seconde avant déclenchement sauvegarde
- [ ] #3 Indicateur visuel de statut avec animation pulse
- [ ] #4 Historique undo/redo (minimum 20 actions)
- [ ] #5 Raccourcis clavier Ctrl+Z (undo) / Ctrl+Shift+Z (redo)
- [ ] #6 Composable useAutoSave() avec debounce
- [ ] #7 Composable useHistory() avec stack d'actions
- [ ] #8 Tests unitaires auto-save et historique
<!-- AC:END -->
