---
id: task-18.9
title: 'Sous-tâche: Refactoriser ArtifactGenerator en classe orchestratrice'
status: Done
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 21:13'
labels:
  - refactoring
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Transformer generate.service.ts en classe ArtifactGenerator qui orchestre tous les builders
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Classe ArtifactGenerator créée avec injection loggerService, elevationService
- [x] #2 Méthode publique generate(input, options)
- [x] #3 Méthodes privées: loadTripData, processPhotos, buildArtifacts
- [x] #4 Utilisation des builders via new CoverBuilder(...).build()
- [x] #5 Export singleton artifactGenerator + fonction wrapper rétrocompatible
- [x] #6 Tests adaptés
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Analyser generate.service.ts actuel (433 lignes)
2. Identifier les sections logiques à extraire en méthodes privées
3. Créer classe ArtifactGenerator avec constructeur(elevationService, loggerService)
4. Créer méthode publique async generate(input, options)
5. Extraire méthodes privées:
   - loadAssets(): CSS, fonts
   - processPhotos(): mapping, ratios, data URLs
   - generatePhotosPlan(): photos_by_pages.txt logic
   - buildHtmlHead(): head section
   - buildHtmlBody(): orchestration builders
   - buildSingleFileHtml(): final assembly
6. Migrer utilisation des builders (déjà fait pour Stats, Map, Step - reste Cover)
7. Export singleton + wrapper rétrocompatible
8. Vérifier que les tests passent (generate.service.spec.ts existe déjà avec 16 tests)
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Refactorisation ArtifactGenerator terminée avec succès:

**Classe créée** (Orchestrator principal):
- Constructor(elevationService: ElevationService, loggerService: LoggerService)
- Singleton pattern avec getInstance()
- private readonly pour injection de dépendances

**Méthode publique**:
- async generate(input: FFInput, options?: GenerateOptions): Promise<GeneratedArtifacts>
- Orchestre tous les builders et services
- Gestion complète du cycle de génération

**Méthodes privées** (13 méthodes):
- loadAssets(): charge CSS, fonts dans manifest
- preloadElevations(): précharge altitudes en masse
- processPhotos(): mapping, ratios, data URLs
- generatePhotosPlan(): génération photos_by_pages.txt
- loadCountryMaps(): charge SVG des pays
- buildHtmlHead(): construction <head>
- parseUserPlan(): parse plan personnalisé
- buildHtmlBody(): orchestre Cover, Stats, Map, Step builders
- normalizePath(), guessRatio(), fileToDataUrl(), createPlaceholderSvg()

**Méthodes publiques supplémentaires**:
- buildSingleFileHtml(): inline CSS/fonts/assets en data: URLs
- buildSingleFileHtmlString(): retourne HTML autonome string

**Utilisation des builders**:
- CoverBuilder (maintenant en classe)
- StatsBuilder (classe)
- MapBuilder (classe)
- StepBuilder (classe)
- Tous instanciés avec new et injection de contexte

**Export**:
- Singleton artifactGenerator exporté
- Wrappers rétrocompatibles: generateArtifacts(), buildSingleFileHtml(), buildSingleFileHtmlString()

**Résultats**: 92/92 tests passent ✅
**Réduction**: 433 lignes → classe structurée avec 13 méthodes privées
<!-- SECTION:NOTES:END -->
