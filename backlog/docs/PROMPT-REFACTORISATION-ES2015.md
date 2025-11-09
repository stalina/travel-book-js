# Prompt GitHub Copilot : Refactorisation ES2015 Architecture OOP

**Objectif** : Guider GitHub Copilot pour refactoriser le projet Travel Book JS vers une architecture orientée objet (OOP) avec classes ES2015, accessible aux développeurs Java.

---

## 🎯 Contexte du Projet

Tu travailles sur **Travel Book JS**, un générateur de livres de voyage côté navigateur (Vue.js + TypeScript). Le projet utilise actuellement une **approche fonctionnelle** (fonctions exportées, état global) et doit être **refactorisé en architecture OOP** (classes ES2015) pour être plus accessible aux développeurs Java.

### Technologies
- **Frontend** : Vue 3 (Composition API), TypeScript, Vite
- **Store** : Pinia
- **Tests** : Vitest
- **Contrainte** : Tout s'exécute côté navigateur (pas de Node.js runtime)

---

## 🏗️ Principes de Refactorisation

### 1. Pattern Singleton pour Services Stateless

Les services sans état métier (Logger, Elevation, FileSystem) deviennent des **singletons**.

**Pattern à suivre** :
```typescript
export class LoggerService {
  private static instance: LoggerService
  private debugEnabled = false
  
  private constructor() {} // ⚠️ PRIVÉ
  
  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }
  
  public setDebugEnabled(enabled: boolean): void {
    this.debugEnabled = enabled
  }
  
  public debug(module: string, message: string, data?: any): void {
    if (!this.debugEnabled) return
    console.log(`[DEBUG][${module}]`, message, data)
  }
}

// Export singleton
export const loggerService = LoggerService.getInstance()
```

**Règles** :
- Constructeur **TOUJOURS PRIVÉ** (`private constructor()`)
- Factory statique `getInstance()` public
- Export singleton `export const serviceName = ServiceClass.getInstance()`
- État de configuration OK (ex: `debugEnabled`), pas d'état métier

---

### 2. Pattern Builder avec Contexte Injecté

Les builders (Cover, Stats, Map, Step) ont un **état contextuel** → classes instanciables.

**Pattern à suivre** :
```typescript
import { Trip, PhotosMapping, DataUrlMap } from '../../models/types'
import { loggerService } from '../core/LoggerService'

export class CoverBuilder {
  constructor(
    private readonly trip: Trip,
    private readonly photosMapping: PhotosMapping,
    private readonly photoDataUrlMap: DataUrlMap
  ) {}
  
  public build(): string {
    loggerService.debug('CoverBuilder', 'Building cover section')
    
    const year = this.extractYear()
    const coverUrl = this.selectCoverPhoto()
    
    return this.generateHtml(year, coverUrl)
  }
  
  private extractYear(): number {
    return new Date(this.trip.start_date * 1000).getFullYear()
  }
  
  private selectCoverPhoto(): string | null {
    // Utilise this.trip, this.photosMapping
    return null
  }
  
  private generateHtml(year: number, coverUrl: string | null): string {
    return `<div class="cover-page">...</div>`
  }
}
```

**Règles** :
- Dépendances injectées via **constructeur** (jamais créées en interne)
- Propriétés `private readonly` pour contexte immutable
- Une méthode publique principale : `build(): string`
- Méthodes privées pour logique interne (`private helper()`)
- Utilisation : `const builder = new CoverBuilder(trip, ...); const html = builder.build()`

---

### 3. Pattern Orchestrateur avec Injection de Dépendances

Les services métier (ArtifactGenerator, TripParser) **orchestrent** d'autres services/builders.

**Pattern à suivre** :
```typescript
import { LoggerService, loggerService } from '../core/LoggerService'
import { ElevationService, elevationService } from '../core/ElevationService'
import { CoverBuilder } from '../builders/CoverBuilder'
import { StatsBuilder } from '../builders/StatsBuilder'

export class ArtifactGenerator {
  constructor(
    private readonly logger: LoggerService,
    private readonly elevationService: ElevationService
  ) {}
  
  public async generate(input: FFInput, options?: GenerateOptions): Promise<Artifacts> {
    this.logger.info('ArtifactGenerator', 'Starting generation')
    
    const { trip, stepPhotos } = await this.loadTripData()
    const { photosMapping, photoDataUrlMap } = await this.processPhotos(trip, stepPhotos)
    
    // Créer les builders (PAS de singleton ici, chaque instance a son contexte)
    const coverBuilder = new CoverBuilder(trip, photosMapping, photoDataUrlMap)
    const coverHtml = coverBuilder.build()
    
    const statsBuilder = new StatsBuilder(trip, photosMapping)
    const statsHtml = statsBuilder.build()
    
    return this.buildArtifacts(coverHtml, statsHtml)
  }
  
  private async loadTripData(): Promise<TripData> {
    // Logique privée
  }
  
  private async processPhotos(trip: Trip, stepPhotos: StepPhotos): Promise<PhotoData> {
    // Logique privée
  }
  
  private buildArtifacts(...args: any[]): Artifacts {
    return { manifest: {} }
  }
}

// Export singleton (orchestrateur peut être singleton)
export const artifactGenerator = new ArtifactGenerator(
  loggerService,
  elevationService
)

export async function generateArtifacts(input: FFInput, options?: GenerateOptions) {
  return artifactGenerator.generate(input, options)
}
```

**Règles** :
- Injecter **services singletons** via constructeur
- Créer **instances de builders** (pas de singleton pour builders)
- Une méthode publique principale (ex: `generate()`, `parse()`)
- Méthodes privées pour sous-étapes
- Export singleton + wrapper fonction si rétrocompatibilité nécessaire

---

### 4. Pattern Composable Vue avec Classe TypeScript

Les composants Vue utilisent des **composables** (classes TypeScript) pour la logique métier.

**Pattern à suivre** :
```typescript
// composables/useFileSelection.ts
import { ref, computed, Ref, ComputedRef } from 'vue'
import { useTripStore } from '../stores/trip.store'

export class FileSelectionController {
  private store = useTripStore()
  private fileInputRef = ref<HTMLInputElement | null>(null)
  
  public readonly ready: ComputedRef<boolean>
  public readonly fileInput: Ref<HTMLInputElement | null>
  
  constructor() {
    this.fileInput = this.fileInputRef
    this.ready = computed(() => this.store.hasInput)
  }
  
  public pickDirectory(): void {
    if ('showDirectoryPicker' in window) {
      this.store.pickDirectory()
    } else {
      this.fileInputRef.value?.click()
    }
  }
  
  public onFilesPicked(e: Event): void {
    const input = e.target as HTMLInputElement
    if (input.files) this.store.setFiles(input.files)
  }
  
  public onDrop(e: DragEvent): void {
    const items = e.dataTransfer?.items
    if (items) this.store.handleDropItems(items)
  }
}

// Factory function (convention Vue composable)
export function useFileSelection(): FileSelectionController {
  return new FileSelectionController()
}
```

**Usage dans Vue** :
```vue
<script setup lang="ts">
import { useFileSelection } from '../composables/useFileSelection'

const fileSelection = useFileSelection()
</script>

<template>
  <button @click="fileSelection.pickDirectory()">Sélectionner</button>
  <input ref="fileSelection.fileInput" @change="fileSelection.onFilesPicked" />
  <div @drop.prevent="fileSelection.onDrop">Drop zone</div>
</template>
```

**Règles** :
- Classe pour la logique, fonction factory `use*()` pour l'export
- Refs/Computed exposés comme `public readonly`
- Méthodes publiques pour événements (`onClick`, `onDrop`)
- Méthodes privées pour logique interne

---

## 📐 Conventions de Code

### Visibilité

**TOUJOURS spécifier** `public` ou `private` (comme en Java).

```typescript
export class MyService {
  // ✅ BON
  public doSomething(): void { }
  private helper(): void { }
  
  // ❌ MAUVAIS (pas de visibilité)
  doSomething(): void { }
  helper(): void { }
}
```

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Classe de service | `*Service` | `LoggerService`, `ElevationService` |
| Classe builder | `*Builder` | `CoverBuilder`, `MapBuilder` |
| Classe parser | `*Parser` | `TripParser` |
| Classe controller | `*Controller` | `FileSelectionController` |
| Instance singleton | camelCase | `loggerService`, `artifactGenerator` |
| Méthode publique | camelCase | `build()`, `generate()`, `parse()` |
| Méthode privée | camelCase | `extractYear()`, `loadTripData()` |
| Composable | `use*` | `useFileSelection()`, `useGeneration()` |

### Propriétés

```typescript
class Example {
  // Configuration/état interne → private
  private debugEnabled = false
  
  // Dépendances injectées → private readonly
  private readonly logger: LoggerService
  
  // Contexte immutable → private readonly
  private readonly trip: Trip
  
  // Singleton instance → private static
  private static instance: Example
}
```

### Imports

Ordre des imports :
```typescript
// 1. Externe (npm)
import { Trip } from '../../models/types'

// 2. Services core
import { LoggerService, loggerService } from '../core/LoggerService'

// 3. Builders/parsers
import { CoverBuilder } from '../builders/CoverBuilder'

// 4. Types/interfaces locaux
import type { BuilderContext } from './types'
```

---

## 🔄 Migration Progressive

### Étape par Étape

Pour chaque service à refactoriser :

1. **Analyser** :
   - Identifier état (variables globales)
   - Identifier dépendances (autres services utilisés)
   - Identifier API publique (fonctions exportées)

2. **Créer la classe** :
   - Constructeur avec injection de dépendances
   - Propriétés pour état/contexte
   - Méthodes pour fonctions exportées

3. **Migrer imports** :
   - Remplacer `import { func }` par `import { service }`
   - Remplacer `func()` par `service.method()`

4. **Adapter tests** :
   - Créer instances avec dépendances mockées
   - Tester méthodes publiques

5. **Valider** :
   ```bash
   npm run test
   npm run dev
   ```

### Ordre de Refactorisation (par dépendances)

```
1. LoggerService (aucune dépendance)
2. FileSystemService (aucune dépendance)
3. ElevationService (dépend de Logger)
4. Builders: CoverBuilder, StatsBuilder, MapBuilder, StepBuilder
5. TripParser (dépend de FileSystemService)
6. ArtifactGenerator (dépend de Logger, Elevation, tous les Builders)
7. Composables Vue
8. TripStore
9. Tests
```

---

## 🧪 Tests Unitaires

### Pattern de Test pour Classe

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ArtifactGenerator } from '../src/services/generators/ArtifactGenerator'
import { LoggerService } from '../src/services/core/LoggerService'

describe('ArtifactGenerator', () => {
  let generator: ArtifactGenerator
  let mockLogger: LoggerService
  
  beforeEach(() => {
    // Mock des dépendances
    mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      error: vi.fn()
    } as any
    
    // Instanciation avec dépendances mockées
    generator = new ArtifactGenerator(mockLogger, mockElevation)
  })
  
  it('should log when starting generation', async () => {
    await generator.generate(mockInput)
    
    expect(mockLogger.info).toHaveBeenCalledWith(
      'ArtifactGenerator',
      expect.stringContaining('Starting')
    )
  })
  
  it('should build cover section', async () => {
    const artifacts = await generator.generate(mockInput)
    
    // Vérifier que coverHtml est présent
    expect(artifacts.manifest['index.html']).toContain('cover-page')
  })
})
```

### Builders de Mocks Réutilisables

```typescript
// tests/builders/trip.builder.ts
export class TripBuilder {
  private trip: Partial<Trip> = {
    id: 1,
    name: 'Test Trip',
    start_date: Date.UTC(2023, 0, 1) / 1000,
    steps: []
  }
  
  public withName(name: string): TripBuilder {
    this.trip.name = name
    return this
  }
  
  public withSteps(steps: Step[]): TripBuilder {
    this.trip.steps = steps
    return this
  }
  
  public build(): Trip {
    return this.trip as Trip
  }
}

// Usage
const trip = new TripBuilder()
  .withName('Slovénie 2023')
  .withSteps([step1, step2])
  .build()
```

---

## 📋 Checklist par Fichier Refactorisé

Pour chaque service/builder :

- [ ] Classe créée avec nom explicite (`*Service`, `*Builder`, etc.)
- [ ] Constructeur avec injection dépendances (si applicable)
- [ ] Visibilité explicite sur TOUTES les méthodes (`public`/`private`)
- [ ] Singleton pattern si service stateless
- [ ] Export singleton : `export const serviceName = ClassName.getInstance()`
- [ ] Wrapper rétrocompatible si nécessaire (fonction wrapper)
- [ ] JSDoc sur méthodes publiques
- [ ] Imports migrés dans tous les fichiers clients
- [ ] Tests adaptés pour tester instances de classe
- [ ] Tests passent : `npm run test`
- [ ] Build fonctionne : `npm run build`
- [ ] Dev fonctionne : `npm run dev`

---

## ⚠️ Pièges à Éviter

### ❌ NE PAS créer des dépendances en interne

```typescript
// ❌ MAUVAIS
class MyBuilder {
  build() {
    const logger = LoggerService.getInstance() // Créé en interne
    logger.info('Building')
  }
}

// ✅ BON
class MyBuilder {
  constructor(private readonly logger: LoggerService) {}
  
  build() {
    this.logger.info('Building')
  }
}
```

### ❌ NE PAS oublier la visibilité

```typescript
// ❌ MAUVAIS
class MyService {
  doSomething() { } // Pas de public/private
}

// ✅ BON
class MyService {
  public doSomething(): void { }
  private helper(): void { }
}
```

### ❌ NE PAS rendre les builders singleton

```typescript
// ❌ MAUVAIS (builder = contexte → pas singleton)
export const coverBuilder = CoverBuilder.getInstance()

// ✅ BON (nouvelle instance par contexte)
const builder = new CoverBuilder(trip, photosMapping, photoDataUrlMap)
const html = builder.build()
```

### ❌ NE PAS mélanger état et comportement global

```typescript
// ❌ MAUVAIS
class TripService {
  private currentTrip: Trip // État métier global
  
  public setTrip(trip: Trip) {
    this.currentTrip = trip
  }
}

// ✅ BON (état = contexte injecté)
class TripProcessor {
  constructor(private readonly trip: Trip) {}
  
  public process(): void {
    // Utilise this.trip
  }
}
```

---

## 🎓 Exemples Complets

### Exemple 1 : Refactoriser LoggerService

**Avant** :
```typescript
// logger.service.ts
let debugEnabled = false

export function setDebugEnabled(enabled: boolean) {
  debugEnabled = enabled
}

export function debug(module: string, message: string) {
  if (!debugEnabled) return
  console.log(`[DEBUG][${module}]`, message)
}

export function info(module: string, message: string) {
  console.log(`[INFO][${module}]`, message)
}
```

**Après** :
```typescript
// LoggerService.ts
export class LoggerService {
  private static instance: LoggerService
  private debugEnabled = false
  
  private constructor() {}
  
  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }
  
  public setDebugEnabled(enabled: boolean): void {
    this.debugEnabled = enabled
  }
  
  public debug(module: string, message: string, data?: any): void {
    if (!this.debugEnabled) return
    console.log(`[DEBUG][${module}]`, message, data)
  }
  
  public info(module: string, message: string, data?: any): void {
    console.log(`[INFO][${module}]`, message, data)
  }
}

export const loggerService = LoggerService.getInstance()
```

**Migration des usages** :
```typescript
// Avant
import { debug, info } from './logger.service'
debug('module', 'message')
info('module', 'message')

// Après
import { loggerService } from './core/LoggerService'
loggerService.debug('module', 'message')
loggerService.info('module', 'message')
```

---

### Exemple 2 : Refactoriser CoverBuilder

**Avant** :
```typescript
// cover.builder.ts
export type CoverBuilderContext = {
  trip: Trip
  photosMapping: PhotosMapping
  photoDataUrlMap: DataUrlMap
}

export function buildCoverSection(context: CoverBuilderContext): string {
  const { trip, photosMapping, photoDataUrlMap } = context
  const year = new Date(trip.start_date * 1000).getFullYear()
  const coverUrl = selectCoverPhoto(trip, photosMapping)
  return generateHtml(year, coverUrl, photoDataUrlMap)
}

function selectCoverPhoto(trip: Trip, photosMapping: PhotosMapping): string | null {
  // ...
}

function generateHtml(year: number, coverUrl: string | null, dataUrlMap: DataUrlMap): string {
  // ...
}
```

**Après** :
```typescript
// CoverBuilder.ts
import { Trip, PhotosMapping, DataUrlMap } from '../../models/types'
import { loggerService } from '../core/LoggerService'

export class CoverBuilder {
  constructor(
    private readonly trip: Trip,
    private readonly photosMapping: PhotosMapping,
    private readonly photoDataUrlMap: DataUrlMap
  ) {}
  
  public build(): string {
    loggerService.debug('CoverBuilder', 'Building cover section')
    
    const year = this.extractYear()
    const coverUrl = this.selectCoverPhoto()
    
    return this.generateHtml(year, coverUrl)
  }
  
  private extractYear(): number {
    return new Date(this.trip.start_date * 1000).getFullYear()
  }
  
  private selectCoverPhoto(): string | null {
    const rawCover = (this.trip as any).cover_photo?.path || null
    
    if (!rawCover) {
      for (const step of this.trip.steps) {
        const mapping = this.photosMapping[step.id]
        if (mapping && Object.values(mapping).length > 0) {
          return (Object.values(mapping)[0] as any).path
        }
      }
    }
    
    return rawCover
  }
  
  private generateHtml(year: number, coverUrl: string | null): string {
    let bgStyle = ''
    if (coverUrl) {
      const resolved = this.photoDataUrlMap[coverUrl] || coverUrl
      bgStyle = `style="background-image: url('${resolved}');"`
    }
    
    return `
      <div class="break-after cover-page" ${bgStyle}>
        <div class="cover-year">${year}</div>
        <h1 class="cover-title">${this.trip.name}</h1>
      </div>
    `
  }
}
```

**Migration des usages** :
```typescript
// Avant
import { buildCoverSection } from './builders/cover.builder'
const html = buildCoverSection({ trip, photosMapping, photoDataUrlMap })

// Après
import { CoverBuilder } from './builders/CoverBuilder'
const builder = new CoverBuilder(trip, photosMapping, photoDataUrlMap)
const html = builder.build()
```

---

## 🚀 Workflow de Refactorisation

### Pour chaque sous-tâche (task-18.X)

1. **Lire la tâche** : `backlog task <id> --plain`
2. **Analyser le code actuel** : Identifier état, dépendances, API
3. **Créer la nouvelle classe** selon le pattern approprié
4. **Migrer les imports** dans tous les fichiers clients
5. **Adapter les tests** avec mocks/builders
6. **Valider** : tests + build + dev
7. **Marquer AC** : `backlog task edit <id> --check-ac <index>`
8. **Documenter** : Ajouter notes d'implémentation

### Commandes Essentielles

```bash
# Voir la tâche actuelle
backlog task 18.1 --plain

# Lancer les tests
npm run test

# Lancer le dev
npm run dev

# Build production
npm run build

# Marquer AC complété
backlog task edit 18.1 --check-ac 1

# Ajouter notes
backlog task edit 18.1 --notes "Refactorisation LoggerService terminée"

# Marquer tâche Done
backlog task edit 18.1 -s Done
```

---

## ✅ Validation Finale

Avant de marquer une tâche comme Done :

- [ ] Tous les AC cochés
- [ ] Tests passent (`npm run test`)
- [ ] Build fonctionne (`npm run build`)
- [ ] Dev fonctionne (`npm run dev`)
- [ ] Aucune régression visuelle
- [ ] Code documenté (JSDoc sur méthodes publiques)
- [ ] Imports migrés partout
- [ ] Notes d'implémentation ajoutées

---

**Ce prompt est votre guide**. Suis-le à la lettre pour chaque service refactorisé. En cas de doute, réfère-toi au document `doc-2 - Refactorisation-ES2015-Guide-Architecture-OOP.md`.
