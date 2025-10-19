---
id: task-17.5
title: Fonction buildMapSection dans generate.service.ts
status: Done
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
- [x] #1 Fonction buildMapSection() dans generate.service.ts
- [x] #2 Structure HTML : <div class="break-after map-page">...</div>
- [x] #3 Intégration de l'image satellite de fond
- [x] #4 Intégration du SVG avec path et vignettes
- [x] #5 Gestion des erreurs (try/catch avec fallback)
- [x] #6 Insertion de la page après buildStatsSection()
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
buildMapSection() complètement implémentée:
- Fonction intégrée dans generate.service.ts
- Structure HTML: <div class="break-after map-page">
- SVG viewBox 1000x1000 preserveAspectRatio
- Intégration path tracé et markers vignettes
- Try/catch avec fallback (retourne chaîne vide)
- Insertion après buildStatsSection() via bodyHtml +=
- Logs debug pour suivi (viewBox, path, markers)
- Tests passent (13/13)
<!-- SECTION:NOTES:END -->
