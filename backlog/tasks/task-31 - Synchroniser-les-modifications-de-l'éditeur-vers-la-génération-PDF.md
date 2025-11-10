---
id: task-31
title: Synchroniser les modifications de l'éditeur vers la génération PDF
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-10 11:05'
updated_date: '2025-11-10 11:07'
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

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Étendre GenerateOptions pour accepter un Map<stepId, StepGenerationPlan>
2. Modifier useEditorGeneration pour construire ce map depuis editorStore
3. Adapter generate.service.ts pour fusionner les plans de l'éditeur avec le parsing du fichier texte
4. Vérifier que StepBuilder reçoit bien le plan de l'éditeur
5. Tester en modifiant des pages dans l'éditeur et vérifier le PDF généré
6. Ajouter des tests unitaires
<!-- SECTION:PLAN:END -->
