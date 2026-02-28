---
id: TASK-38
title: Agencements photo-only pour couverture etape
status: Done
assignee:
  - '@copilot'
created_date: '2026-02-28 11:18'
updated_date: '2026-02-28 11:46'
labels:
  - feature
  - editor
  - cover
dependencies: []
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter 2 nouveaux agencements pour la page de couverture d'etape, sans texte de description mais conservant titre, carte, date, altitude et informations de l'etape.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Agencement image-full: 1 image occupe l'espace dispo sous les infos etape
- [x] #2 Agencement image-two: 2 images cote a cote sous les infos etape
- [x] #3 Titre, carte pays, date, altitude, meteo et barre de progression visibles dans les 2 formats
- [x] #4 Le texte de description n'est pas affiche dans les 2 nouveaux agencements
- [x] #5 CoverLayoutOptions.vue integre les 2 nouveaux agencements avec apercu miniature
- [x] #6 PagesStrip.vue affiche un apercu miniature pour les 2 nouveaux formats de couverture
- [x] #7 StepEditor.vue permet de selectionner 1 photo (image-full) ou 2 photos (image-two)
- [x] #8 step.builder.ts genere le bon HTML pour image-full et image-two
- [x] #9 styles CSS ajoutes dans public/assets/style.css pour les 2 nouveaux agencements
- [x] #10 coverFormat propage via StepGenerationPlan jusqu'au StepBuilder
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Etendre CoverFormat dans editor.types.ts (image-full, image-two) + cover2 dans StepGenerationPlan
2. Mettre a jour editor.store.ts: setter cover2PhotoIndex, propager coverFormat dans buildStepPlan
3. Mettre a jour step.builder.ts: lire coverFormat du plan, buildCoverPageImageFull(), buildCoverPageImageTwo(), buildStepInfoWithoutDescription()
4. Ajouter CSS dans public/assets/style.css pour .step-cover-image-full et .step-cover-image-two
5. Mettre a jour CoverLayoutOptions.vue: 2 nouvelles options avec previews
6. Mettre a jour PagesStrip.vue: mini-previews pour les 2 nouveaux formats
7. Mettre a jour StepEditor.vue: selectionner 1 ou 2 photos selon le format, propager coverFormat dans buildStepPlan
8. Tester dans le navigateur avec playwright
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Nouveaux agencements photo-only pour couverture etape

2 nouveaux formats de page de couverture ajoutés, sans texte de description, conservant titre, infos et carte.

### Changements principaux

- `editor.types.ts` : nouveau type `CoverFormat` (text-image | text-only | image-full | image-two), `cover2PhotoIndex` dans `StepPageState`, `cover2` + `coverFormat` dans `StepGenerationPlan`
- `editor.store.ts` : `setCurrentStepCover2PhotoIndex`, propagation de `coverFormat` et `cover2` dans `buildStepPlan`
- `step.builder.ts` : `buildCoverPageImageFull()`, `buildCoverPageImageTwo()`, `buildStepInfoWithoutDescription()`, parametre `includeDescription` dans `buildStepInfo`
- `style.css` : styles `.step-cover-image-full` et `.step-cover-image-two`
- `CoverLayoutOptions.vue` : 4 options (dont 2 nouvelles) avec previews miniatures
- `PagesStrip.vue` : mini-previews pour image-full et image-two
- `StepEditor.vue` : selection de 1 ou 2 photos selon le format, message informatif
- `CoverPhotoSelector.vue` : prop `label` pour personnaliser le titre

### Tests

- 3 nouveaux tests dans `step.builder.spec.ts` (image-full, image-two, text-only)
- Test `CoverLayoutOptions.spec.ts` mis a jour pour 4 options
- 302 tests passent (39 fichiers)
<!-- SECTION:NOTES:END -->
