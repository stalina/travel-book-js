---
title: User Guide - How to use Travel Book JS
created_date: '2025-11-10 23:40'
id: doc-10
type: other
updated_date: '2025-11-10 23:58'
---

# User Guide - How to use Travel Book JS

This user guide explains the application's purpose and provides step-by-step instructions for common user workflows. Written in English.

## What is Travel Book JS?

Travel Book JS is a browser-based app to generate printable travel books from trip data (photos, steps, dates). It runs entirely in the browser; no files are uploaded to a server during generation.

## Quick Start

1. Open the application in your browser (local dev server or deployed site). Example `viewer.html` for local viewing.
2. Click "Import" and select a trip export (supported: Polarsteps export, GPX with photos). The app reads photos and metadata.
3. Review steps in the left sidebar and reorder by drag & drop if needed.
4. Edit titles and captions inline in the center editor.
5. Open the preview panel on the right to see live updates in mobile/desktop/PDF modes.
6. Click "Generate" to produce the printable HTML pages.
7. Export to PDF using the browser print dialog (choose "Save as PDF").

## Editor overview

- Left panel: Steps list and ordering.
- Middle panel: Canvas for editing titles and content.
- Right panel: Live preview with mode selector.

## Importing a sample trip

You can use the included sample data at `docs/input/voyage-slovenie` to test import and preview flows. After importing, the app shows a preview of steps and photos.

![Import preview](/backlog/docs/screenshots/imported.png)

After clicking "Continuer" you'll land in the editor where you can edit step titles, add pages and generate the printable pages.

![Editor after import](/backlog/docs/screenshots/editor-after-import.png)

## Screenshots

The following additional screenshots illustrate the application UI (captured via Playwright):

![Home](/backlog/docs/screenshots/home.png)

![Index](/backlog/docs/screenshots/index.png)

## Photos

- Add photos via the add button inside a step.
- Photos without GPS metadata will not be placed on the map.
- Images are embedded as data URLs for the generated HTML.

## Map and Stats pages

- Map: displays a path connecting steps and photo markers using SVG.
- Stats: lists unique countries visited and key metrics like total kilometers and number of photos.

## Export & printing

- Use Chrome or Edge for best results when printing to PDF.
- Suggested print settings: scale 100%, disable headers/footers.

## Troubleshooting

- Import failure: verify supported format and that photos include EXIF GPS when needed.
- Slow generation: try reducing image sizes or disable elevation fetch in settings.

## Privacy

- All processing is local to the browser; no server-side upload occurs during import or generation.

## Getting help

- Open an issue in the repository with steps to reproduce and sample files if possible.

---

_Last updated: 2025-11-11_
