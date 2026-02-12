---
id: doc-11
title: Logging System - Travel Book JS
type: other
created_date: '2025-11-11 22:41'
---
# Logging System — Travel Book JS

## Summary
This document describes the logging system used by the Travel Book generator. It explains log levels, how to enable debug output (from the browser and from code), example log outputs for INFO and DEBUG modes, recommended usage patterns in the codebase, timing helpers, and a few operational tips. The original source for the implementation is `src/services/logger.service.ts`, and unit tests are in `tests/logger.service.spec.ts`.

## Overview
The Travel Book generator uses a layered logging system to make debugging easier and to report progress during generation. The logger exposes INFO and DEBUG levels and provides small helpers for timing operations. DEBUG output is off by default to avoid noisy consoles in normal use.

- Implementation file: `src/services/logger.service.ts`
- Unit tests: `tests/logger.service.spec.ts` (24 tests)

## Log levels

### INFO (always shown)
Use INFO to display important generation milestones and user-facing progress events, for example:
- Start of generation
- Loading assets
- Loading elevation data
- Generating each section (cover, stats, map, steps)
- End of generation

### DEBUG (shown only in debug mode)
Use DEBUG to show detailed, developer-oriented information useful for troubleshooting and deep inspection, such as:
- Sizes of loaded assets
- Which photos were selected for each step
- Photo ratios and layout decisions
- Internal mappings and intermediate state

## Enabling debug mode

### From the browser console
You can toggle debug mode at runtime from the browser console:

```javascript
// Enable debug mode
window.TravelBook.enableDebug(true)

// Check if debug mode is enabled
window.TravelBook.isDebugEnabled()

// Disable debug mode
window.TravelBook.enableDebug(false)
```

### From code
Programmatic control from the application code:

```typescript
import { logger } from './services/logger.service'

// Enable debug logging
logger.setDebugEnabled(true)

// Check debug status
logger.isDebugEnabled()
```

## Example logs

### Normal mode (INFO only)

```
[TravelBook][generate] Start generation { tripId: 1, steps: 5 }
[TravelBook][generate] Loading CSS and font assets
[TravelBook][generate] Loading elevation data in bulk
[TravelBook][generate] Processing 5 steps
[TravelBook][generate] Loading country SVG maps
[TravelBook][generate] Generating cover page
[TravelBook][generate] Generating stats page
[TravelBook][generate] Generating map page
[TravelBook][generate] Generating pages for 5 steps
[TravelBook][TIMING] generateArtifacts 2340ms
[TravelBook][generate] Generation finished { manifestEntries: 42 }
[TravelBook][generate] Building single-file HTML
[TravelBook][TIMING] buildSingleFileHtml 450ms
[TravelBook][generate] Single-file HTML ready { size: 1234567 }
```

### Debug mode (INFO + DEBUG)

```
[TravelBook][generate] Start generation { tripId: 1, steps: 5 }
[TravelBook][generate] Loading CSS and font assets
[TravelBook][DEBUG][generate] Assets loaded { styleLen: 12456, fontsLen: 1234 }
[TravelBook][DEBUG][generate] Font Brandon_Grotesque_medium.otf included { size: 45678 }
[TravelBook][DEBUG][generate] Font included: NotoSerif-Regular.woff2
[TravelBook][DEBUG][generate] Font included: NotoSerif-Italic.woff2
[TravelBook][generate] Loading elevation data in bulk
[TravelBook][DEBUG][generate] Elevations loaded { total: 5, resolved: 5 }
[TravelBook][generate] Processing 5 steps
[TravelBook][DEBUG][generate] Processing step: Paris { id: 10 }
[TravelBook][DEBUG][generate] Selected photos { count: 8 }
[TravelBook][DEBUG][generate] Ratios calculated { portrait: 3, landscape: 5, unknown: 0 }
[TravelBook][DEBUG][generate] Cover policy { useCover: true }
[TravelBook][DEBUG][generate] Chosen cover { index: 1, ratio: 'LANDSCAPE' }
[TravelBook][DEBUG][generate] Pages generated per row
... (repeated for each step)
[TravelBook][DEBUG][generate] Initial manifest initialized { entries: 42 }
[TravelBook][DEBUG][generate] Custom HTML template applied
[TravelBook][generate] Loading country SVG maps
[TravelBook][DEBUG][generate] SVG map included: fr { size: 12345 }
[TravelBook][DEBUG][generate] SVG map included: it { size: 23456 }
[TravelBook][generate] Generating cover page
[TravelBook][generate] Generating stats page
[TravelBook][generate] Generating map page
[TravelBook][DEBUG][map-builder] Building map section
[TravelBook][DEBUG][map-builder] Satellite tiles retrieval { zoom: 6, tilesX: 4, tilesY: 3 }
[TravelBook][DEBUG][map-builder] Tile retrieved: 32,21
[TravelBook][DEBUG][map-builder] Tile retrieved: 32,22
... (one line per tile)
[TravelBook][DEBUG][map-builder] Satellite tiles retrieved { count: 12 }
[TravelBook][DEBUG][map-builder] ViewBox adjusted { x: ..., y: ..., width: ..., height: ... }
[TravelBook][DEBUG][map-builder] Generated route path { length: 245, steps: 5 }
[TravelBook][DEBUG][map-builder] Step thumbnails generated { count: 5 }
[TravelBook][generate] Generating pages for 5 steps
[TravelBook][DEBUG][generate] HTML travel_book generated { size: 987654 }
[TravelBook][TIMING] generateArtifacts 2340ms
[TravelBook][generate] Generation finished { manifestEntries: 42 }
[TravelBook][generate] Building single-file HTML
[TravelBook][DEBUG][generate] DataURL map constructed { assets: 42 }
[TravelBook][DEBUG][generate] Inlined styles { blocks: 2 }
[TravelBook][DEBUG][generate] Assets inlined
[TravelBook][TIMING] buildSingleFileHtml 450ms
[TravelBook][generate] Single-file HTML ready { size: 1234567 }
```

## Usage in code

### Adding INFO logs (important steps)

```typescript
logger.info('module', 'Important message')
logger.info('module', 'Message with data', { key: 'value' })
```

### Adding DEBUG logs (detailed info)

```typescript
logger.debug('module', 'Debug message')
logger.debug('module', 'Message with details', { count: 42 })
```

### Measuring execution time

```typescript
logger.time('operationName')
// ... operation ...
logger.timeEnd('operationName', true) // true = show even in production
```

## Recommendations

- Use INFO for stages that should be visible to the user (generation progress).
- Use DEBUG for technical details useful to developers when investigating issues.
- Debug mode is disabled by default to avoid console noise.
- Enable debug mode only when you need to investigate a problem.

---

If you'd like, I can also create a short Backlog task to update the original `docs/logging.md` to reference this new Backlog document or archive the original file.
