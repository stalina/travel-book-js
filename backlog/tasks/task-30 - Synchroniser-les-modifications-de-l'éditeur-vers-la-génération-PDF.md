---
id: task-30
title: Synchroniser les modifications de l'éditeur vers la génération PDF
status: To Do
assignee: []
created_date: '2025-11-10 11:05'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Actuellement, les modifications faites dans l'éditeur (ajout/suppression de pages, changement de layouts, modification de photos) ne sont pas prises en compte lors de la génération du PDF. Il faut que le StepBuilder utilise le plan de génération (StepGenerationPlan) créé par l'éditeur.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Les pages ajoutées/supprimées dans l'éditeur sont reflétées dans le PDF
- [ ] #2 Les changements de layout sont appliqués dans le PDF
- [ ] #3 Les photos sélectionnées/désélectionnées dans l'éditeur sont utilisées dans le PDF
- [ ] #4 La description modifiée dans l'éditeur est utilisée dans le PDF
- [ ] #5 La photo de couverture choisie dans l'éditeur est utilisée dans le PDF
<!-- AC:END -->
