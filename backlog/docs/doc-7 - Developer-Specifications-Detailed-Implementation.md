---
title: Developer Specifications - Detailed Implementation
created_date: '2025-11-10 23:39'
id: doc-7
type: other
updated_date: '2025-11-10 23:59'
---

# Developer Specifications - Detailed Implementation

This document synthesizes existing project artifacts and archived tasks to provide a clear developer-facing specification of what has been implemented in Travel Book JS. It is written in English and is intended to be the single source of truth for developers working on the codebase.

## Overview

- Purpose: generate printable travel books (static HTML/PDF) from user-uploaded trip data. All generation runs entirely in the browser (client-only runtime).
- Stack: Vue 3 (Composition API), TypeScript (strict), Vite, Pinia for state management, Vitest for unit tests.

## Project structure (high-level)

- `src/`
  - `services/` (core singletons, builders, orchestrators)
  - `composables/` (Vue composables helpers and controllers)
  - `stores/` (Pinia stores)
  - `views/` (Vue views)
  - `assets/` (images, styles)
- `backlog/` contains documents, ADRs (`backlog/decisions/`), and task tracking
- `tests/` contains Vitest unit tests

## Core concepts

- Client-only generation: no server-side runtime dependencies. All parsing, image handling and HTML generation happen in-browser so the project can be deployed as a static site.
- Builders: Small classes responsible for creating HTML fragments/pages. Examples: `CoverBuilder`, `StatsBuilder`, `MapBuilder`, `StepBuilder`. Builders are instantiated per generation (not singletons).
- Core singleton services: `LoggerService`, `ElevationService`, `FileSystemService` — created using the singleton pattern and injected into orchestrators.
- Orchestrators: `TripParser` and `ArtifactGenerator` coordinate multiple services and builders to produce the final artifact.

## Implemented features (concise list)

- Import trip data from supported formats (Polarsteps export, GPX + photos).
- Cover page generation with graceful fallbacks where cover photo is missing.
- Automated generation of a statistics page listing unique countries, total kilometers, days, number of photos and other metrics.
- Map page generation using an SVG path connecting step coordinates and photo markers rendered as SVG foreignObject thumbnails.
- Per-step pages generated with adaptive layout for 1-4 photos and textual content.
- Auto-save in the editor (1s debounce) and preview panel that updates in real-time.
- Tests: unit tests for parsing and generation logic (see `tests/generate.service.spec.ts`).

## Data models (formalized shapes)

- Trip
  - id: string
  - name: string
  - start_date: number (unix timestamp, seconds)
  - end_date?: number
  - total_km?: number
  - steps: Step[]

- Step
  - id: number
  - title: string
  - lat: number
  - lon: number
  - photos: Photo[]
  - date?: number

- Photo
  - id: string
  - path: string
  - dataUrl?: string
  - timestamp?: number
  - lat?: number
  - lon?: number

## File locations (where to look)

- `src/services/core/` — singletons (LoggerService, ElevationService, FileSystemService)
- `src/services/builders/` — builders (CoverBuilder, StatsBuilder, MapBuilder, StepBuilder)
- `src/services/generators/` — orchestrators (ArtifactGenerator, TripParser)
- `src/composables/` — Vue composables used by views
- `tests/` — unit tests and spec files

## Screenshots and sample data

Developers can reproduce UI states locally using the included sample input at `docs/input/voyage-slovenie`.

Example screenshots (captured via Playwright):

- Import preview: `/backlog/docs/screenshots/imported.png`
- Editor after import: `/backlog/docs/screenshots/editor-after-import.png`
- Home / main landing: `/backlog/docs/screenshots/home.png`

## API contracts & method contracts

- Builders expose `build(): Promise<string>` or `build(): string` and should not perform network requests directly.
- Orchestrators expose high-level methods such as `generate(trip, options)` / `parse(input)`.
- Singletons expose `getInstance()` and instance methods (e.g., `loggerService.log()`).

## Testing guidance

- Run unit tests with Vitest: `npm test` or `npm run test`.
- Key tests to keep green: `generate.service.spec.ts`, `parse.service.spec.ts`, `logger.service.spec.ts`.
- Add small unit tests when modifying builders and orchestrators. Prefer mocking external network calls (e.g., elevation API) in unit tests.

## Acceptance criteria (development/PR checklist)

- Code compiles with TypeScript strict mode enabled.
- Linting and type checks pass locally and in CI.
- Unit tests cover new behavior and CI tests pass.
- New features include documentation updates under `backlog/docs/`.

## Notes & implementation recommendations

- Keep builders free of global state and side effects; pass dependencies explicitly via constructor.
- Avoid using Node-only APIs at runtime — the generated code must run in the browser.
- Favor small helper methods and private method decomposition inside large builders.

---

_Last updated: 2025-11-11_
