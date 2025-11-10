---
id: task-22
title: 'Fix bug: redirect vers ancienne page après upload'
status: Done
assignee:
  - '@copilot'
created_date: '2025-11-03 00:23'
updated_date: '2025-11-03 00:23'
labels:
  - bug
  - editor
  - navigation
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
L'utilisateur a signalé un bug: après l'upload, quand je clique sur continuer, je suis redirigé vers l'ancienne page (/generate) au lieu du nouvel éditeur (/editor)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Navigation redirige vers /editor au lieu de /generate
- [x] #2 Trip parsé est stocké dans tripStore.parsedTrip
- [x] #3 Trip est passé à editorStore.setTrip()
- [x] #4 Tests d'intégration valident le flux upload → parse → edit
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Correction complète du bug de redirection:

**Modifications effectuées:**

1. **parse.service.ts**: Modifié `parse()` pour retourner `Promise<Trip>` au lieu de `Promise<void>` (ligne 18)
   - Ajout de `return trip` pour exposer le résultat du parsing
   - Documentation JSDoc mise à jour

2. **trip.store.ts**: Ajout du state `parsedTrip`
   - Propriété `parsedTrip: Trip | null` pour stocker le résultat
   - Getter `hasParsedTrip` pour vérifier si le trip est chargé
   - Modification de `parseAndMap()` pour capturer et stocker le résultat

3. **HomeView.vue**: Modification du flux de navigation
   - `goGenerate()` utilise maintenant `router.push("/editor")` au lieu de `store.startGeneration()`
   - Récupère le Trip depuis `tripStore.parsedTrip`
   - Passe le Trip à `editorStore.setTrip(trip)`

4. **EditorView.vue**: Optimisation pour éviter double parsing
   - Vérifie d'abord si `tripStore.hasParsedTrip`
   - Ne parse que si accès direct à /editor sans trip chargé

**Tests ajoutés:**
- 1 test parse.service.spec.ts: vérifie que parse() retourne le Trip
- 5 tests upload-to-editor.integration.spec.ts: valide le flux complet upload → tripStore → editorStore

**Résultats:**
- ✅ Build réussi (173.85 kB JS)
- ✅ 243 tests passent (+6 nouveaux)
- ✅ Navigation corrigée: upload → /editor
- ✅ Data flow complet: TripParser → tripStore → editorStore
<!-- SECTION:NOTES:END -->
