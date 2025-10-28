---
id: task-18
title: Refactorisation modulaire de generate.service.ts
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-27 21:38'
updated_date: '2025-10-27 22:55'
labels:
  - refactor
  - architecture
  - generate-service
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Objectif: découper le fichier generate.service.ts (>1200 lignes) en une architecture modulaire, testable et maintenable côté navigateur.

Contexte: Le fichier contient logique métier, génération HTML, calculs géographiques, mapping photos, téléchargement d'assets, CSS inline, conversions data URL et assemblage final. Sa taille complique la lisibilité et les tests.

Approche: Créer un dossier src/services/generate/ avec services spécialisés (utils, assets loader, elevation, photo mapping, plan, metrics), des PageBuilders (cover, stats, map, steps), un orchestrateur TravelBookGenerator et un single-file service. Appliquer SOLID, injection de dépendances et séparer strictement HTML du calcul.

Livrables: Nouveau code structuré, tests unitaires, mise à jour tests existants, documentation README.

Risques: Régression HTML, oubli d'assets dans manifest, modification non voulue des signatures publiques.

Mesures: Tests snapshot et unitaires, maintien signatures, logger centralisé, edge cases couverts.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Architecture dossier generate/ créée avec services et page builders
- [ ] #2 Fonctions publiques generateArtifacts/buildSingleFileHtml/buildSingleFileHtmlString préservées
- [ ] #3 Utilitaires extraits (escape, ratio, geo, format, path)
- [ ] #4 Tests unitaires ajoutés (metrics, photo-mapping, photos-plan, map, cover, orchestrator)
- [ ] #5 Test existant mis à jour et vert
- [ ] #6 Pas de nouvelle dépendance Node runtime
- [ ] #7 Documentation architecture dans README
- [ ] #8 Edge cases couverts (0 step, step unique, pas de cover, pays code 00, plan utilisateur, elevations absentes, map sans path)
- [ ] #9 Séparation logique vs HTML dans PageBuilders
- [ ] #10 Performance similaire (+/-10%)
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Création structure dossiers generate/...
2. Extraction types & logger
3. Orchestrator + index exports compatibles
4. Page builders cover/stats/map/steps (squelettes)
5. Services utilitaires (assets, photo-mapping, photos-plan, metrics, elevation)
6. Migration logique depuis generate.service.ts progressivement
7. Adapter generate.service.ts pour re-exporter nouvelle API
8. Créer nouveaux tests unitaires pour services & pages
9. Adapter ancien test generate.service.spec.ts
10. Edge cases tests supplémentaires
11. Mise à jour README section Architecture du générateur
12. Vérification finales: lint, tests PASS, pas régression HTML
<!-- SECTION:PLAN:END -->
