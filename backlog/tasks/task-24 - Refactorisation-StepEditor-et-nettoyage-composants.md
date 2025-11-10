---
id: task-24
title: Refactorisation StepEditor et nettoyage composants
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-11-10 09:14'
updated_date: '2025-11-10 09:47'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Nettoyer le code de l'éditeur de step et des composants associés sans changer l'UX actuelle. Supprimer le code inutilisé (composants, services, styles, commentaires obsolètes) et recentrer le scope de StepEditor sur la composition de sous-composants autonomes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Les composants Vue inutilisés sont identifiés et supprimés sans casser l'application.
- [x] #2 StepEditor.vue délègue son rendu, ses styles et sa logique à des sous-composants dédiés, tout en conservant le comportement existant.
- [x] #3 Les services inutilisés sont supprimés ou isolés et la base de tests reste verte.
- [x] #4 Les commentaires obsolètes ou inutiles sont retirés dans les fichiers modifiés.
- [x] #5 Les tests pertinents sont mis à jour si nécessaire et l'application continue de fonctionner.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Cartographier les composants et services utilisés par StepEditor.vue et ses vues parentes.
2. Identifier le code mort (composants, services, styles) via recherche et vérifier qu'il n'est pas utilisé.
3. Extraire ou créer des sous-composants autonomes (template/script/style) pour les sections de StepEditor.
4. Nettoyer StepEditor.vue en supprimant styles/logic inutiles et en déléguant aux nouveaux composants.
5. Supprimer les services/composants inutilisés et adapter les imports.
6. Mettre à jour ou écrire des tests si nécessaire puis exécuter la suite pour valider.
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
- Refactor StepEditor pour déléguer la configuration de couverture aux sous-composants et alléger le template.
- Migration des styles HTML/CSS vers LayoutOptions, PagesStrip, SelectedGrid, CoverPhotoSelector, DescriptionEditor, PreviewSection et PhotoLibraryPopin pour rendre chaque bloc autonome.
- Suppression des artefacts inutilisés (PreviewActions.vue, photo-metadata.service.ts) et création de CoverLayoutOptions.vue.
- Ajustement du PhotoLibraryPopin pour piloter son import et nettoyage des commentaires obsolètes.
- Typecheck + npm test: ok.
<!-- SECTION:NOTES:END -->
