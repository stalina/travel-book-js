---
id: decision-1
title: ADR — Client-only runtime (No-server runtime)
date: '2025-11-10 22:56'
status: accepted
---
## Context
The project generates HTML travel books from user-provided data (trips, photos) and targets static hosts (GitHub Pages, Netlify, Vercel). Privacy concerns and the desire for offline capability favor keeping generation and runtime logic in the user's browser.

## Decision
All generation and runtime logic will execute exclusively on the client (browser). No runtime server calls are permitted to generate the final travel book. Build/CI pipelines may call external services, but the final distributed artifact must be a static bundle deployable without a server.

## Consequences

- Simplified deployment on static hosting.
- Improved user privacy: photos and personal data remain under user control.
- Offline/PWA friendliness.
- Limits for heavy CPU/IO tasks; requires client-side performance strategies and graceful degradation.

