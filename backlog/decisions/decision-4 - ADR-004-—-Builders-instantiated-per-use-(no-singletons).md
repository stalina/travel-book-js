---
id: decision-4
title: ADR 004 — Builders instantiated per-use (no singletons)
date: '2025-11-10 22:57'
status: accepted
---
## Context
HTML artifact builders (CoverBuilder, StatsBuilder, MapBuilder, StepBuilder) create document fragments based on specific trip/context data.

## Decision
Builders must be constructed per-use with the necessary context passed into their constructors. Builders are not singletons and should not hold global mutable state.

## Consequences

- Easier testing and reasoning about builder lifecycle.
- Reduced risk of shared mutable state across different generation runs.
- Slight instantiation overhead but improved safety and clarity.

