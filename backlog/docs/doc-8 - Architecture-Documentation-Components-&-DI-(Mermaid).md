---
title: Architecture Documentation - Components & DI (Mermaid)
created_date: '2025-11-10 23:39'
id: doc-8
type: other
updated_date: '2025-11-10 23:50'
---

# Architecture Documentation - Components & Dependency Injection

This document provides a clear architecture overview with diagrams. All diagrams use Mermaid notation and are intended to be rendered by supported viewers (GitHub, Mermaid Live, VS Code Mermaid preview).

## High-level component diagram

```mermaid
graph TD
  subgraph Presentation
    HomeView
    GenerationView
    ViewerView
  end

  subgraph UI_Logic
    useFileSelection
    ViewerController
  end

  subgraph State
    TripStore
  end

  subgraph Orchestrators
    TripParser
    ArtifactGenerator
  end

  subgraph Builders
    CoverBuilder
    StatsBuilder
    MapBuilder
    StepBuilder
  end

  subgraph Core_Services
    LoggerService
    ElevationService
    FileSystemService
  end

  HomeView --> useFileSelection
  GenerationView --> TripStore
  ViewerView --> ViewerController

  TripStore --> TripParser
  TripStore --> ArtifactGenerator

  TripParser --> FileSystemService
  TripParser --> LoggerService
  ArtifactGenerator --> ElevationService
  ArtifactGenerator --> LoggerService
  ArtifactGenerator --> CoverBuilder
  ArtifactGenerator --> StatsBuilder
  ArtifactGenerator --> MapBuilder
  ArtifactGenerator --> StepBuilder
```

## Class-level DI example (Mermaid class diagram)

```mermaid
classDiagram
  class LoggerService {
    +getInstance()
    +log()
  }

  class TripParser {
    -fileSystemService: FileSystemService
    -loggerService: LoggerService
    +parse()
  }

  TripParser --> FileSystemService
  TripParser --> LoggerService
```

## Illustrative screenshots

The following screenshots demonstrate the live application UI and are useful when discussing where components map to the UI:

![Home view](/backlog/docs/screenshots/home.png)

## Detailed notes

- The architecture follows an OOP-style decomposition using ES2015 classes.
- Singleton pattern is used for core services; orchestrators are singletons that inject these services; builders are created per-generation.
- Dependency injection is manual via constructor parameters — there is no IoC container.

## Migration guidance and references

- Refer to the ADRs in `backlog/decisions/` for decisions that influenced this architecture.

---

_Last updated: 2025-11-11_
