
<CRITICAL_INSTRUCTION>

## BACKLOG WORKFLOW INSTRUCTIONS

This project uses Backlog.md MCP for all task and project management activities.

**CRITICAL GUIDANCE**

- If your client supports MCP resources, read `backlog://workflow/overview` to understand when and how to use Backlog for this project.
- If your client only supports tools or the above request fails, call `backlog.get_workflow_overview()` tool to load the tool-oriented overview (it lists the matching guide tools).

- **First time working here?** Read the overview resource IMMEDIATELY to learn the workflow
- **Already familiar?** You should have the overview cached ("## Backlog.md Overview (MCP)")
- **When to read it**: BEFORE creating tasks, or when you're unsure whether to track work

These guides cover:
- Decision framework for when to create tasks
- Search-first workflow to avoid duplicates
- Links to detailed guides for task creation, execution, and completion
- MCP tools reference

You MUST read the overview resource to understand the complete workflow. The information is NOT summarized here.

</CRITICAL_INSTRUCTION>
 
## ADR Creation (Backlog decisions)

- To create a new ADR (Decision), run:
  - `backlog decision create "<ADR-Title>"`
- After creation, edit the generated file in `backlog/decisions/` and fill at minimum the sections:
  - `## Context`
  - `## Decision`
  - `## Consequences`
- Note: All ADRs must be written in English.

### When to propose an ADR

- The assistant (Copilot) SHOULD proactively propose creating an ADR whenever it performs or implements a complex task that modifies, documents, or takes decisions affecting the project's global architecture, structure, or long-lived conventions.
- A proposal must include the recommended ADR title and the suggested minimal content (Context, Decision, Consequences) and the CLI command to create it (`backlog decision create "<ADR-Title>"`).
- The assistant should offer to create the decision file and populate it in `backlog/decisions/` (in English), or provide the exact `backlog decision create` command plus the ADR body so the developer can run it.
- The goal is to ensure ADRs are created automatically and maintained over the project lifetime whenever architecture-relevant choices are made.

---
# Section technique du projet (Travel Book JS)

## Architecture ES2015/OOP

Le projet suit une architecture orientée objet (OOP) utilisant les **classes ES2015 de TypeScript**, conçue pour être familière aux développeurs Java.

### Principes Architecturaux

- ✅ **Classes ES2015** : Utilisation systématique des classes TypeScript avec visibilité explicite (`public`, `private`, `readonly`)
- ✅ **Patterns de conception** : Singleton, Builder, Orchestrator
- ✅ **Injection de dépendances** : Via constructeur (manuel, sans framework)
- ✅ **Immutabilité** : Propriétés `readonly` pour le contexte injecté
- ✅ **Décomposition** : Méthodes privées pour séparer la logique

### Structure en Couches

```
┌─────────────────────────────────────────┐
│         Composants Vue (Views)          │  ← Présentation
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

### Patterns Utilisés

#### 1. Pattern Singleton (Services Core)
Services stateless avec instance unique :
- `LoggerService.getInstance()` - Logging applicatif
- `ElevationService.getInstance()` - Récupération altitudes
- `FileSystemService.getInstance()` - Lecture fichiers

```typescript
export class ServiceName {
  private static instance: ServiceName | null = null
  
  private constructor() {}  // Constructeur privé
  
  public static getInstance(): ServiceName {
    if (!ServiceName.instance) {
      ServiceName.instance = new ServiceName()
    }
    return ServiceName.instance
  }
}

export const serviceName = ServiceName.getInstance()
```

#### 2. Pattern Orchestrator avec DI (Coordination)
Classes qui coordonnent plusieurs services avec injection de dépendances :
- `TripParser(fileSystemService, loggerService)` - Parse les données de voyage
- `ArtifactGenerator(elevationService, loggerService)` - Génère le travel book

```typescript
export class Orchestrator {
  private constructor(
    private readonly service1: Service1,
    private readonly service2: Service2
  ) {}
  
  public async execute(): Promise<Result> {
    // Utilise service1 et service2
  }
  
  private static instance: Orchestrator | null = null
  
  public static getInstance(): Orchestrator {
    if (!Orchestrator.instance) {
      // ✅ Injection manuelle des dépendances
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

#### 3. Pattern Builder avec Contexte Injecté (Construction HTML)
Classes qui construisent des artefacts avec contexte spécifique :
- `CoverBuilder(trip, photosMapping, photoDataUrlMap)` - Page de couverture
- `StatsBuilder(trip, photosMapping)` - Page de statistiques
- `MapBuilder(trip, photosMapping, photoDataUrlMap)` - Page cartographique
- `StepBuilder(trip, step, photosMapping, photoDataUrlMap, stepPlan?)` - Pages d'étapes

```typescript
export class ArtifactBuilder {
  // ❌ PAS de singleton - nouvelle instance à chaque utilisation
  private constructor(
    private readonly trip: Trip,
    private readonly data: Data
  ) {}
  
  public async build(): Promise<string> {
    // Orchestration de méthodes privées
    const part1 = this.buildPart1()
    const part2 = await this.buildPart2()
    return part1 + part2
  }
  
  private buildPart1(): string {
    // Accès à this.trip, this.data
  }
}

// Utilisation
const builder = new ArtifactBuilder(trip, data)
const html = await builder.build()
```

### Conventions de Code

#### Visibilité explicite
```typescript
export class MyService {
  // ✅ Visibilité explicite pour toutes les méthodes
  public publicMethod(): void { }
  private privateMethod(): void { }
  
  // ✅ readonly pour propriétés immuables
  constructor(private readonly dependency: Dependency) { }
}
```

#### Documentation JSDoc
```typescript
/**
 * Description de la méthode
 * @param param1 - Description du paramètre
 * @returns Description du retour
 */
public myMethod(param1: Type1): ReturnType {
  // ...
}
```

#### Décomposition en méthodes privées
```typescript
export class ComplexService {
  public async process(): Promise<Result> {
    // ✅ Méthode publique = orchestration
    const step1 = await this.executeStep1()
    const step2 = this.executeStep2(step1)
    return this.finalizeResult(step2)
  }
  
  // ✅ Logique décomposée en méthodes privées
  private async executeStep1(): Promise<Step1Result> { }
  private executeStep2(input: Step1Result): Step2Result { }
  private finalizeResult(input: Step2Result): Result { }
}
```

### Documentation Complète

Consultez la documentation détaillée dans `backlog/docs/` :
- 📖 **doc-3 - Architecture-ES2015-OOP.md** : Vue d'ensemble, patterns, exemples avant/après
- 📊 **doc-4 - Diagrammes-UML.md** : Diagrammes de classes, séquences, composants (Mermaid)
- 💉 **doc-5 - Guide-Injection-Dependances.md** : Guide DI complet, comparaison Spring vs TS
- 📚 **doc-6 - Glossaire-Java-TypeScript.md** : Correspondances Java ↔ TypeScript

## Structure du projet

- **src/** : code source principal (Vue, TypeScript)
  - Organisation modulaire : `models/`, `router/`, `services/`, `stores/`, `utils/`, `views/`
  - **services/** : Services core (Singleton) et orchestrateurs
  - **services/builders/** : Builders HTML (CoverBuilder, StatsBuilder, MapBuilder, StepBuilder)
  - **composables/** : Logique Vue réutilisable (useFileSelection, useGeneration)
  - **controllers/** : Contrôleurs UI (ViewerController)
- **public/** : ressources statiques (HTML, CSS, images, polices)
- **tests/** : tests unitaires (Vitest)
- **scripts/** : scripts utilitaires (ex : fetch_maps.mjs)
- **backlog/** : gestion des tâches et documentation projet
- **Fichiers de configuration** : `package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`
- **Conventions** : TypeScript strict, classes ES2015, nommage explicite, organisation claire

## Librairies et frameworks

- **Framework principal** : Vue.js (Single File Components, composition API)
- **Outils de build** : Vite
- **Tests unitaires** : Vitest
- **Autres dépendances** : Pinia, Vue Router, etc. (voir package.json)
- **Linting/formatting** : ESLint

## Stratégie de tests unitaires

- **Outil utilisé** : Vitest
- **Organisation** : dossier `tests/`, fichiers `.spec.ts`
- **Setup** : fichier `setup.ts` pour la configuration globale
- **Conventions** : nommage des fichiers de test en lien avec le service ou la vue testée

## Autres éléments techniques importants

- **Scripts** : `scripts/fetch_maps.mjs` pour automatiser la récupération de données
- **Configurations spécifiques** : ESLint, Vite, TypeScript, gestion des assets statiques
- **Outils complémentaires** : gestion des tâches via Backlog.md, organisation des assets dans `public/`, utilisation de templates HTML

## Contraintes d’exécution et déploiement
## Page de couverture du Travel Book

Une page de couverture est désormais générée automatiquement (avant la première étape) dans `generate.service.ts` via la fonction interne `buildCoverSection()`. Elle affiche:

- La photo de couverture (`trip.cover_photo.path` ou `cover_photo_path`). Fallback: première photo d'étape; sinon fond de couleur thème.
- L'année du voyage (`new Date(trip.start_date*1000).getFullYear()`).
- Le titre du voyage (`trip.name`).

Styles dédiés (préfixe `.cover-`) définis dans `public/assets/style.css`. Pour personnaliser:
1. Ajuster la section CSS `/* --- Couverture --- */`.
2. (Optionnel) Ajouter un flag futur si besoin de désactiver; actuellement retirer l'appel `buildCoverSection()` suffira.
3. Tests associés: voir `tests/generate.service.spec.ts` (vérifie présence couverture, fallback photo, année, titre).

Important: conserver la structure `div.break-after.cover-page` pour garder les règles d'impression (page-break) et l'alignement existant.

## Page de statistiques du voyage

Une deuxième page est désormais générée juste après la couverture via la fonction interne `buildStatsSection()` (dans `generate.service.ts`). Elle affiche:

- Les pays uniques traversés (ordre d'apparition) avec leur silhouette SVG locale `assets/images/maps/<code>.svg` et le nom en français.
- Des métriques clés: kilomètres (arrondis, `trip.total_km` si fourni sinon somme Haversine), nombre de jours, nombre d'étapes, nombre total de photos, distance maximale depuis le point de départ (et un petit diagramme arc).

Styles: classes préfixées `.stats-` (voir fin de `public/assets/style.css`). Structure racine: `div.break-after.stats-page` pour conserver la pagination à l'impression.

Personnalisation / Désactivation: retirer ou conditionner l'appel à `buildStatsSection()` dans `generate.service.ts` (ajouter un flag futur si nécessaire).

Tests: assertions présentes dans `tests/generate.service.spec.ts` (détection `.stats-page`, labels de métriques).

## Page cartographique du voyage

Une troisième page cartographique est générée après les statistiques via `buildMapSection()` dans `generate.service.ts`. Elle affiche:

- Un tracé rouge de l'itinéraire complet reliant toutes les étapes chronologiquement (SVG path avec commandes M/L)
- Des vignettes rondes positionnées géographiquement (SVG foreignObject) contenant la photo principale de chaque étape (ou icône 📍 fallback)

**Fonctions clés:**
- `calculateBoundingBox()`: enveloppe géographique min/max lat/lon
- `calculateViewBox()`: génère viewBox SVG avec padding 15%
- `latLonToSvg()`: conversion GPS → coordonnées SVG (0-1000)
- `generatePathData()`: path SVG M/L
- `generateStepMarkers()`: vignettes avec foreignObject

Styles: préfixe `.map-*` dans `public/assets/style.css`. Structure: `div.break-after.map-page`.

Personnalisation: couleur tracé, taille vignettes, styles CSS section `/* --- Carte (page 3) --- */`. Désactivation: retirer `buildMapSection()`.

Tests: `.map-page`, path SVG, vignettes, viewBox dans `tests/generate.service.spec.ts`.


- **Tout le code doit s'exécuter côté navigateur** :
  - Aucun accès serveur, aucune dépendance Node.js côté runtime
  - Le générateur doit être déployable sur une page statique (ex : GitHub Pages, Netlify, Vercel)
  - Toute nouvelle fonctionnalité ou dépendance doit respecter cette contrainte

---




- **Tout le code doit s’exécuter côté navigateur** :
  - Aucun accès serveur, aucune dépendance Node.js côté runtime
  - Le générateur doit être déployable sur une page statique (ex : GitHub Pages, Netlify, Vercel)
  - Toute nouvelle fonctionnalité ou dépendance doit respecter cette contrainte

---
