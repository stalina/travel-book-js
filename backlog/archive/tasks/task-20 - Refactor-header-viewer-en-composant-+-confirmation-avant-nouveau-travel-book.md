---
id: task-20
title: Refactor header viewer en composant + confirmation avant nouveau travel book
status: Done
assignee:
  - '@stalina'
created_date: '2025-10-30 20:37'
updated_date: '2025-10-30 20:41'
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
- [x] #1 Header rendu via composant <viewer-header>
- [x] #2 Bouton conservé avec même styles (.new-book-btn)
- [x] #3 Dialogue de confirmation affiché avant navigation (confirm())
- [x] #4 Peut bypass confirmation via attribut data-no-confirm sur lien (extensibilité)
- [x] #5 Tests adaptés (existants mis à jour + nouveau test composant)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Créer fichier src/components/viewer-header.ts (classe ViewerHeader extends HTMLElement)
2. Enregistrer customElements.define("viewer-header", ViewerHeader) dans main.ts ou fichier dédié importé par viewer.html
3. Modifier viewer.html: enlever header statique, ajouter <viewer-header> + script module qui importe dist bundle (vite build)
4. Dans composant: innerHTML du header actuel + ajout listener sur lien pour confirm() sauf si data-no-confirm
5. Adapter tests pour lire rendu généré: importer composant dans test (environment happy-dom) et créer élément puis assertions
6. Nouveau test pour bypass data-no-confirm
7. Mettre à jour tests existants (remplacer recherche directe anchor par création composant)
8. Lancer tests et cocher ACs
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Refactor header en Web Component <viewer-header>.
- Intégration dans viewer.html via script module.
- Bouton conserve texte, styles (.new-book-btn) et attributs a11y role=button, aria-label.
- Ajout confirmation navigation (window.confirm) avant sortie.
- Bypass possible avec attribut data-no-confirm (testé).
- Mise à jour tests: adaptation ancien test navigation, mise à jour test bouton, ajout test spécifique composant.
- Polyfill confirm pour happy-dom.
- Toutes les 101 assertions passent.
<!-- SECTION:NOTES:END -->
