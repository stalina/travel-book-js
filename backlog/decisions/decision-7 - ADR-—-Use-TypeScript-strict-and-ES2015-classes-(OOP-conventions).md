---
id: decision-7
title: ADR — Use TypeScript strict and ES2015 classes (OOP conventions)
date: '2025-11-10 23:03'
status: accepted
---
## Context
The project is written in TypeScript and follows an ES2015 class-based OOP style inspired by Java conventions. Consistent language and stylistic rules help maintain readability and reduce runtime errors.

## Decision
Enforce TypeScript `strict` mode and prefer ES2015 classes with explicit visibility (`public`, `private`, `readonly`) and constructor-based dependency injection. Document OOP patterns and coding conventions in the repo docs.

## Consequences

- Fewer runtime type errors and clearer contracts between modules.
- Slight increase in compile-time warnings requiring small code changes.
- Encourages explicit API surfaces and easier refactoring.

