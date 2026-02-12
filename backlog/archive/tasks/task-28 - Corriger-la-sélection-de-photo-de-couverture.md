---
id: task-28
title: Corriger la sélection de photo de couverture
status: Done
assignee:
  - '@copilot'
created_date: '2025-11-10 10:17'
updated_date: '2025-11-10 10:21'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
La bibliothèque ne sélectionne plus la photo lors d\'un changement de couverture car l\'évènement n\'envoie plus l\'index du slot.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Le slot de couverture peut sélectionner une nouvelle photo
- [x] #2 Un test couvre la sélection pour la couverture
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Corriger CoverPhotoSelector pour relayer les index (openLibrary/edit)
2. Vérifier StepEditor selectPhotoForSlot pour la couverture
3. Ajouter un test sur StepEditor assurant la sélection de couverture
4. Exécuter les tests ciblés
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Correction de src/components/editor/CoverPhotoSelector.vue pour relayer les index de slot et de photo
- Ajout d'un test dans tests/editor/StepEditor.spec.ts vérifiant la sélection de couverture
- Tests exécutés : npm test -- StepEditor
<!-- SECTION:NOTES:END -->
