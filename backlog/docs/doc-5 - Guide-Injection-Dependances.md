# Guide d'Injection de Dépendances (DI)

**Date**: 28 octobre 2025  
**Public cible**: Développeurs Java/Spring familiers avec DI  
**Niveau**: Intermédiaire

---

## 📋 Table des Matières

1. [Qu'est-ce que l'Injection de Dépendances ?](#quest-ce-que-linjection-de-dépendances-)
2. [Comparaison Java Spring vs TypeScript Manuel](#comparaison-java-spring-vs-typescript-manuel)
3. [Implémentation dans Travel Book JS](#implémentation-dans-travel-book-js)
4. [Patterns de DI utilisés](#patterns-de-di-utilisés)
5. [Avantages et bénéfices](#avantages-et-bénéfices)
6. [Guide pratique : Ajouter une nouvelle classe](#guide-pratique--ajouter-une-nouvelle-classe)
7. [Tests unitaires avec DI](#tests-unitaires-avec-di)

---

## 🎯 Qu'est-ce que l'Injection de Dépendances ?

### Définition

L'**Injection de Dépendances** (Dependency Injection, DI) est un pattern de conception qui consiste à **fournir les dépendances d'une classe depuis l'extérieur** plutôt que de les créer à l'intérieur de la classe.

### Principe de base

Au lieu de :
```typescript
class MyService {
  constructor() {
    this.logger = new LoggerService()  // ❌ Création interne
  }
}
```

On fait :
```typescript
class MyService {
  constructor(private logger: LoggerService) {  // ✅ Injection externe
    // logger est fourni par l'appelant
  }
}
```

### Les 3 types d'injection

| Type | Description | Utilisé dans le projet |
|------|-------------|------------------------|
| **Constructor Injection** | Dépendances passées via constructeur | ✅ Oui (pattern principal) |
| **Setter Injection** | Dépendances définies via setters | ❌ Non |
| **Interface Injection** | Injection via méthode d'interface | ❌ Non |

**Dans Travel Book JS, nous utilisons exclusivement l'injection par constructeur.**

---

## 🔄 Comparaison Java Spring vs TypeScript Manuel

### Java avec Spring Framework

```java
// Service avec dépendances
@Service
public class TripParser {
    private final FileSystemService fileSystemService;
    private final LoggerService loggerService;
    
    @Autowired  // Injection automatique par Spring
    public TripParser(
        FileSystemService fileSystemService,
        LoggerService loggerService
    ) {
        this.fileSystemService = fileSystemService;
        this.loggerService = loggerService;
    }
    
    public void parse(Input input) {
        loggerService.info("Parsing trip...");
        File file = fileSystemService.readFile(input);
        // ...
    }
}

// Utilisation - Spring injecte automatiquement
@Autowired
private TripParser tripParser;  // Spring crée et injecte
```

**Caractéristiques** :
- ✅ Injection **automatique** via `@Autowired`
- ✅ Container IoC gère le cycle de vie
- ✅ Scan automatique des composants (`@Service`, `@Component`)
- ⚠️ "Magic" - difficile de tracer les dépendances

### TypeScript sans framework DI

```typescript
// Service avec dépendances
export class TripParser {
    private constructor(
        private readonly fileSystemService: FileSystemService,
        private readonly loggerService: LoggerService
    ) {}
    
    public parse(input: Input): void {
        this.loggerService.info('trip-parser', 'Parsing trip...')
        const file = this.fileSystemService.readFile(input)
        // ...
    }
    
    // Singleton pattern manuel
    private static instance: TripParser | null = null
    
    public static getInstance(): TripParser {
        if (!TripParser.instance) {
            // Injection MANUELLE des dépendances
            TripParser.instance = new TripParser(
                FileSystemService.getInstance(),
                LoggerService.getInstance()
            )
        }
        return TripParser.instance
    }
}

// Utilisation
export const tripParser = TripParser.getInstance()

// Dans le code
tripParser.parse(input)
```

**Caractéristiques** :
- ✅ Injection **manuelle** via constructeur
- ✅ Contrôle explicite des dépendances
- ✅ Pas de "magic" - code traçable
- ⚠️ Nécessite gestion manuelle du cycle de vie

---

## 🏗️ Implémentation dans Travel Book JS

### Architecture en couches

```
┌─────────────────────────────────────┐
│     Couche 1: Services Core         │
│  (Singletons sans dépendances)      │
│                                     │
│  LoggerService ←──┐                 │
│  ElevationService │ Pas de DI       │
│  FileSystemService│ (autonomes)     │
└─────────────────────────────────────┘
            ↓ injectés dans ↓
┌─────────────────────────────────────┐
│   Couche 2: Orchestrateurs          │
│   (Singletons avec DI)              │
│                                     │
│  TripParser(FS, Logger) ←──┐        │
│  ArtifactGenerator(Elev, Logger)│   │
│                            │ DI     │
│                            │ via    │
│                            │ ctor   │
└─────────────────────────────────────┘
            ↓ utilisent ↓
┌─────────────────────────────────────┐
│     Couche 3: Builders              │
│   (Instances avec contexte)         │
│                                     │
│  CoverBuilder(trip, photos, map)    │
│  StatsBuilder(trip, photos)         │
│  MapBuilder(trip, photos, map)      │
│  StepBuilder(trip, step, ...)       │
└─────────────────────────────────────┘
```

### Exemple complet : TripParser

#### 1. Services Core (Couche 1)

```typescript
// logger.service.ts
export class LoggerService {
    private static instance: LoggerService | null = null
    
    private constructor() {}  // Pas de dépendances
    
    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService()
        }
        return LoggerService.instance
    }
    
    public debug(scope: string, message: string): void {
        console.log(`[${scope}] ${message}`)
    }
}

export const loggerService = LoggerService.getInstance()
```

```typescript
// fs.service.ts
export class FileSystemService {
    private static instance: FileSystemService | null = null
    
    private constructor() {}  // Pas de dépendances
    
    public static getInstance(): FileSystemService {
        if (!FileSystemService.instance) {
            FileSystemService.instance = new FileSystemService()
        }
        return FileSystemService.instance
    }
    
    public async readFile(path: string): Promise<File> {
        // Logique lecture fichier
    }
}

export const fileSystemService = FileSystemService.getInstance()
```

#### 2. Orchestrateur avec DI (Couche 2)

```typescript
// parse.service.ts
import { FileSystemService, fileSystemService } from './fs.service'
import { LoggerService, loggerService } from './logger.service'

export class TripParser {
    // ✅ Injection de dépendances via constructeur
    private constructor(
        private readonly fileSystemService: FileSystemService,
        private readonly loggerService: LoggerService
    ) {}
    
    public async parse(input: FFInput): Promise<void> {
        this.loggerService.debug('trip-parser', 'Début parsing')
        
        // Utilisation des dépendances injectées
        const file = await this.fileSystemService.readFile('trip.json')
        
        // Logique métier
        const trip = this.processTripData(file)
        
        this.loggerService.debug('trip-parser', 'Parsing terminé')
    }
    
    private processTripData(file: File): Trip {
        // Logique privée
    }
    
    // Singleton avec injection manuelle
    private static instance: TripParser | null = null
    
    public static getInstance(): TripParser {
        if (!TripParser.instance) {
            // ✅ INJECTION MANUELLE ici
            TripParser.instance = new TripParser(
                fileSystemService,   // ← Instance singleton injectée
                loggerService        // ← Instance singleton injectée
            )
        }
        return TripParser.instance
    }
}

// Export singleton
export const tripParser = TripParser.getInstance()

// Export wrapper pour rétrocompatibilité
export async function parseTrip(input: FFInput): Promise<void> {
    return tripParser.parse(input)
}
```

#### 3. Utilisation dans le Store (Couche consommation)

```typescript
// trip.store.ts
import { tripParser } from '@/services/parse.service'

export const useTripStore = defineStore('trip', {
    actions: {
        async parseAndMap() {
            // ✅ Utilise l'instance singleton avec toutes ses dépendances déjà injectées
            await tripParser.parse(this.input)
        }
    }
})
```

---

## 🎨 Patterns de DI utilisés

### Pattern 1 : Service Singleton sans dépendances

**Quand l'utiliser** : Services utilitaires autonomes (Logger, FileSystem, Elevation)

```typescript
export class UtilityService {
    private static instance: UtilityService | null = null
    
    private constructor() {
        // Pas de paramètres = pas de dépendances
    }
    
    public static getInstance(): UtilityService {
        if (!UtilityService.instance) {
            UtilityService.instance = new UtilityService()
        }
        return UtilityService.instance
    }
    
    public doSomething(): void {
        // Logique autonome
    }
}

export const utilityService = UtilityService.getInstance()
```

**Avantages** :
- ✅ Simple et direct
- ✅ Pas de gestion de dépendances
- ✅ Instanciation unique garantie

---

### Pattern 2 : Orchestrateur Singleton avec DI

**Quand l'utiliser** : Classes qui orchestrent plusieurs services (TripParser, ArtifactGenerator)

```typescript
export class Orchestrator {
    private constructor(
        private readonly service1: Service1,
        private readonly service2: Service2
    ) {}
    
    public async execute(): Promise<Result> {
        // Utilise service1 et service2
        const data = await this.service1.fetchData()
        return this.service2.process(data)
    }
    
    private static instance: Orchestrator | null = null
    
    public static getInstance(): Orchestrator {
        if (!Orchestrator.instance) {
            // Injection manuelle des singletons
            Orchestrator.instance = new Orchestrator(
                Service1.getInstance(),
                Service2.getInstance()
            )
        }
        return Orchestrator.instance
    }
}

export const orchestrator = Orchestrator.getInstance()
```

**Avantages** :
- ✅ Dépendances explicites dans la signature du constructeur
- ✅ Facilite les tests (possibilité de mocker)
- ✅ Une seule instance de l'orchestrateur
- ✅ Réutilise les singletons des services

---

### Pattern 3 : Builder avec contexte injecté

**Quand l'utiliser** : Classes qui construisent des artefacts avec un contexte spécifique

```typescript
export class ArtifactBuilder {
    // ✅ Injection du contexte métier (trip, data, maps...)
    private constructor(
        private readonly trip: Trip,
        private readonly photosMapping: PhotosMapping,
        private readonly photoDataUrlMap: PhotoDataUrlMap
    ) {}
    
    public async build(): Promise<string> {
        // Utilise le contexte injecté
        const header = this.buildHeader()
        const content = await this.buildContent()
        return header + content
    }
    
    private buildHeader(): string {
        // Accès à this.trip, this.photosMapping
        return `<h1>${this.trip.name}</h1>`
    }
    
    private async buildContent(): Promise<string> {
        // Logique privée
    }
}

// ❌ PAS de singleton - nouvelle instance à chaque utilisation
// Utilisation :
const builder = new ArtifactBuilder(trip, photos, photoMap)
const html = await builder.build()
```

**Avantages** :
- ✅ Contexte immutable (`readonly`)
- ✅ Méthodes privées accèdent facilement au contexte
- ✅ Pas de singleton - nouveau contexte à chaque fois
- ✅ Code plus lisible (pas de passage de paramètres répétés)

---

## ✅ Avantages et bénéfices

### 1. Testabilité

#### Sans DI (difficile à tester)
```typescript
class MyService {
    constructor() {
        this.logger = new LoggerService()  // ❌ Impossible de mocker
    }
    
    public process(): void {
        this.logger.info('Processing...')
        // Logique métier
    }
}

// Test impossible de vérifier les appels au logger
```

#### Avec DI (facile à tester)
```typescript
class MyService {
    constructor(private logger: LoggerService) {}  // ✅ Injectable
    
    public process(): void {
        this.logger.info('my-service', 'Processing...')
    }
}

// Test avec mock
describe('MyService', () => {
    it('should log processing message', () => {
        const mockLogger = {
            info: vi.fn()
        } as unknown as LoggerService
        
        const service = new MyService(mockLogger)
        service.process()
        
        expect(mockLogger.info).toHaveBeenCalledWith('my-service', 'Processing...')
    })
})
```

---

### 2. Découplage

```typescript
// Interface (contrat)
interface StorageService {
    save(key: string, value: any): Promise<void>
    load(key: string): Promise<any>
}

// Implémentation 1 : LocalStorage
class LocalStorageService implements StorageService {
    async save(key: string, value: any): Promise<void> {
        localStorage.setItem(key, JSON.stringify(value))
    }
    // ...
}

// Implémentation 2 : IndexedDB
class IndexedDBService implements StorageService {
    async save(key: string, value: any): Promise<void> {
        // Logique IndexedDB
    }
    // ...
}

// Service qui utilise le storage
class DataService {
    constructor(private storage: StorageService) {}  // ✅ Dépend de l'interface
    
    async saveData(data: any): Promise<void> {
        await this.storage.save('data', data)
    }
}

// Utilisation - facile de changer d'implémentation
const service1 = new DataService(new LocalStorageService())
const service2 = new DataService(new IndexedDBService())
```

**Avantages** :
- ✅ `DataService` ne connaît pas l'implémentation concrète
- ✅ Changement d'implémentation sans modifier `DataService`
- ✅ Respecte le principe de substitution de Liskov (SOLID)

---

### 3. Réutilisabilité

```typescript
// Service réutilisable avec différents loggers
class ApiService {
    constructor(private logger: LoggerService) {}
    
    async fetch(url: string): Promise<any> {
        this.logger.debug('api', `Fetching ${url}`)
        // ...
    }
}

// Contexte 1 : Logger console
const consoleLogger = new ConsoleLogger()
const apiService1 = new ApiService(consoleLogger)

// Contexte 2 : Logger fichier
const fileLogger = new FileLogger()
const apiService2 = new ApiService(fileLogger)

// Contexte 3 : Logger silencieux (tests)
const silentLogger = new SilentLogger()
const apiService3 = new ApiService(silentLogger)
```

---

### 4. Maintenabilité

```typescript
// ❌ AVANT : Dépendances cachées
class TripParser {
    constructor() {
        // Impossible de savoir quelles sont les dépendances sans lire le code
    }
    
    parse() {
        const fs = new FileSystemService()  // Dépendance cachée
        const logger = new LoggerService()  // Dépendance cachée
        // ...
    }
}

// ✅ APRÈS : Dépendances explicites
class TripParser {
    constructor(
        private readonly fileSystemService: FileSystemService,
        private readonly loggerService: LoggerService
    ) {
        // ✅ Signature du constructeur = documentation des dépendances
    }
    
    parse() {
        this.fileSystemService.readFile()
        this.loggerService.debug('trip-parser', 'Parsing...')
    }
}
```

**Avantages** :
- ✅ Dépendances visibles dans la signature
- ✅ Facilite la compréhension du code
- ✅ Détecte les dépendances circulaires

---

## 📝 Guide pratique : Ajouter une nouvelle classe

### Cas 1 : Ajouter un nouveau service singleton

**Exemple** : Créer un `ValidationService`

```typescript
// 1. Créer le fichier validation.service.ts
export class ValidationService {
    private static instance: ValidationService | null = null
    
    private constructor() {
        // Pas de dépendances
    }
    
    public static getInstance(): ValidationService {
        if (!ValidationService.instance) {
            ValidationService.instance = new ValidationService()
        }
        return ValidationService.instance
    }
    
    public validateEmail(email: string): boolean {
        // Logique validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }
}

// Export singleton
export const validationService = ValidationService.getInstance()
```

---

### Cas 2 : Ajouter un orchestrateur avec dépendances

**Exemple** : Créer un `ExportService` qui dépend de `FileSystemService` et `LoggerService`

```typescript
// 1. Importer les dépendances
import { FileSystemService, fileSystemService } from './fs.service'
import { LoggerService, loggerService } from './logger.service'

// 2. Définir la classe avec injection
export class ExportService {
    private constructor(
        private readonly fileSystemService: FileSystemService,
        private readonly loggerService: LoggerService
    ) {}
    
    public async exportToFile(data: any, filename: string): Promise<void> {
        this.loggerService.info('export-service', `Exporting to ${filename}`)
        
        // Logique export
        const content = JSON.stringify(data, null, 2)
        await this.fileSystemService.writeFile(filename, content)
        
        this.loggerService.info('export-service', 'Export complete')
    }
    
    // 3. Singleton avec injection manuelle
    private static instance: ExportService | null = null
    
    public static getInstance(): ExportService {
        if (!ExportService.instance) {
            ExportService.instance = new ExportService(
                fileSystemService,  // ← Injection
                loggerService       // ← Injection
            )
        }
        return ExportService.instance
    }
}

// 4. Export singleton
export const exportService = ExportService.getInstance()
```

---

### Cas 3 : Ajouter un builder avec contexte

**Exemple** : Créer un `SummaryBuilder`

```typescript
export class SummaryBuilder {
    // Pas de singleton - contexte spécifique
    private constructor(
        private readonly trip: Trip,
        private readonly config: SummaryConfig
    ) {}
    
    public build(): string {
        let html = '<div class="summary">'
        html += this.buildTitle()
        html += this.buildStats()
        html += '</div>'
        return html
    }
    
    private buildTitle(): string {
        return `<h1>${this.trip.name}</h1>`
    }
    
    private buildStats(): string {
        const stepCount = this.trip.steps.length
        return `<p>${stepCount} étapes</p>`
    }
}

// Utilisation - nouvelle instance à chaque fois
const builder = new SummaryBuilder(trip, config)
const html = builder.build()
```

---

## 🧪 Tests unitaires avec DI

### Exemple : Tester TripParser

```typescript
// trip-parser.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TripParser } from '@/services/parse.service'
import { FileSystemService } from '@/services/fs.service'
import { LoggerService } from '@/services/logger.service'

describe('TripParser', () => {
    let mockFileSystem: FileSystemService
    let mockLogger: LoggerService
    let parser: TripParser
    
    beforeEach(() => {
        // 1. Créer des mocks
        mockFileSystem = {
            readFileFromPath: vi.fn(),
            readAllPhotos: vi.fn()
        } as unknown as FileSystemService
        
        mockLogger = {
            debug: vi.fn(),
            error: vi.fn()
        } as unknown as LoggerService
        
        // 2. Injecter les mocks via le constructeur
        // Note: en production, le constructeur est privé
        // Pour les tests, on utilise une instance de test ou on expose une factory
        parser = new (TripParser as any)(mockFileSystem, mockLogger)
    })
    
    it('should parse trip and log progress', async () => {
        // 3. Setup mock behavior
        const mockFile = new File(['{"name": "Test Trip"}'], 'trip.json')
        ;(mockFileSystem.readFileFromPath as any).mockResolvedValue(mockFile)
        ;(mockFileSystem.readAllPhotos as any).mockResolvedValue([])
        
        // 4. Execute
        await parser.parse({ /* input */ })
        
        // 5. Verify
        expect(mockLogger.debug).toHaveBeenCalledWith('trip-parser', expect.stringContaining('Début'))
        expect(mockFileSystem.readFileFromPath).toHaveBeenCalledWith(expect.anything(), ['trip.json'])
    })
    
    it('should handle errors and log them', async () => {
        // Setup
        const error = new Error('File not found')
        ;(mockFileSystem.readFileFromPath as any).mockRejectedValue(error)
        
        // Execute & Verify
        await expect(parser.parse({ /* input */ })).rejects.toThrow('File not found')
        expect(mockLogger.error).toHaveBeenCalledWith('trip-parser', expect.anything(), error)
    })
})
```

**Avantages des tests avec DI** :
- ✅ Mocks faciles à créer
- ✅ Comportement contrôlable
- ✅ Tests isolés (pas d'effet de bord)
- ✅ Vérification des interactions

---

## 📚 Comparaison avec d'autres approches

### Approche 1 : Variables globales (❌ À éviter)

```typescript
// globals.ts
export let logger: LoggerService | null = null
export let fileSystem: FileSystemService | null = null

export function initServices() {
    logger = new LoggerService()
    fileSystem = new FileSystemService()
}

// service.ts
import { logger, fileSystem } from './globals'

export async function parseTrip() {
    logger!.debug('Parsing...')  // ❌ Non-null assertion
    await fileSystem!.readFile()
}
```

**Problèmes** :
- ❌ État global mutable
- ❌ Difficile à tester
- ❌ Dépendances cachées
- ❌ Non-null assertions dangereuses

---

### Approche 2 : Factory functions (⚠️ Acceptable mais moins OOP)

```typescript
export function createTripParser(
    fileSystem: FileSystemService,
    logger: LoggerService
) {
    return {
        async parse(input: FFInput) {
            logger.debug('Parsing...')
            await fileSystem.readFile()
        }
    }
}

// Utilisation
const parser = createTripParser(fileSystemService, loggerService)
await parser.parse(input)
```

**Avantages** :
- ✅ Injection de dépendances
- ✅ Testable

**Inconvénients** :
- ⚠️ Pas de vraies classes (moins familier pour devs Java)
- ⚠️ Pas de visibilité explicite (public/private)
- ⚠️ Pas de typage fort pour `this`

---

### Approche 3 : Classes avec DI (✅ Notre choix)

```typescript
export class TripParser {
    private constructor(
        private readonly fileSystem: FileSystemService,
        private readonly logger: LoggerService
    ) {}
    
    public async parse(input: FFInput): Promise<void> {
        this.logger.debug('trip-parser', 'Parsing...')
        await this.fileSystem.readFile()
    }
    
    private static instance: TripParser | null = null
    public static getInstance(): TripParser {
        if (!TripParser.instance) {
            TripParser.instance = new TripParser(fileSystemService, loggerService)
        }
        return TripParser.instance
    }
}
```

**Avantages** :
- ✅ Classes ES2015 (familier pour devs Java)
- ✅ Injection de dépendances explicite
- ✅ Visibilité public/private
- ✅ Testable
- ✅ Singleton pattern clair

---

## 🎓 Résumé

### Règles d'or de la DI dans Travel Book JS

1. **Services Core** : Singletons sans dépendances
   - `LoggerService.getInstance()`
   - `ElevationService.getInstance()`
   - `FileSystemService.getInstance()`

2. **Orchestrateurs** : Singletons avec DI via constructeur
   - `new TripParser(fileSystemService, loggerService)`
   - `new ArtifactGenerator(elevationService, loggerService)`

3. **Builders** : Instances avec contexte injecté
   - `new CoverBuilder(trip, photosMapping, photoDataUrlMap)`
   - Pas de singleton - nouveau contexte à chaque fois

4. **Injection manuelle** : Explicite dans `getInstance()`
   ```typescript
   public static getInstance(): MyClass {
       if (!MyClass.instance) {
           MyClass.instance = new MyClass(
               Dependency1.getInstance(),
               Dependency2.getInstance()
           )
       }
       return MyClass.instance
   }
   ```

5. **Tests** : Injecter des mocks via constructeur

### Checklist pour ajouter une classe

- [ ] Identifier les dépendances nécessaires
- [ ] Décider : Singleton ou instance ?
- [ ] Injection via constructeur (`private readonly`)
- [ ] Méthodes publiques documentées (JSDoc)
- [ ] Méthodes privées pour décomposer la logique
- [ ] Tests avec mocks si nécessaire

---

**Fin du guide**
