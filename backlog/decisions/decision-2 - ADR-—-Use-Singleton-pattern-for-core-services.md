---
id: decision-2
title: ADR — Use Singleton pattern for core services
date: '2025-11-10 22:56'
status: accepted
---
## Context
Core utilities such as logging, elevation retrieval and a filesystem-like service are used across many modules. Consistent single instances simplify configuration and usage.

## Decision
Adopt the Singleton pattern for core, stateless services (e.g., LoggerService, ElevationService, FileSystemService). Provide a `getInstance()` static method for each service.

## Consequences

- Simplifies access to shared utilities and keeps configuration centralized.
- Avoids accidental multiple instances with divergent state.
- If a service later requires per-context state, provide factory/orchestrator-based alternatives rather than converting existing singletons.

