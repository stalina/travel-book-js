# Architecture ES2015/OOP du Projet Travel Book JS

**Date**: 28 octobre 2025  
**Auteur**: Refactorisation ES2015  
**Version**: 1.0

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Patterns Architecturaux](#patterns-architecturaux)
3. [Structure des Classes](#structure-des-classes)
4. [Injection de Dépendances](#injection-de-dépendances)
5. [Exemples Avant/Après](#exemples-avantaprès)
6. [Glossaire Java ↔ TypeScript](#glossaire-java--typescript)
7. [Guide pour Développeurs Java](#guide-pour-développeurs-java)

---

## 📐 Vue d'ensemble

Le projet Travel Book JS a été refactorisé pour adopter une architecture orientée objet (OOP) utilisant les classes ES2015 de TypeScript. Cette architecture est conçue pour être familière aux développeurs issus du monde Java.

### Objectifs de l'architecture

- ✅ **Maintenabilité** : Code organisé en classes avec responsabilités claires
- ✅ **Testabilité** : Injection de dépendances explicite pour faciliter les mocks
- ✅ **Réutilisabilité** : Singletons et builders réutilisables
- ✅ **Lisibilité** : Visibilité explicite (public/private), documentation JSDoc

### Couches Architecturales

```
┌─────────────────────────────────────────┐
│         Composants Vue (Views)          │  ← Présentation
│  HomeView, GenerationView, ViewerView  │
├─────────────────────────────────────────┤
│       Composables & Controllers         │  ← Logique UI
│   useFileSelection, ViewerController    │
├─────────────────────────────────────────┤
│           Store Pinia (State)           │  ← Gestion d'état
│            TripStore                    │
├─────────────────────────────────────────┤
│        Orchestrateurs (Services)        │  ← Logique métier
│   TripParser, ArtifactGenerator         │
├─────────────────────────────────────────┤
│            Builders (HTML)              │  ← Construction artefacts
│  Cover, Stats, Map, Step Builders       │
├─────────────────────────────────────────┤
│        Services Core (Singletons)       │  ← Utilitaires
│  Logger, Elevation, FileSystem          │
└─────────────────────────────────────────┘
```

---

## 🎯 Patterns Architecturaux

### 1. Pattern Singleton

**Objectif** : Une seule instance pour les services stateless (Logger, Elevation, FileSystem).

**Structure** :
```typescript
export class ServiceName {
  private static instance: ServiceName | null = null
  
  private constructor() {
    // Constructeur privé empêche new ServiceName()
  }
  
  public static getInstance(): ServiceName {
    if (!ServiceName.instance) {
      ServiceName.instance = new ServiceName()
    }
    return ServiceName.instance
  }
  
  public someMethod(): void {
    // Logique métier
  }
}

// Export singleton
export const serviceName = ServiceName.getInstance()
```

**Services utilisant ce pattern** :
- `LoggerService`
- `ElevationService`
- `FileSystemService`

---

### 2. Pattern Builder avec Injection de Contexte

**Objectif** : Construire des artefacts HTML complexes avec toutes les dépendances injectées via le constructeur.

**Structure** :
```typescript
export class BuilderName {
  private constructor(
    private readonly dependency1: Type1,
    private readonly dependency2: Type2
  ) {}
  
  public async build(): Promise<string> {
    // Orchestration de méthodes privées
    const part1 = this.buildPart1()
    const part2 = await this.buildPart2()
    return part1 + part2
  }
  
  private buildPart1(): string {
    // Logique privée
  }
  
  private async buildPart2(): Promise<string> {
    // Logique privée asynchrone
  }
}
```

**Builders utilisant ce pattern** :
- `CoverBuilder(trip, photosMapping, photoDataUrlMap)`
- `StatsBuilder(trip, photosMapping)`
- `MapBuilder(trip, photosMapping, photoDataUrlMap)`
- `StepBuilder(trip, step, photosMapping, photoDataUrlMap, stepPlan?)`

**Pas de singleton** : Un nouveau builder est instancié à chaque génération.

---

### 3. Pattern Orchestrateur

**Objectif** : Coordonner plusieurs services et builders pour réaliser un processus métier complexe.

**Structure** :
```typescript
export class OrchestratorName {
  private constructor(
    private readonly service1: Service1,
    private readonly service2: Service2
  ) {}
  
  public async execute(input: Input): Promise<Output> {
    // Étape 1
    await this.service1.operation1()
    
    // Étape 2
    const intermediate = await this.processStep2()
    
    // Étape 3
    return this.service2.operation2(intermediate)
  }
  
  private async processStep2(): Promise<IntermediateResult> {
    // Logique privée d'orchestration
  }
  
  // Singleton
  private static instance: OrchestratorName | null = null
  public static getInstance(): OrchestratorName {
    if (!OrchestratorName.instance) {
      OrchestratorName.instance = new OrchestratorName(service1, service2)
    }
    return OrchestratorName.instance
  }
}

export const orchestratorName = OrchestratorName.getInstance()
```

**Orchestrateurs utilisant ce pattern** :
- `TripParser(fileSystemService, loggerService)` : Parse les données de voyage
- `ArtifactGenerator(elevationService, loggerService)` : Génère le travel book complet

---

## 🏗️ Structure des Classes

### Services Core (Singletons)

#### LoggerService
```typescript
class LoggerService {
  - timestamps: Map<string, number>
  - constructor()
  + getInstance(): LoggerService
  + debug(scope: string, message: string, extra?: any): void
  + info(scope: string, message: string, extra?: any): void
  + warn(scope: string, message: string, extra?: any): void
  + error(scope: string, message: string, error?: any): void
  + time(label: string): void
  + timeEnd(label: string, shouldLog?: boolean): number
}
```

#### ElevationService
```typescript
class ElevationService {
  - cache: Map<string, number>
  - constructor()
  + getInstance(): ElevationService
  + getElevation(lat: number, lon: number): Promise<number | null>
  + getElevationsBulk(coords: Coord[]): Promise<(number | null)[]>
  - fetchBatch(coords: Coord[]): Promise<(number | null)[]>
  - getCacheKey(lat: number, lon: number): string
}
```

#### FileSystemService
```typescript
class FileSystemService {
  - constructor()
  + getInstance(): FileSystemService
  + readTripDirectory(): Promise<FFInput>
  + readFileFromPath(input: FFInput, path: string[]): Promise<File | null>
  + readAllPhotos(input: FFInput, slug: string, stepId: number): Promise<File[]>
}
```

---

### Builders

#### CoverBuilder
```typescript
class CoverBuilder {
  - constructor(trip: Trip, photosMapping: PhotosMapping, photoDataUrlMap: PhotoDataUrlMap)
  + build(): string
  - extractYear(): number
  - getCoverPhotoUrl(): string | null
  - buildWithPhoto(photoUrl: string): string
  - buildWithoutPhoto(): string
}
```

#### StatsBuilder
```typescript
class StatsBuilder {
  - constructor(trip: Trip, photosMapping: PhotosMapping)
  + build(): string
  - extractUniqueCountries(): string[]
  - calculateTotalKm(): number
  - calculateDuration(): number
  - countSteps(): number
  - countPhotos(): number
  - calculateMaxDistance(): number
  - buildCountriesSection(): string
  - buildMetricsSection(): string
}
```

#### MapBuilder
```typescript
class MapBuilder {
  - constructor(trip: Trip, photosMapping: PhotosMapping, photoDataUrlMap: PhotoDataUrlMap)
  + build(): Promise<string>
  - calculateBoundingBox(): BoundingBox
  - calculateViewBox(): string
  - latLonToSvg(lat: number, lon: number, bbox: BoundingBox): Point
  - generatePathData(): string
  - generateStepMarkers(): Promise<string>
}
```

#### StepBuilder
```typescript
class StepBuilder {
  - constructor(trip: Trip, step: Step, photosMapping: PhotosMapping, photoDataUrlMap: PhotoDataUrlMap, stepPlan?: StepPlan)
  + build(): Promise<string>
  - planLayout(): StepLayout
  - calculateMapDotPosition(): Promise<{ top: number, left: number }>
  - buildStepInfo(): string
  - calculateTripPercentage(): number
  - calculateDayNumber(): number
  - ccToEmoji(code: string): string
  - resolvedPhotoUrl(photoIndex: number): string
  - buildCoverPageWithPhoto(photoIndex: number): string
  - buildCoverPageWithoutPhoto(): string
  - buildPhotoPage(photoIndices: number[]): string
  - buildOneOrTwoPhotosPage(photos: PhotoInfo[]): string
  - buildThreeOrFourPhotosPage(photos: PhotoInfo[]): string
}
```

---

### Orchestrateurs

#### TripParser
```typescript
class TripParser {
  - constructor(fileSystemService: FileSystemService, loggerService: LoggerService)
  + getInstance(): TripParser
  + parse(input: FFInput): Promise<void>
  - loadTripJson(input: FFInput): Promise<any>
  - mapToTrip(tripJson: any): Trip
  - loadStepPhotos(input: FFInput, trip: Trip): Promise<Record<number, File[]>>
  - saveToWindow(trip: Trip, stepPhotos: Record<number, File[]>): void
}
```

#### ArtifactGenerator
```typescript
class ArtifactGenerator {
  - constructor(elevationService: ElevationService, loggerService: LoggerService)
  + getInstance(): ArtifactGenerator
  + generate(input: FFInput, options?: GenerateOptions): Promise<GeneratedArtifacts>
  + buildSingleFileHtml(artifacts: GeneratedArtifacts): Promise<Blob>
  + buildSingleFileHtmlString(artifacts: GeneratedArtifacts): Promise<string>
  - loadAssets(manifest: Manifest): Promise<void>
  - preloadElevations(trip: Trip): Promise<void>
  - processPhotos(trip: Trip, stepPhotos: StepPhotos, manifest: Manifest, photoDataUrlMap: PhotoDataUrlMap): Promise<PhotosMapping>
  - generatePhotosPlan(trip: Trip, photosMapping: PhotosMapping): string[]
  - loadCountryMaps(trip: Trip, manifest: Manifest): Promise<void>
  - buildHtmlHead(): Promise<string>
  - parseUserPlan(userPlanText: string): Record<number, StepPlan>
  - buildHtmlBody(trip: Trip, photosMapping: PhotosMapping, photoDataUrlMap: PhotoDataUrlMap, planByStep: PlanByStep): Promise<string>
  - normalizePath(...parts: string[]): string
  - guessRatio(w: number, h: number): Ratio
  - fileToDataUrl(file: File): Promise<string>
  - createPlaceholderSvg(code: string): Blob
}
```

---

## 💉 Injection de Dépendances

### Principe

L'injection de dépendances (DI) consiste à fournir les dépendances d'une classe via son **constructeur** plutôt que de les créer à l'intérieur de la classe.

### Avantages

1. **Testabilité** : Facilite le mock des dépendances dans les tests
2. **Découplage** : La classe ne dépend que d'interfaces, pas d'implémentations concrètes
3. **Flexibilité** : Permet de changer l'implémentation sans modifier le code client

### Exemple : TripParser

```typescript
// ❌ AVANT : Couplage fort, difficile à tester
export async function parseTrip(input: FFInput) {
  // Appel direct aux fonctions globales
  const tripFile = await readFileFromPath(input, ['trip.json'])
  logDebug('Parsing trip...')
  // ...
}

// ✅ APRÈS : Injection de dépendances
export class TripParser {
  private constructor(
    private readonly fileSystemService: FileSystemService,  // Injecté
    private readonly loggerService: LoggerService            // Injecté
  ) {}
  
  public async parse(input: FFInput): Promise<void> {
    // Utilise les dépendances injectées
    const tripFile = await this.fileSystemService.readFileFromPath(input, ['trip.json'])
    this.loggerService.debug('trip-parser', 'Parsing trip...')
    // ...
  }
}
```

### Pattern utilisé dans le projet

```typescript
// 1. Services Core : Singletons sans dépendances
const loggerService = LoggerService.getInstance()
const elevationService = ElevationService.getInstance()
const fileSystemService = FileSystemService.getInstance()

// 2. Orchestrateurs : Singletons avec injection de services
const tripParser = new TripParser(fileSystemService, loggerService)
const artifactGenerator = new ArtifactGenerator(elevationService, loggerService)

// 3. Builders : Nouvelles instances avec injection de contexte
const coverBuilder = new CoverBuilder(trip, photosMapping, photoDataUrlMap)
const statsBuilder = new StatsBuilder(trip, photosMapping)
// ...
```

---

## 🔄 Exemples Avant/Après

### Exemple 1 : LoggerService

#### ❌ Avant (Fonctions globales)
```typescript
// logger.service.ts
const timestamps = new Map<string, number>()

export function logDebug(message: string, extra?: any): void {
  console.log(`[DEBUG] ${message}`, extra)
}

export function logTime(label: string): void {
  timestamps.set(label, Date.now())
}

// Utilisation
import { logDebug, logTime } from './logger.service'
logDebug('Message')
logTime('operation')
```

#### ✅ Après (Classe Singleton)
```typescript
// logger.service.ts
export class LoggerService {
  private timestamps = new Map<string, number>()
  
  private constructor() {}
  
  private static instance: LoggerService | null = null
  
  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }
  
  public debug(scope: string, message: string, extra?: any): void {
    console.log(`[TravelBook][${scope}] ${message}`, extra)
  }
  
  public time(label: string): void {
    this.timestamps.set(label, Date.now())
  }
}

export const loggerService = LoggerService.getInstance()

// Utilisation
import { loggerService } from './logger.service'
loggerService.debug('myScope', 'Message')
loggerService.time('operation')
```

**Avantages** :
- ✅ Encapsulation de l'état (`timestamps`)
- ✅ Méthodes organisées dans une classe
- ✅ Export singleton pour faciliter l'utilisation

---

### Exemple 2 : StatsBuilder

#### ❌ Avant (Fonction avec contexte)
```typescript
// stats.builder.ts
export async function buildStatsSection(context: {
  trip: Trip,
  photosMapping: Record<number, Record<number, any>>
}): Promise<string> {
  const { trip, photosMapping } = context
  
  // Calculs
  const countries = Array.from(new Set(trip.steps.map(s => s.country_code)))
  const totalKm = trip.steps.reduce((sum, s) => sum + (s.distance || 0), 0)
  
  // Construction HTML
  let html = '<div class="stats-page">'
  html += '<h2>Statistiques</h2>'
  html += `<p>Pays: ${countries.length}</p>`
  html += `<p>Distance: ${totalKm} km</p>`
  html += '</div>'
  
  return html
}
```

#### ✅ Après (Classe Builder)
```typescript
// stats.builder.ts
export class StatsBuilder {
  private constructor(
    private readonly trip: Trip,
    private readonly photosMapping: Record<number, Record<number, any>>
  ) {}
  
  public build(): string {
    const countries = this.extractUniqueCountries()
    const totalKm = this.calculateTotalKm()
    
    return this.buildHtml(countries, totalKm)
  }
  
  private extractUniqueCountries(): string[] {
    return Array.from(new Set(this.trip.steps.map(s => s.country_code)))
  }
  
  private calculateTotalKm(): number {
    return this.trip.steps.reduce((sum, s) => sum + (s.distance || 0), 0)
  }
  
  private buildHtml(countries: string[], totalKm: number): string {
    let html = '<div class="stats-page">'
    html += '<h2>Statistiques</h2>'
    html += `<p>Pays: ${countries.length}</p>`
    html += `<p>Distance: ${totalKm} km</p>`
    html += '</div>'
    return html
  }
}

// Utilisation
const builder = new StatsBuilder(trip, photosMapping)
const html = builder.build()
```

**Avantages** :
- ✅ Méthodes privées pour décomposer la logique
- ✅ Injection du contexte via constructeur
- ✅ Visibilité explicite (public/private)
- ✅ Meilleure testabilité

---

### Exemple 3 : TripParser (Orchestrateur)

#### ❌ Avant (Fonction avec dépendances globales)
```typescript
// parse.service.ts
import { readFileFromPath, readAllPhotos } from './fs.service'

export async function parseTrip(input: FFInput): Promise<void> {
  // Lecture fichier
  const tripFile = await readFileFromPath(input, ['trip.json'])
  if (!tripFile) throw new Error('trip.json introuvable')
  
  const tripJson = JSON.parse(await tripFile.text())
  
  // Mapping
  const trip: Trip = {
    id: tripJson.id,
    name: tripJson.name,
    // ...
  }
  
  // Chargement photos
  const stepPhotos: Record<number, File[]> = {}
  for (const step of trip.steps) {
    stepPhotos[step.id] = await readAllPhotos(input, step.slug, step.id)
  }
  
  // Sauvegarde
  ;(window as any).__parsedTrip = { trip, stepPhotos }
}
```

#### ✅ Après (Classe Orchestrateur)
```typescript
// parse.service.ts
export class TripParser {
  private constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly loggerService: LoggerService
  ) {}
  
  public async parse(input: FFInput): Promise<void> {
    try {
      this.loggerService.debug('trip-parser', 'Début du parsing')
      
      const tripJson = await this.loadTripJson(input)
      const trip = this.mapToTrip(tripJson)
      const stepPhotos = await this.loadStepPhotos(input, trip)
      
      this.saveToWindow(trip, stepPhotos)
      
      this.loggerService.debug('trip-parser', `Parsing terminé: ${trip.steps.length} étapes`)
    } catch (error) {
      this.loggerService.error('trip-parser', 'Erreur lors du parsing', error)
      throw error
    }
  }
  
  private async loadTripJson(input: FFInput): Promise<any> {
    const tripFile = await this.fileSystemService.readFileFromPath(input, ['trip.json'])
    if (!tripFile) throw new Error('trip.json introuvable')
    return JSON.parse(await tripFile.text())
  }
  
  private mapToTrip(tripJson: any): Trip {
    return {
      id: tripJson.id,
      name: tripJson.name,
      steps: tripJson.all_steps.map(s => ({
        name: s.display_name,
        // ...
      }))
    }
  }
  
  private async loadStepPhotos(input: FFInput, trip: Trip): Promise<Record<number, File[]>> {
    const stepPhotos: Record<number, File[]> = {}
    for (const step of trip.steps) {
      stepPhotos[step.id] = await this.fileSystemService.readAllPhotos(input, step.slug, step.id)
    }
    return stepPhotos
  }
  
  private saveToWindow(trip: Trip, stepPhotos: Record<number, File[]>): void {
    ;(window as any).__parsedTrip = { trip, stepPhotos }
  }
  
  // Singleton
  private static instance: TripParser | null = null
  
  public static getInstance(): TripParser {
    if (!TripParser.instance) {
      TripParser.instance = new TripParser(fileSystemService, loggerService)
    }
    return TripParser.instance
  }
}

export const tripParser = TripParser.getInstance()

// Wrapper rétrocompatible
export async function parseTrip(input: FFInput): Promise<void> {
  return tripParser.parse(input)
}
```

**Avantages** :
- ✅ Injection de dépendances (fileSystemService, loggerService)
- ✅ Méthodes privées pour décomposer la logique
- ✅ Gestion d'erreurs centralisée avec logging
- ✅ Testabilité : possibilité de mocker les services
- ✅ Wrapper pour rétrocompatibilité

---

## 📖 Glossaire Java ↔ TypeScript

| Concept Java | Équivalent TypeScript ES2015 | Notes |
|--------------|------------------------------|-------|
| `class MyClass` | `class MyClass` | Identique |
| `public class` | `export class` | Export pour utilisation externe |
| `private constructor()` | `private constructor()` | Empêche `new MyClass()` |
| `public static getInstance()` | `public static getInstance()` | Pattern Singleton |
| `private final String name` | `private readonly name: string` | Immutable après construction |
| `public void method()` | `public method(): void` | Type de retour explicite |
| `@Override` | Pas d'annotation | TypeScript vérifie automatiquement |
| `interface MyInterface` | `interface MyInterface` | Identique |
| `implements MyInterface` | `implements MyInterface` | Identique |
| `extends BaseClass` | `extends BaseClass` | Identique |
| `this.` | `this.` | Identique |
| `super()` | `super()` | Identique |
| `static final` | `static readonly` | Constante de classe |
| `Map<K, V>` | `Map<K, V>` | Identique (ES2015) |
| `List<T>` | `T[]` ou `Array<T>` | Tableaux TypeScript |
| `Optional<T>` | `T \| null` ou `T \| undefined` | Types union |
| `throws Exception` | `throws Error` | Exceptions TypeScript |
| `try-catch-finally` | `try-catch-finally` | Identique |
| `package com.example` | Dossiers `src/services/` | Pas de packages, organisation par dossiers |
| `import com.example.MyClass` | `import { MyClass } from './path'` | Imports ES6 |
| JavaDoc `/** */` | JSDoc `/** */` | Documentation identique |
| `@Inject` | Injection manuelle via constructeur | Pas d'annotation DI |

---

## 👨‍💻 Guide pour Développeurs Java

### Similarités avec Java

1. **Classes et Objets** : Syntaxe quasi-identique
   ```java
   // Java
   public class MyService {
       private String name;
       public MyService(String name) {
           this.name = name;
       }
   }
   ```
   ```typescript
   // TypeScript
   export class MyService {
       private name: string
       public constructor(name: string) {
           this.name = name
       }
   }
   ```

2. **Singleton Pattern** : Implémentation similaire
   ```java
   // Java
   public class Singleton {
       private static Singleton instance;
       private Singleton() {}
       public static Singleton getInstance() {
           if (instance == null) {
               instance = new Singleton();
           }
           return instance;
       }
   }
   ```
   ```typescript
   // TypeScript
   export class Singleton {
       private static instance: Singleton | null = null
       private constructor() {}
       public static getInstance(): Singleton {
           if (!Singleton.instance) {
               Singleton.instance = new Singleton()
           }
           return Singleton.instance
       }
   }
   ```

3. **Injection de Dépendances** : Même principe
   ```java
   // Java (Spring)
   @Service
   public class MyService {
       private final MyRepository repository;
       
       @Autowired
       public MyService(MyRepository repository) {
           this.repository = repository;
       }
   }
   ```
   ```typescript
   // TypeScript (manuel)
   export class MyService {
       private constructor(
           private readonly repository: MyRepository
       ) {}
   }
   ```

### Différences Clés

1. **Pas d'annotations DI** : Injection manuelle
   - Java utilise `@Autowired`, `@Inject`
   - TypeScript nécessite injection manuelle via constructeur

2. **Types optionnels** : `T | null` au lieu de `Optional<T>`
   ```typescript
   function findUser(id: number): User | null {
       // Retourne User ou null
   }
   ```

3. **Async/Await** : Au lieu de `CompletableFuture`
   ```typescript
   async function loadData(): Promise<Data> {
       const result = await fetchData()
       return processData(result)
   }
   ```

4. **Pas de surcharge de méthodes** : Utiliser paramètres optionnels
   ```typescript
   // Au lieu de surcharger
   public method(param?: string): void {
       // param peut être undefined
   }
   ```

### Bonnes Pratiques

1. **Toujours typer** : Éviter `any`
   ```typescript
   // ❌ Éviter
   function process(data: any): any { }
   
   // ✅ Préférer
   function process(data: InputData): OutputData { }
   ```

2. **Utiliser `readonly` pour l'immutabilité**
   ```typescript
   private readonly config: Config
   ```

3. **Documenter avec JSDoc**
   ```typescript
   /**
    * Calcule la distance entre deux points
    * @param p1 - Premier point
    * @param p2 - Deuxième point
    * @returns Distance en kilomètres
    */
   public calculateDistance(p1: Point, p2: Point): number {
       // ...
   }
   ```

4. **Organiser par responsabilité**
   ```
   src/
     services/        ← Services core (Logger, Elevation, etc.)
     builders/        ← Builders HTML
     controllers/     ← Contrôleurs UI
     composables/     ← Composables Vue
     stores/          ← Stores Pinia
     models/          ← Types et interfaces
   ```

---

## 📚 Références

- [Documentation TypeScript Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [Pattern Singleton](https://refactoring.guru/design-patterns/singleton)
- [Pattern Builder](https://refactoring.guru/design-patterns/builder)
- [Dependency Injection](https://martinfowler.com/articles/injection.html)

---

**Fin du document**
