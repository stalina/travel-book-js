---
id: task-18
title: Générer section carte dans generate.service
status: To Do
assignee: []
created_date: '2025-10-14 13:20'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter une nouvelle section après la page des statistiques: conteneur pour carte statique (probablement SVG responsive) avec itinéraire et points. Intégrer dans flux build (buildCoverSection, buildStatsSection, puis buildMapSection).
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Créer fonction interne buildMapSection() dans generate.service.ts.
- [ ] #2 Insérer appel après buildStatsSection() dans ordre de génération.
- [ ] #3 Retourner un élément root avec classe map-page et break-after pour pagination.
- [ ] #4 Inclure placeholder SVG avec width 100% et viewBox dynamique.
- [ ] #5 Injecter dataset ou script inline minimal si nécessaire.
<!-- AC:END -->
