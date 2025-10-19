---
id: task-17.5
title: Fonction buildMapSection dans generate.service.ts
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-19 17:44'
updated_date: '2025-10-19 18:04'
labels:
  - carte
  - backend
dependencies: []
parent_task_id: task-17
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Créer la fonction interne buildMapSection() qui assemble tous les éléments (fond, tracé, vignettes) et retourne le HTML de la page carte.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Fonction buildMapSection() dans generate.service.ts
- [ ] #2 Structure HTML : <div class="break-after map-page">...</div>
- [ ] #3 Intégration de l'image satellite de fond
- [ ] #4 Intégration du SVG avec path et vignettes
- [ ] #5 Gestion des erreurs (try/catch avec fallback)
- [ ] #6 Insertion de la page après buildStatsSection()
<!-- AC:END -->
