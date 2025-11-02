---
id: task-21.2.3
title: Éditeur de contenu d'étape
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-02 23:10'
updated_date: '2025-11-02 23:38'
labels: []
dependencies: []
parent_task_id: task-21.2
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implémenter l'éditeur de contenu d'une étape: titre, photos, texte avec toolbar de formatage.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Titre d'étape éditable inline avec validation
- [ ] #2 Grille de photos responsive (auto-fill, minmax(200px, 1fr))
- [ ] #3 Ajout de photos via slot + avec sélecteur de fichier
- [ ] #4 Overlay d'actions sur photos au hover (éditer, réorganiser, supprimer)
- [ ] #5 Éditeur de texte riche (contenteditable) avec placeholder
- [ ] #6 Toolbar sticky avec groupes d'outils de formatage
- [ ] #7 Application du formatage texte fonctionnelle
- [ ] #8 Composable useTextFormatting() pour logique de formatage
- [ ] #9 Tests unitaires de l'éditeur, toolbar et formatage
<!-- AC:END -->
