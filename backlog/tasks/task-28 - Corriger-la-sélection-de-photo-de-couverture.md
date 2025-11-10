---
id: task-28
title: Corriger la sélection de photo de couverture
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-11-10 10:17'
updated_date: '2025-11-10 10:17'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
La bibliothèque ne sélectionne plus la photo lors d\'un changement de couverture car l\'évènement n\'envoie plus l\'index du slot.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Le slot de couverture peut sélectionner une nouvelle photo
- [ ] #2 Un test couvre la sélection pour la couverture
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Corriger CoverPhotoSelector pour relayer les index (openLibrary/edit)
2. Vérifier StepEditor selectPhotoForSlot pour la couverture
3. Ajouter un test sur StepEditor assurant la sélection de couverture
4. Exécuter les tests ciblés
<!-- SECTION:PLAN:END -->
