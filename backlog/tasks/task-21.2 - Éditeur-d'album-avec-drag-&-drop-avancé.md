---
id: task-21.2
title: Éditeur d'album avec drag & drop avancé
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-10-30 22:11'
updated_date: '2025-11-02 22:28'
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
1. Ajouter support sélection dossier complet (drag & drop + showDirectoryPicker + input webkitdirectory)
2. Normaliser la représentation interne: FFInput garde structure, ne pas perdre sous-dossiers
3. Étendre FileSystemService: fonction listAllFiles() pour inventaire + détection trip.json + photos
4. Améliorer TripParser: détecter trip.json quel que soit niveau (recherche récursive) + éviter duplication AC (#2/#4)
5. Créer composable usePolarstepsImport() orchestrant drop -> scan -> preview -> parse
6. Créer composant AlbumImportPanel.vue: zone drag & drop, liste fichiers, miniatures (URL.createObjectURL), progression
7. Feedback progression: états scanning, parsing, mapping, ready (ref string + barre)
8. Gestion erreurs: fichier manquant trip.json, absence photos, formats non supportés -> messages dans panel
9. Tests Vitest: FileSystemService.listAllFiles mock DirectoryHandle; TripParser parse trip.json nested; composable états
10. Mettre à jour LandingView pour intégrer bouton/zone import (si non déjà présent) + route éditeur album (placeholder)
11. Cocher ACs au fur et à mesure
12. Notes d’implémentation finales
<!-- SECTION:PLAN:END -->
