---
id: TASK-36
title: Sauvegarde et reprise de brouillon
status: Done
assignee:
  - '@copilot'
created_date: '2026-02-12 01:42'
updated_date: '2026-02-13 12:51'
labels: []
dependencies: []
priority: high
ordinal: 1000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Sauvegarder album dans IndexedDB via bouton manuel et reprendre depuis la page import
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Service DraftStorageService Singleton pour persistance IndexedDB
- [x] #2 Bouton Sauvegarder le brouillon dans le header editeur
- [x] #3 Carte de reprise sur HomeView si brouillon existe
- [x] #4 Restauration complete de etat editeur depuis le brouillon
- [x] #5 Confirmation avant ecrasement du brouillon existant
- [x] #6 Persistance apres fermeture du navigateur
- [x] #7 Tests unitaires serialisation deserialisation et restauration
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Creer les types serialisables pour le brouillon (DraftSnapshot, DraftPhotoEntry)
2. Creer DraftStorageService (Singleton) avec IndexedDB (saveDraft, loadDraft, hasDraft, deleteDraft, getDraftInfo)
3. Ajouter restoreFromDraft() dans editor.store.ts pour restaurer etat complet
4. Ajouter bouton Sauvegarder le brouillon dans EditorHeader.vue
5. Creer composant DraftResumeCard.vue pour proposer la reprise
6. Integrer DraftResumeCard dans HomeView.vue avec logique de reprise ou import
7. Ajouter confirmation avant ecrasement du brouillon existant
8. Tests unitaires du DraftStorageService et de la restauration
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implemente la sauvegarde et reprise de brouillon dans IndexedDB.

Fichiers crees:
- src/models/draft.types.ts: Types serialisables (DraftSnapshot, DraftPhotoEntry, DraftInfo)
- src/services/draft-storage.service.ts: DraftStorageService Singleton (IndexedDB avec 2 object stores: meta + photos)
- src/components/album/DraftResumeCard.vue: Carte de reprise affichant nom du voyage, nb etapes/photos, date
- tests/draft-storage.service.spec.ts: 15 tests couvrant round-trip, singleton, CRUD, ecrasement

Fichiers modifies:
- src/stores/editor.store.ts: Ajout saveDraftToStorage() et restoreFromDraft(), exposition de stepPhotosByStep et stepPageStates
- src/components/editor/EditorHeader.vue: Bouton Sauvegarder le brouillon
- src/views/HomeView.vue: Integration DraftResumeCard, detection brouillon au mount, dialog de confirmation ecrasement

Dependance ajoutee: fake-indexeddb (devDependency) pour les tests
<!-- SECTION:NOTES:END -->
