---
id: task-24
title: Refactorisation StepEditor et nettoyage composants
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-11-10 09:14'
updated_date: '2025-11-10 09:15'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Nettoyer le code de l'éditeur de step et des composants associés sans changer l'UX actuelle. Supprimer le code inutilisé (composants, services, styles, commentaires obsolètes) et recentrer le scope de StepEditor sur la composition de sous-composants autonomes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Les composants Vue inutilisés sont identifiés et supprimés sans casser l'application.
- [ ] #2 StepEditor.vue délègue son rendu, ses styles et sa logique à des sous-composants dédiés, tout en conservant le comportement existant.
- [ ] #3 Les services inutilisés sont supprimés ou isolés et la base de tests reste verte.
- [ ] #4 Les commentaires obsolètes ou inutiles sont retirés dans les fichiers modifiés.
- [ ] #5 Les tests pertinents sont mis à jour si nécessaire et l'application continue de fonctionner.
<!-- AC:END -->
