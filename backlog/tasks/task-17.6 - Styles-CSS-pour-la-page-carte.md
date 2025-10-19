---
id: task-17.6
title: Styles CSS pour la page carte
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-19 17:45'
updated_date: '2025-10-19 18:03'
labels:
  - carte
  - css
dependencies: []
parent_task_id: task-17
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter les styles CSS nécessaires pour la mise en page, le rendu de la carte, du tracé et des vignettes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Classes préfixées .map-* dans public/assets/style.css
- [ ] #2 Page pleine page (100vh, break-after pour impression)
- [ ] #3 Carte responsive (SVG avec preserveAspectRatio)
- [ ] #4 Style du tracé (couleur, stroke-width, stroke-dasharray si pointillé)
- [ ] #5 Style des vignettes (border-radius 50%, border, shadow)
- [ ] #6 Support impression (page-break approprié)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Ajouter section CSS pour .map-* dans style.css
2. Style .map-page (pleine page, break-after)
3. Style .map-container et .map-svg (responsive)
4. Style .map-route (tracé)
5. Style .map-marker (vignettes rondes)
6. Style .map-marker-icon (fallback)
7. Support impression (page-break)
8. Tester visuellement
<!-- SECTION:PLAN:END -->
