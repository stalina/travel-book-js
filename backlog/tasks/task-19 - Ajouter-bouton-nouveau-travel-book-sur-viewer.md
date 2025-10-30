---
id: task-19
title: Ajouter bouton nouveau travel book sur viewer
status: In Progress
assignee:
  - '@stalina'
created_date: '2025-10-30 20:29'
updated_date: '2025-10-30 20:31'
labels:
  - ui
  - navigation
dependencies: []
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter sur la page viewer un bouton permettant de revenir à la page d'accueil (index.html) pour démarrer un nouveau travel book sans recharger manuellement l'onglet.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Bouton visible dans l'entête ou zone clairement identifiable
- [ ] #2 Texte explicite: 'Nouveau travel book'
- [ ] #3 Redirige vers index.html sans erreur (href relative)
- [ ] #4 Accessible: role button, aria-label, focus visible
- [ ] #5 Test unitaire vérifie présence, texte et href
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Ajouter bouton dans viewer.html dans conteneur header existant ou créer zone outils
2. Ajouter attributs accessibilité (aria-label, tabindex si besoin) + classes CSS
3. Ajouter styles .new-book-btn (focus, hover) dans assets/style.css
4. Créer test vitest lisant viewer.html via fetch ou fs et vérifiant bouton
5. Mettre à jour README si nécessaire (option navigation)
6. Cocher ACs et rédiger notes
<!-- SECTION:PLAN:END -->
