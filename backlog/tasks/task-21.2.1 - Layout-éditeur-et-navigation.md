---
id: task-21.2.1
title: Layout éditeur et navigation
status: Done
assignee:
  - '@agent-k'
created_date: '2025-11-02 23:09'
updated_date: '2025-11-02 23:24'
labels: []
dependencies: []
parent_task_id: task-21.2
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Créer la structure de base de l'éditeur avec le layout 3 colonnes (sidebar, main, preview), le header avec actions, et la navigation entre étapes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Layout 3 colonnes (sidebar 280px, main flex-1, preview 400px) responsive
- [x] #2 Header avec logo, titre éditable et boutons d'action
- [x] #3 Sidebar avec onglets (Étapes/Thèmes/Options) fonctionnels
- [x] #4 Liste des étapes affichée avec métadonnées (nom, nb photos, durée)
- [x] #5 Sélection d'étape active avec feedback visuel
- [x] #6 Preview panel avec header et sélecteur de mode
- [x] #7 Statistiques du voyage affichées (4 cards avec gradients)
- [x] #8 Layout responsive: masque preview sur tablette, layout vertical sur mobile
- [x] #9 Tests unitaires pour tous les composants de layout
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémentation complète du layout éditeur 3 colonnes:

**Composants créés:**
- EditorView.vue: Layout grid avec responsive breakpoints (1200px, 992px, 768px)
- EditorHeader.vue: Logo, titre éditable, indicateur auto-save avec pulse, 3 boutons d'action
- EditorSidebar.vue: Tabs (Étapes/Thèmes/Options) avec slot pour contenu
- PreviewPanel.vue: Modes (📱💻📄), preview content, 4 stats cards avec gradients
- StepList.vue: Liste scrollable avec état vide
- StepItem.vue: Drag handle, numéro, nom, métadonnées (lieu, date, photos)

**Store Pinia:**
- editor.store.ts: currentTrip, currentStepIndex, autoSaveStatus, previewMode, activeSidebarTab
- Getters: currentStep, totalSteps, totalDays, estimatedPages
- Actions: setTrip, setCurrentStep, updateStepTitle, setPreviewMode, triggerAutoSave

**Design System:**
- design-system.css: Variables CSS (couleurs, typographie, espacements, ombres)
- Intégré dans main.ts pour usage global

**Tests (20 tests, 100% pass):**
- EditorView.spec.ts: Grid layout, placeholder, store usage
- EditorHeader.spec.ts: Logo, titre, save status, action buttons
- StepList.spec.ts: Empty state, rendering, selection, highlighting
- PreviewPanel.spec.ts: Modes, stats, CSS classes, reactivity

**Responsive:**
- Desktop (>1200px): 3 colonnes complètes
- Tablette (992-1200px): Preview masqué
- Mobile (<768px): Sidebar masqué, layout vertical
<!-- SECTION:NOTES:END -->
