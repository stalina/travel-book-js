---
id: task-18.4
title: 'Sous-tâche: Refactoriser CoverBuilder en classe avec contexte'
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 20:01'
labels:
  - refactoring
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Transformer cover.builder.ts en classe CoverBuilder avec trip/photos injectés via constructeur
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Classe CoverBuilder créée avec constructeur(trip, photosMapping, photoDataUrlMap)
- [ ] #2 Méthode publique build() retourne HTML
- [ ] #3 Méthodes privées: extractYear, selectCoverPhoto, generateHtml
- [ ] #4 Migrations vers new CoverBuilder(...).build()
- [ ] #5 Tests adaptés pour instanciation de classe
<!-- AC:END -->
