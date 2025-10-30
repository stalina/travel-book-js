# Diagrammes UML - Architecture ES2015/OOP

**Date**: 28 octobre 2025  
**Format**: Mermaid (compatible GitHub, VS Code, documentation)

---

## 📋 Table des Matières

1. [Vue d'ensemble de l'architecture](#vue-densemble-de-larchitecture)
2. [Services Core (Singletons)](#services-core-singletons)
3. [Builders](#builders)
4. [Orchestrateurs](#orchestrateurs)
5. [Couche Vue (Composables & Controllers)](#couche-vue-composables--controllers)
6. [Diagramme de séquence : Génération complète](#diagramme-de-séquence--génération-complète)

---

## 🏛️ Vue d'ensemble de l'architecture

### Diagramme de composants

```mermaid
graph TD
    subgraph "Présentation"
        V1[HomeView]
        V2[GenerationView]
        V3[ViewerView]
    end
    
    subgraph "Logique UI"
        C1[useFileSelection]
        C2[useGeneration]
        C3[ViewerController]
    end
    
    subgraph "État"
        S[TripStore]
    end
    
    subgraph "Orchestrateurs"
        O1[TripParser]
        O2[ArtifactGenerator]
    end
    
    subgraph "Builders"
        B1[CoverBuilder]
        B2[StatsBuilder]
        B3[MapBuilder]
        B4[StepBuilder]
    end
    
    subgraph "Services Core"
        SC1[LoggerService]
        SC2[ElevationService]
        SC3[FileSystemService]
    end
    
    V1 --> C1
    V2 --> C2
    V3 --> C3
    
    C1 --> S
    C2 --> S
    C3 --> S
    
    S --> O1
    S --> O2
    
    O1 --> SC3
    O1 --> SC1
    
    O2 --> SC2
    O2 --> SC1
    O2 --> B1
    O2 --> B2
    O2 --> B3
    O2 --> B4
```

---

## 🔧 Services Core (Singletons)

### LoggerService

```mermaid
classDiagram
    class LoggerService {
        -static instance: LoggerService | null
        -timestamps: Map~string, number~
        -constructor()
        +static getInstance() LoggerService
        +debug(scope: string, message: string, extra?: any) void
        +info(scope: string, message: string, extra?: any) void
        +warn(scope: string, message: string, extra?: any) void
        +error(scope: string, message: string, error?: any) void
        +time(label: string) void
        +timeEnd(label: string, shouldLog?: boolean) number
    }
    
    note for LoggerService "Pattern: Singleton\nConstructeur privé\nUne seule instance globale"
```

### ElevationService

```mermaid
classDiagram
    class ElevationService {
        -static instance: ElevationService | null
        -cache: Map~string, number~
        -constructor()
        +static getInstance() ElevationService
        +getElevation(lat: number, lon: number) Promise~number | null~
        +getElevationsBulk(coords: Coord[]) Promise~(number | null)[]~
        -fetchBatch(coords: Coord[]) Promise~(number | null)[]~
        -getCacheKey(lat: number, lon: number) string
    }
    
    note for ElevationService "Pattern: Singleton\nCache des altitudes\nAPI Open-Meteo"
```

### FileSystemService

```mermaid
classDiagram
    class FileSystemService {
        -static instance: FileSystemService | null
        -constructor()
        +static getInstance() FileSystemService
        +readTripDirectory() Promise~FFInput~
        +readFileFromPath(input: FFInput, path: string[]) Promise~File | null~
        +readAllPhotos(input: FFInput, slug: string, stepId: number) Promise~File[]~
    }
    
    note for FileSystemService "Pattern: Singleton\nAPI File System Access\nFallback input file"
```

---

## 🏗️ Builders

### Diagramme de classe des Builders

```mermaid
classDiagram
    class CoverBuilder {
        -trip: Trip
        -photosMapping: PhotosMapping
        -photoDataUrlMap: PhotoDataUrlMap
        -constructor(trip, photosMapping, photoDataUrlMap)
        +build() string
        -extractYear() number
        -getCoverPhotoUrl() string | null
        -buildWithPhoto(photoUrl: string) string
        -buildWithoutPhoto() string
    }
    
    class StatsBuilder {
        -trip: Trip
        -photosMapping: PhotosMapping
        -constructor(trip, photosMapping)
        +build() string
        -extractUniqueCountries() string[]
        -calculateTotalKm() number
        -calculateDuration() number
        -countSteps() number
        -countPhotos() number
        -calculateMaxDistance() number
        -buildCountriesSection() string
        -buildMetricsSection() string
    }
    
    class MapBuilder {
        -trip: Trip
        -photosMapping: PhotosMapping
        -photoDataUrlMap: PhotoDataUrlMap
        -constructor(trip, photosMapping, photoDataUrlMap)
        +build() Promise~string~
        -calculateBoundingBox() BoundingBox
        -calculateViewBox() string
        -latLonToSvg(lat, lon, bbox) Point
        -generatePathData() string
        -generateStepMarkers() Promise~string~
    }
    
    class StepBuilder {
        -trip: Trip
        -step: Step
        -photosMapping: PhotosMapping
        -photoDataUrlMap: PhotoDataUrlMap
        -stepPlan: StepPlan | undefined
        -constructor(trip, step, photosMapping, photoDataUrlMap, stepPlan?)
        +build() Promise~string~
        -planLayout() StepLayout
        -calculateMapDotPosition() Promise~object~
        -buildStepInfo() string
        -calculateTripPercentage() number
        -calculateDayNumber() number
        -ccToEmoji(code: string) string
        -resolvedPhotoUrl(photoIndex: number) string
        -buildCoverPageWithPhoto(photoIndex: number) string
        -buildCoverPageWithoutPhoto() string
        -buildPhotoPage(photoIndices: number[]) string
        -buildOneOrTwoPhotosPage(photos: PhotoInfo[]) string
        -buildThreeOrFourPhotosPage(photos: PhotoInfo[]) string
    }
    
    note for CoverBuilder "Pattern: Builder\nInjection de contexte\nGénère HTML page 1"
    
    note for StatsBuilder "Pattern: Builder\nCalculs statistiques\nGénère HTML page 2"
    
    note for MapBuilder "Pattern: Builder\nProjection SVG\nGénère HTML page 3"
    
    note for StepBuilder "Pattern: Builder\n14 méthodes privées\nLayout photos complexe"
```

---

## 🎯 Orchestrateurs

### TripParser

```mermaid
classDiagram
    class TripParser {
        -static instance: TripParser | null
        -fileSystemService: FileSystemService
        -loggerService: LoggerService
        -constructor(fileSystemService, loggerService)
        +static getInstance() TripParser
        +parse(input: FFInput) Promise~void~
        -loadTripJson(input: FFInput) Promise~any~
        -mapToTrip(tripJson: any) Trip
        -loadStepPhotos(input: FFInput, trip: Trip) Promise~Record~
        -saveToWindow(trip: Trip, stepPhotos: Record) void
    }
    
    TripParser --> FileSystemService : utilise
    TripParser --> LoggerService : utilise
    
    note for TripParser "Pattern: Orchestrator + Singleton\nInjection de dépendances\nCoordonne parsing complet"
```

### ArtifactGenerator

```mermaid
classDiagram
    class ArtifactGenerator {
        -static instance: ArtifactGenerator | null
        -elevationService: ElevationService
        -loggerService: LoggerService
        -constructor(elevationService, loggerService)
        +static getInstance() ArtifactGenerator
        +generate(input: FFInput, options?: GenerateOptions) Promise~GeneratedArtifacts~
        +buildSingleFileHtml(artifacts: GeneratedArtifacts) Promise~Blob~
        +buildSingleFileHtmlString(artifacts: GeneratedArtifacts) Promise~string~
        -loadAssets(manifest: Manifest) Promise~void~
        -preloadElevations(trip: Trip) Promise~void~
        -processPhotos(...) Promise~PhotosMapping~
        -generatePhotosPlan(trip: Trip, photosMapping: PhotosMapping) string[]
        -loadCountryMaps(trip: Trip, manifest: Manifest) Promise~void~
        -buildHtmlHead() Promise~string~
        -parseUserPlan(userPlanText: string) Record
        -buildHtmlBody(...) Promise~string~
        -normalizePath(...parts: string[]) string
        -guessRatio(w: number, h: number) Ratio
        -fileToDataUrl(file: File) Promise~string~
        -createPlaceholderSvg(code: string) Blob
    }
    
    ArtifactGenerator --> ElevationService : utilise
    ArtifactGenerator --> LoggerService : utilise
    ArtifactGenerator --> CoverBuilder : instancie
    ArtifactGenerator --> StatsBuilder : instancie
    ArtifactGenerator --> MapBuilder : instancie
    ArtifactGenerator --> StepBuilder : instancie
    
    note for ArtifactGenerator "Pattern: Orchestrator + Singleton\nCoordonne toute la génération\n433 lignes → classe structurée"
```

---

## 🎨 Couche Vue (Composables & Controllers)

### Composables

```mermaid
classDiagram
    class useFileSelection {
        +tripStore: TripStore
        +pickDirectory() Promise~void~
        +onFilesPicked(event: Event) Promise~void~
        +onDrop(event: DragEvent) Promise~void~
    }
    
    class useGeneration {
        +tripStore: TripStore
        +stepIndex: Ref~number~
        +error: Ref~string | null~
        +isWorking: Ref~boolean~
        +initialize() Promise~void~
        +generateNow() Promise~void~
        +reloadDefault() Promise~void~
    }
    
    useFileSelection --> TripStore : utilise
    useGeneration --> TripStore : utilise
    
    note for useFileSelection "Composable Vue\nGestion sélection fichiers\nDrag & drop"
    
    note for useGeneration "Composable Vue\nOrchestration workflow\nGestion état UI"
```

### ViewerController

```mermaid
classDiagram
    class ViewerController {
        -artifacts: GeneratedArtifacts | null
        -loggerService: LoggerService
        -constructor(loggerService)
        +setArtifacts(artifacts: GeneratedArtifacts) void
        +openInNewTab() Promise~void~
        +download() Promise~void~
        +backToEditor() void
    }
    
    ViewerController --> LoggerService : utilise
    
    note for ViewerController "Pattern: Controller\nGestion viewer\nExport singleton"
```

---

## 🔄 Diagramme de séquence : Génération complète

```mermaid
sequenceDiagram
    participant User
    participant GenerationView
    participant useGeneration
    participant TripStore
    participant TripParser
    participant FileSystemService
    participant ArtifactGenerator
    participant ElevationService
    participant Builders
    participant LoggerService
    
    User->>GenerationView: Clique "Générer"
    GenerationView->>useGeneration: generateNow()
    useGeneration->>TripStore: generateArtifacts()
    
    alt Si trip non parsé
        TripStore->>TripParser: parse(input)
        TripParser->>FileSystemService: readFileFromPath('trip.json')
        FileSystemService-->>TripParser: File
        TripParser->>TripParser: mapToTrip(json)
        TripParser->>FileSystemService: readAllPhotos() (pour chaque étape)
        FileSystemService-->>TripParser: File[]
        TripParser->>TripParser: saveToWindow()
        TripParser->>LoggerService: debug('Parsing terminé')
        TripParser-->>TripStore: void
    end
    
    TripStore->>ArtifactGenerator: generate(input, options)
    
    ArtifactGenerator->>ArtifactGenerator: loadAssets()
    ArtifactGenerator->>ElevationService: getElevationsBulk(coords)
    ElevationService->>ElevationService: fetchBatch() (API)
    ElevationService-->>ArtifactGenerator: altitudes
    
    ArtifactGenerator->>ArtifactGenerator: processPhotos()
    ArtifactGenerator->>ArtifactGenerator: parseUserPlan()
    
    ArtifactGenerator->>Builders: new CoverBuilder()
    Builders-->>ArtifactGenerator: coverHtml
    
    ArtifactGenerator->>Builders: new StatsBuilder()
    Builders-->>ArtifactGenerator: statsHtml
    
    ArtifactGenerator->>Builders: new MapBuilder()
    Builders-->>ArtifactGenerator: mapHtml
    
    loop Pour chaque étape
        ArtifactGenerator->>Builders: new StepBuilder()
        Builders-->>ArtifactGenerator: stepHtml
    end
    
    ArtifactGenerator->>ArtifactGenerator: buildHtmlBody()
    ArtifactGenerator->>LoggerService: timeEnd('Génération totale')
    ArtifactGenerator-->>TripStore: GeneratedArtifacts
    
    TripStore-->>useGeneration: success
    useGeneration->>GenerationView: Mise à jour état
    GenerationView-->>User: Affichage résultat
```

---

## 📊 Diagramme d'injection de dépendances

```mermaid
graph TB
    subgraph "Singletons créés au démarrage"
        L[LoggerService.getInstance]
        E[ElevationService.getInstance]
        F[FileSystemService.getInstance]
    end
    
    subgraph "Orchestrateurs (singletons)"
        TP[TripParser]
        AG[ArtifactGenerator]
    end
    
    subgraph "Builders (instances)"
        CB[CoverBuilder]
        SB[StatsBuilder]
        MB[MapBuilder]
        STB[StepBuilder]
    end
    
    F -.inject.-> TP
    L -.inject.-> TP
    
    E -.inject.-> AG
    L -.inject.-> AG
    
    AG -->|new| CB
    AG -->|new| SB
    AG -->|new| MB
    AG -->|new| STB
    
    style L fill:#e1f5e1
    style E fill:#e1f5e1
    style F fill:#e1f5e1
    style TP fill:#fff4e1
    style AG fill:#fff4e1
    style CB fill:#e1e5f5
    style SB fill:#e1e5f5
    style MB fill:#e1e5f5
    style STB fill:#e1e5f5
```

**Légende** :
- 🟢 Vert : Services Singleton (instance unique)
- 🟡 Jaune : Orchestrateurs Singleton avec DI
- 🔵 Bleu : Builders (nouvelles instances à chaque génération)

---

## 📐 Diagramme de classes : Relations complètes

```mermaid
classDiagram
    class LoggerService {
        <<Singleton>>
    }
    
    class ElevationService {
        <<Singleton>>
    }
    
    class FileSystemService {
        <<Singleton>>
    }
    
    class TripParser {
        <<Singleton + DI>>
    }
    
    class ArtifactGenerator {
        <<Singleton + DI>>
    }
    
    class CoverBuilder {
        <<Builder>>
    }
    
    class StatsBuilder {
        <<Builder>>
    }
    
    class MapBuilder {
        <<Builder>>
    }
    
    class StepBuilder {
        <<Builder>>
    }
    
    class TripStore {
        <<Pinia Store>>
    }
    
    class useFileSelection {
        <<Composable>>
    }
    
    class useGeneration {
        <<Composable>>
    }
    
    class ViewerController {
        <<Controller>>
    }
    
    TripParser ..> FileSystemService : dépend
    TripParser ..> LoggerService : dépend
    
    ArtifactGenerator ..> ElevationService : dépend
    ArtifactGenerator ..> LoggerService : dépend
    ArtifactGenerator ..> CoverBuilder : crée
    ArtifactGenerator ..> StatsBuilder : crée
    ArtifactGenerator ..> MapBuilder : crée
    ArtifactGenerator ..> StepBuilder : crée
    
    TripStore ..> TripParser : utilise
    TripStore ..> ArtifactGenerator : utilise
    TripStore ..> FileSystemService : utilise
    
    useFileSelection ..> TripStore : utilise
    useGeneration ..> TripStore : utilise
    
    ViewerController ..> LoggerService : utilise
```

---

## 💡 Notes sur les diagrammes

### Comment lire les diagrammes

1. **Flèches pleines** (`-->`) : Composition/Utilisation directe
2. **Flèches pointillées** (`..>`) : Dépendance/Injection
3. **`-` (private)** : Membres privés
4. **`+` (public)** : Membres publics

### Patterns visualisés

- **Singleton** : `getInstance()` + constructeur privé
- **Builder** : Injection contexte via constructeur, méthode `build()`
- **Orchestrator** : Coordination de multiples services
- **Composable** : Logique réutilisable Vue
- **Controller** : Gestion logique UI complexe

### Rendu des diagrammes

Ces diagrammes Mermaid sont compatibles avec :
- ✅ GitHub (rendu automatique)
- ✅ VS Code (extension Mermaid Preview)
- ✅ Documentation générée (MkDocs, Docusaurus, etc.)
- ✅ Outils de visualisation Mermaid en ligne

---

**Fin du document**
