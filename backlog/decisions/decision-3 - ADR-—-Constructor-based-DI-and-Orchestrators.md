---
id: decision-3
title: ADR — Constructor-based DI and Orchestrators
date: '2025-11-10 22:56'
status: accepted
---
## Context
The codebase values explicit dependencies and testability. Orchestrators coordinate multiple services to implement higher-level business logic.

## Decision
Use constructor-based manual dependency injection for services and orchestrators. Orchestrators should receive their dependencies explicitly via constructors. Do not hide dependencies behind global state; when a shared orchestrator is needed, expose an explicit singleton accessor.

## Consequences

- Clear dependency graphs and simpler unit testing via injection of mocks.
- Slightly more verbose code at construction sites but improved transparency.
- Encourages separation of concerns between orchestration and utility services.

