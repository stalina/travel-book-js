---
id: task-20
title: Refactor header viewer en composant + confirmation avant nouveau travel book
status: To Do
assignee: []
created_date: '2025-10-30 20:37'
labels:
  - ui
  - navigation
  - refactor
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extraire le header statique de viewer.html dans un composant réutilisable (Web Component TypeScript) et ajouter une confirmation avant de quitter pour créer un nouveau travel book si l’utilisateur est sur la page générée.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Header rendu via composant <viewer-header>
- [ ] #2 Bouton conservé avec même styles (.new-book-btn)
- [ ] #3 Dialogue de confirmation affiché avant navigation (confirm())
- [ ] #4 Peut bypass confirmation via attribut data-no-confirm sur lien (extensibilité)
- [ ] #5 Tests adaptés (existants mis à jour + nouveau test composant)
<!-- AC:END -->
