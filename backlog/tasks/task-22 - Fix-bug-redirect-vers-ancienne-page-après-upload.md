---
id: task-22
title: 'Fix bug: redirect vers ancienne page après upload'
status: Done
assignee:
  - '@copilot'
created_date: '2025-11-03 00:23'
labels:
  - bug
  - editor
  - navigation
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
L'utilisateur a signalé un bug: après l'upload, quand je clique sur continuer, je suis redirigé vers l'ancienne page (/generate) au lieu du nouvel éditeur (/editor)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Navigation redirige vers /editor au lieu de /generate
- [ ] #2 Trip parsé est stocké dans tripStore.parsedTrip
- [ ] #3 Trip est passé à editorStore.setTrip()
- [ ] #4 Tests d'intégration valident le flux upload → parse → edit
<!-- AC:END -->
