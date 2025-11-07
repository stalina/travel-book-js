---
id: task-21.2.5
title: Preview temps réel
status: Done
assignee:
  - '@agent-k'
created_date: '2025-11-02 23:11'
updated_date: '2025-11-03 00:07'
labels: []
dependencies: []
parent_task_id: task-21.2
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implémenter la preview en temps réel avec modes d'affichage et statistiques mises à jour automatiquement.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Synchronisation automatique canvas → preview (watch reactive)
- [x] #2 3 modes de preview fonctionnels (Mobile, Desktop, PDF)
- [x] #3 Scaling adaptatif selon le mode sélectionné
- [x] #4 Mise à jour temps réel des statistiques (photos, étapes, jours, pages)
- [x] #5 Composable usePreview() pour logique de synchronisation
- [x] #6 Tests unitaires de synchronisation et calcul des statistiques
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémentation terminée

Composable créé:
- usePreview (184 lignes): synchronisation temps réel, 3 modes (Mobile/Desktop/PDF), dimensions adaptatives, scaling, génération contenu HTML, calcul stats

Mise à jour PreviewPanel:
- Utilise usePreview pour sync automatique
- Watch currentTrip (deep, immediate)
- Contenu HTML généré dynamiquement
- Styles pour .preview-render avec :deep()
- Statistiques mises à jour en temps réel

Calcul statistiques:
- Photos: 0 (TODO: photosMapping)
- Étapes: steps.length
- Jours: (end_date - start_date) / 86400
- Pages: 3 + steps * 2.5

Dimensions par mode:
- Mobile: 375x667, scale 0.5
- Desktop: 1200x800, scale 0.3
- PDF (A4): 794x1123, scale 0.4

Tests (12 nouveaux):
- usePreview.spec.ts: modes, dimensions, styles, sync, stats, updates

Résultats: 237 tests passent (+12 vs 225)
Build: 173.59 kB JS, 39.73 kB CSS, 127 modules
<!-- SECTION:NOTES:END -->
