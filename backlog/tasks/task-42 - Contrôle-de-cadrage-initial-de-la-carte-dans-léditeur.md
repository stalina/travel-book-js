---
id: TASK-42
title: Contrôle de cadrage initial de la carte dans l'éditeur
status: To Do
assignee: []
created_date: '2026-10-04 09:27'
labels:
  - editor
  - feature
dependencies:
  - TASK-40
ordinal: 5000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Exposer dans l'éditeur le cadrage initial de la carte (TASK-40). La génération accepte déjà GenerateOptions.mapFocus (bbox, stepIds ou centre+zoom) mais aucune UI ne le renseigne : useEditorGeneration n'envoie pas de mapFocus, la carte est donc toujours cadrée sur tout le voyage.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 L'utilisateur peut choisir le cadrage de la carte : tout le voyage (défaut) ou une sélection d'étapes
- [ ] #2 useEditorGeneration transmet le cadrage choisi via GenerateOptions.mapFocus
- [ ] #3 Le cadrage est persisté dans le DraftSnapshot et restauré à la reprise
- [ ] #4 Sans choix explicite, la carte générée reste identique (tout le voyage)
<!-- AC:END -->
