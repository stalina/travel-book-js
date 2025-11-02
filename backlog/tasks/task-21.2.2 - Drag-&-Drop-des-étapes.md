---
id: task-21.2.2
title: Drag & Drop des étapes
status: Done
assignee:
  - '@agent-k'
created_date: '2025-11-02 23:10'
updated_date: '2025-11-02 23:33'
labels: []
dependencies: []
parent_task_id: task-21.2
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implémenter la fonctionnalité de réorganisation des étapes par drag & drop avec feedback visuel et persistance.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Les étapes sont draggable avec poignée visible (⋮⋮)
- [x] #2 Feedback visuel pendant le drag (opacity, rotation, classes CSS)
- [x] #3 Réorganisation en temps réel de la liste
- [x] #4 Mise à jour de l'ordre dans le store après drop
- [x] #5 Persistance de l'ordre lors du rechargement
- [x] #6 Composable useDragAndDrop() réutilisable
- [x] #7 Tests unitaires du comportement drag & drop
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémentation complète du drag & drop pour réorganiser les étapes:

**Composable créé:**
- useDragAndDrop.ts: Composable réutilisable avec logique complète
  - State: draggedIndex, dragOverIndex, isDragging
  - Handlers: handleDragStart, handleDragOver, handleDragEnter, handleDragLeave, handleDrop, handleDragEnd
  - Helpers: isItemDragged, isItemDraggedOver
  - Générique avec TypeScript <T>

**Store mis à jour:**
- editor.store.ts: Nouvelle action reorderSteps(newSteps)
  - Réorganise le tableau steps dans currentTrip
  - Déclenche auto-save après modification

**Composants mis à jour:**
- StepList.vue: Intégration de useDragAndDrop
  - Passe les handlers aux StepItem
  - Gère la réorganisation via store.reorderSteps()
  - Props isDragged et isDragOver pour feedback visuel

- StepItem.vue: Support complet du drag & drop
  - Attribut draggable="true"
  - Émission de tous les événements drag (dragstart, dragover, dragenter, dragleave, drop, dragend)
  - Props isDragged et isDragOver

**Feedback visuel CSS:**
- .dragging: opacity 0.5, rotation 2deg, scale 0.98, shadow
- .drag-over: border dashed cyan, background gradient, translateY(-4px)
- Cursor grabbing pendant le drag
- Transitions smooth pour animations

**Tests (11 tests, 100% pass):**
- useDragAndDrop.spec.ts: Test complet du composable
  - Initialisation, drag start, drag over, drop, drag end
  - Réorganisation vers le bas/haut
  - Helpers isItemDragged/isItemDraggedOver
- StepList.spec.ts: Test d'intégration (2 nouveaux tests)
  - Props drag & drop passées aux items
  - Appel de reorderSteps après drop

**Validation:**
- 168 tests passent au total
- Drag & drop fluide avec feedback immédiat
- Persistance automatique via auto-save
<!-- SECTION:NOTES:END -->
