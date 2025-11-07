---
id: task-21.3
title: Galerie photos intelligente avec édition
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-10-30 22:11'
updated_date: '2025-11-07 21:51'
labels: []
dependencies: []
parent_task_id: task-21
priority: medium
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Gestionnaire de photos avec preview, crop, filtres, réorganisation, et suggestions automatiques de mise en page
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Accès depuis l'éditeur à une vue Galerie avec 3 modes d'affichage (grille, compacte, liste) affichant toutes les photos importées.
- [ ] #2 Filtres combinables par texte, lieu, plage de dates et tags avec tri dynamique et compteur de résultats.
- [ ] #3 Sélection multiple avec barre d'actions flottante (favoris, téléchargement, suppression) et état persistant.
- [ ] #4 Badges IA (coup de cœur, alertes qualité) et panneau suggestions (au moins 4 layouts) générés automatiquement selon les photos sélectionnées.
- [ ] #5 Modal d'édition photo avec filtres prédéfinis, sliders luminosité/contraste/saturation, rotation 90°, recadrage multi-ratios, undo/redo et prévisualisation en direct.
- [ ] #6 Jeux de tests unitaires couvrant filtres, sélection et application des réglages d'édition.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Modéliser les photos (types, service PhotoMetadataService) pour extraire métadonnées, ratio et scores IA à partir de window.__parsedTrip.stepPhotos.
2. Créer un store Pinia photoGallery.store pour charger les assets, gérer filtres, tris, sélection, favoris et suggestions (undo/redo sur réglages inclus).
3. Développer les composables et utilitaires (useGalleryFilters, useSelectionShortcuts, layoutSuggestions.ts) alimentant la vue.
4. Implémenter la vue GalleryView + composants (GalleryHeader, GalleryFilters, GalleryGrid/Compact/List, FloatingActions, SuggestionsPanel, PhotoEditorModal) avec navigation depuis l’éditeur et retour.
5. Intégrer l’édition (filtres CSS, sliders, rotation, recadrage ratios, historique d’actions) et appliquer les modifications aux vignettes.
6. Écrire les tests Vitest (store, composables, composant principal) pour filtrage, sélection, édition ; ajouter scénarios de snapshot/interaction.
<!-- SECTION:PLAN:END -->
