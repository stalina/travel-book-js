---
id: TASK-40
title: Cadrage initial de la carte
status: Done
assignee: []
created_date: '2026-03-08 22:30'
updated_date: '2026-10-04 09:32'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter une tâche pour implémenter le cadrage initial de la carte (centrage/zoom sur une section du parcours). Le focus peut être une bbox, une liste d'IDs d'étapes ou un centre+zoom.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Supporter bbox, stepIds ou centre+zoom
- [x] #2 Comportement par défaut inchangé
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implementation: MapBuilder accepts an optional `initialFocus` (bbox, stepIds or center+zoom) as its 4th constructor argument. Helpers: computeBBoxFromStepIds, computeBBoxFromCenterZoom, zoomToDegreeSpan.

Correction (2026-10-04): the first delivery (#112) only stored `initialFocus`; `build()` always framed the whole trip and the helpers were never called. Now:
- `build()` resolves the focus (`resolveInitialFocus()`). Only the first provided form is used, by priority: explicit bbox > stepIds (`computeBBoxFromStepIds`) > center+zoom (`computeBBoxFromCenterZoom`, both required). Tiles are requested for that area; every marker and the full route are still drawn (steps outside the frame are expected, so the "hors du viewBox" warning is only emitted without focus).
- No focus, or a focus that yields no valid bbox (unknown step ids, inverted or non-finite bbox, center without zoom) → whole-trip bbox; an unusable focus logs a warning. Output without focus is byte-identical to before.
- Generation: `GenerateOptions.mapFocus` is forwarded to MapBuilder by `ArtifactGenerator.buildHtmlBody()`. stepIds are resolved against visible steps only (a hidden step cannot be targeted). No UI sets it yet: the editor (`useEditorGeneration`) sends no `mapFocus`, so generated books still frame the whole trip. Editor control: TASK-42.
- Tests: behaviour tests through `build()` in tests/builders/map.builder.spec.ts (tiles requested for the focused area, priority, fallback, markers/route kept) and `mapFocus` forwarding in tests/generate.service.spec.ts.
<!-- SECTION:NOTES:END -->
