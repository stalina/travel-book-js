# Travel Book JS

Travel Book JS is a client-only Single Page Application (Vue 3 + Vite + TypeScript) that generates a printable "travel book" entirely in the browser. Users can import trip data and photos, preview the travel book, and export a single self-contained HTML file suitable for offline use or printing.

This repository contains the web application source and developer tooling. More detailed architecture and design decisions are stored under `backlog/docs/` and `backlog/decisions/`.

## Key highlights

- Client-only runtime: all processing happens in the browser (no server required).
- Export: produces a single HTML file with all resources inlined for sharing or printing.
- Privacy-first: data never leaves the user's machine unless they explicitly upload it themselves.

## Quick start (developer)

Requirements

- Node.js LTS (v18+)

Install dependencies and start the dev server

```bash
npm install
npm run dev
```

Build and preview a production bundle

```bash
npm run build
npm run preview
```

Run tests and type checking

```bash
npm run test
npm run typecheck
```

Other useful script

```bash
# fetch maps or other external assets used by developer scripts
npm run fetch:maps
```

## Using the application (user)

1. Open the app in your browser (development server or the built `index.html`).
2. Use the "Viewer" to import your trip folder or a zip containing trip data and photos.
3. Click "Show in app" to preview the generated travel book in the browser.
4. Click "Download (single file)" to export a self-contained HTML travel book (all images and fonts inlined).

Notes

- The File System Access API (Chrome/Edge) is recommended for the best folder import experience. The app falls back to file input for other browsers.
- If you add local fonts to `public/assets/fonts/`, the single-file export will inline them to preserve offline visual parity.

## Developer overview

- Source: `src/` (services, builders, composables, views, stores, utils).
- Patterns: core utilities implemented as Singletons, orchestrators coordinate services via constructor DI, builders are instantiated per generation.
- Tests: unit tests live in `tests/` and use Vitest.

## Backlog.md workflow (mandatory)

This project uses Backlog.md to track work, decisions and documentation. Developers must use the Backlog.md workflow for creating tasks, decisions (ADRs) and project docs.

Backlog.md repository: https://github.com/MrLesk/Backlog.md

Common examples (run from project root):

```bash
# create a new task
backlog task create "Short task title"

# create an ADR (decision)
backlog decision create "ADR - Short Decision Title"

# create a documentation page in backlog
backlog document create "Design Notes" 
```

Follow the Backlog.md guides in `backlog/` for the project's required metadata and templates. If you are unsure, open the backlog workflow overview in the repository or run the backlog CLI help.

## Contributing

Please read `CONTRIBUTING.md` for the contribution workflow, coding conventions and test expectations. All contributions must include corresponding Backlog.md entries (task and/or documentation). For architecture-impacting changes add an ADR using the Backlog.md workflow.