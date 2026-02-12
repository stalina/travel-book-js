---
id: TASK-35
title: Sauvegarde et reprise de brouillon dans le navigateur
status: To Do
assignee: []
created_date: '2026-02-12 01:39'
labels: []
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Permettre de sauvegarder l album dans IndexedDB via bouton manuel et reprendre depuis la page import
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Service DraftStorageService Singleton pour persistance IndexedDB
- [ ] #2 Bouton Sauvegarder le brouillon dans le header editeur
- [ ] #3 Carte de reprise sur HomeView si brouillon existe
- [ ] #4 Restauration complete de etat editeur depuis le brouillon
- [ ] #5 Confirmation avant ecrasement du brouillon existant
- [ ] #6 Persistance apres fermeture du navigateur
- [ ] #7 Tests unitaires serialisation deserialisation et restauration
<!-- AC:END -->
