---
id: task-21.2.4
title: Auto-save et historique
status: Done
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémentation terminée

Composables créés:
- useAutoSave (137 lignes): debounce 1s, status (idle/pending/saving/saved/error), triggerSave, saveNow, reset, watchAndSave
- useHistory (176 lignes): stack undo/redo (max 20), raccourcis Ctrl+Z/Shift+Z/Y, record, undo, redo, clear

Composants:
- SaveStatus (140 lignes): indicateur visuel avec animation pulse, 5 statuts, responsive (mobile cache texte)

Intégrations:
- EditorHeader: remplace ancien save-status par SaveStatus
- EditorView: watch currentTrip avec useHistory, enregistre changements
- editor.store: ajout lastSaveTime, setAutoSaveStatus, type SaveStatus

Tests (21 nouveaux):
- useAutoSave.spec.ts (8 tests): debounce, cancel, saveNow, errors, reset, timers
- useHistory.spec.ts (7 tests): record, undo, redo, stack limit, clear
- SaveStatus.spec.ts (6 tests): statuts, icons, textes, props

Résultats: 225 tests passent (+21 vs 204)
Build: 171.98 kB JS, 38.46 kB CSS, 126 modules
<!-- SECTION:NOTES:END -->
