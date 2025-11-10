---
id: decision-6
title: 'ADR — Tests and CI conventions (Vitest, lint, build)'
date: '2025-11-10 22:57'
status: accepted
---
## Context
Maintaining quality in a TypeScript + Vue project requires reliable testing and CI gates during refactors.

## Decision
Adopt Vitest for unit tests, run linting and type checks in CI, and require passing tests and lint/typecheck before merging to main branches.

## Consequences

- Increased confidence in changes and safer refactors.
- Longer CI times but clear quality gates.
- Developers must maintain tests and adhere to linting rules.

