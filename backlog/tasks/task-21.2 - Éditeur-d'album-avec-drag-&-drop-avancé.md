---
id: task-21.2
title: Éditeur d'album avec drag & drop avancé
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-10-30 22:11'
updated_date: '2025-11-02 22:27'
labels: []
dependencies: []
parent_task_id: task-21
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Interface d'édition visuelle permettant de réorganiser les étapes, photos, et contenus par glisser-déposer avec preview en temps réel
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 L'import supporte les sous-dossiers et conserve la structure
- [ ] #2 Le parsing du dossier extrait automatiquement trip.json et les photos associées
- [ ] #3 L'utilisateur peut uploader un dossier Polarsteps complet (incluant trip.json, photos, etc.) via drag & drop
- [ ] #4 Le parsing du dossier extrait automatiquement trip.json et les photos associées
- [ ] #5 Les fichiers sont listés et prévisualisés avant import

- [ ] #6 L'import supporte les sous-dossiers et conserve la structure
- [ ] #7 Un feedback visuel indique la progression de l'upload
- [ ] #8 Les erreurs (fichiers non supportés, trop volumineux, etc.) sont gérées et affichées
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyse des besoins et des formats du dossier Polarsteps (structure, fichiers clés, sous-dossiers)
2. Développement du composable ou service d’upload drag & drop (support du DirectoryHandle et FileList)
3. Extraction automatique de trip.json et des photos, mapping des fichiers
4. Affichage de la liste des fichiers et prévisualisation (miniatures, infos)
5. Gestion de la progression d’upload et feedback visuel
6. Gestion des erreurs (fichiers non supportés, volumineux, etc.)
7. Tests unitaires et validation sur plusieurs dossiers Polarsteps
8. Documentation et notes d’implémentation
<!-- SECTION:PLAN:END -->
