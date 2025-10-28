---
id: task-18
title: 'Refactorisation ES2015 complète : Architecture OOP pour développeurs Java'
status: To Do
assignee: []
created_date: '2025-10-28 19:35'
labels:
  - refactoring
  - architecture
  - typescript
  - vue
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Refactoriser l'ensemble du projet (TypeScript services + composants Vue.js) pour adopter une architecture orientée objet (classes ES2015) plus accessible aux développeurs issus du monde Java. Inclut services, builders, stores, composants Vue et tests unitaires.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Services core (Logger, Elevation, FileSystem) refactorisés en classes singleton
- [ ] #2 Builders (Cover, Stats, Map, Step) refactorisés en classes avec contexte injecté
- [ ] #3 Services métier (Generate, Parse) refactorisés en classes orchestratrices
- [ ] #4 Composants Vue refactorisés avec Composition API + classes TypeScript
- [ ] #5 Stores Pinia adaptés pour injection de dépendances
- [ ] #6 Tests unitaires refactorisés pour tester les classes
- [ ] #7 Documentation technique mise à jour (instructions Copilot, README)
- [ ] #8 Guide de migration créé pour futurs développeurs
<!-- AC:END -->
