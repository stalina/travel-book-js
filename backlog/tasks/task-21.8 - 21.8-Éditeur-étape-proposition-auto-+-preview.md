---
id: task-21.8
title: '21.8 - Éditeur étape : proposition auto + preview'
status: In Progress
assignee:
  - '@agent-k'
created_date: '2025-11-07 22:53'
updated_date: '2025-11-08 00:15'
labels: []
dependencies: []
parent_task_id: task-21
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Fusionner la vue Galerie avec l'éditeur d'étape pour afficher une proposition automatiquement générée (texte+photos) et une prévisualisation fidèle de la page active.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Ouverture d'une étape affiche la proposition générée (description, statistiques, sélection photo par défaut) dans un panneau dédié.
- [x] #2 La prévisualisation de la page reflète la mise en page et les contenus courants avec rafraîchissement instantané.
- [x] #3 Un bouton permet de régénérer la proposition auto et d'enregistrer la dernière proposition validée.
- [x] #4 Tests Vitest couvrant la génération du state et le rendu du panneau de preview.
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Cartographier le flux actuel (EditorStore, StepEditor, PreviewPanel) et recenser données nécessaires à la proposition (texte étape, stats, photos par défaut).
2. Créer un générateur de proposition (service/composable) produisant description enrichie, métriques et sélection photo, avec sauvegarde dans le store (state par étape).
3. Étendre editor.store pour stocker propositions/parcours et exposer actions de génération, régénération et validation.
4. Refonte StepEditor : panneau proposition + bouton régénérer, preview embarquée de la page courante, synchronisation avec les actions du store.
5. Ajouter tests Vitest (store + composable + rendu StepEditor) couvrant génération initiale, régénération et reflet dans la preview.
<!-- SECTION:PLAN:END -->
