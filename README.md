# travel-book-js (SPA- Vue 3)

Application front-only (Vue 3 + Vite + TypeScript) qui reproduit la génération du Travel Book côté navigateur.

## Prérequis

- Node.js LTS (18+)

## Commandes

```bash
npm install
npm run dev
npm run build
npm run preview
npm run test
npm run lint
npm run typecheck
```

## Utilisation

 Allez dans l'onglet "Viewer" et cliquez sur "Afficher dans l'application" pour voir le livre intégré (sans Service Worker ni blob).
 Utilisez "Télécharger (fichier unique)" pour exporter un HTML autonome (toutes ressources inlinées).

## Architecture

### Vue d'ensemble

Le projet suit une **architecture orientée objet (OOP)** utilisant les **classes ES2015 de TypeScript**, conçue pour être familière aux développeurs issus du monde Java/Spring.

#### Couches Architecturales

```
┌─────────────────────────────────────────┐
│         Composants Vue (Views)          │  ← Présentation
├─────────────────────────────────────────┤
│       Composables & Controllers         │  ← Logique UI
├─────────────────────────────────────────┤
│           Store Pinia (State)           │  ← Gestion d'état
├─────────────────────────────────────────┤
│        Orchestrateurs (Services)        │  ← Logique métier
├─────────────────────────────────────────┤
│            Builders (HTML)              │  ← Construction artefacts
├─────────────────────────────────────────┤
│        Services Core (Singletons)       │  ← Utilitaires
└─────────────────────────────────────────┘
```

### Patterns de Conception

#### 1. Singleton (Services Core)
Services stateless avec instance unique :
```typescript
export class LoggerService {
  private static instance: LoggerService | null = null
  private constructor() {}
  
  public static getInstance(): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService()
    }
    return LoggerService.instance
  }
  
  public debug(scope: string, message: string): void { }
}

export const loggerService = LoggerService.getInstance()
```

**Services** : `LoggerService`, `ElevationService`, `FileSystemService`

#### 2. Orchestrator avec DI (Coordination)
Classes qui coordonnent plusieurs services :
```typescript
export class TripParser {
  private constructor(
    private readonly fileSystemService: FileSystemService,
    private readonly loggerService: LoggerService
  ) {}
  
  public async parse(input: FFInput): Promise<void> {
    // Utilise les dépendances injectées
  }
  
  public static getInstance(): TripParser {
    if (!TripParser.instance) {
      TripParser.instance = new TripParser(
        FileSystemService.getInstance(),
        LoggerService.getInstance()
      )
    }
    return TripParser.instance
  }
}
```

**Orchestrateurs** : `TripParser`, `ArtifactGenerator`

#### 3. Builder avec Contexte Injecté (Construction HTML)
Classes qui construisent des artefacts HTML :
```typescript
export class CoverBuilder {
  private constructor(
    private readonly trip: Trip,
    private readonly photosMapping: PhotosMapping,
    private readonly photoDataUrlMap: PhotoDataUrlMap
  ) {}
  
  public build(): string {
    // Construction HTML avec accès au contexte
  }
}

// Nouvelle instance à chaque génération
const builder = new CoverBuilder(trip, photos, photoMap)
const html = builder.build()
```

**Builders** : `CoverBuilder`, `StatsBuilder`, `MapBuilder`, `StepBuilder`

### Structure du Code

```
src/
├── services/
│   ├── logger.service.ts       # Singleton - Logging
│   ├── elevation.service.ts    # Singleton - API altitudes
│   ├── fs.service.ts           # Singleton - Lecture fichiers
│   ├── parse.service.ts        # Orchestrator - Parsing voyage
│   ├── generate.service.ts     # Orchestrator - Génération HTML
│   └── builders/
│       ├── cover.builder.ts    # Builder - Page couverture
│       ├── stats.builder.ts    # Builder - Page statistiques
│       ├── map.builder.ts      # Builder - Page carte
│       └── step.builder.ts     # Builder - Pages étapes
├── composables/
│   ├── useFileSelection.ts     # Composable - Sélection fichiers
│   └── useGeneration.ts        # Composable - Workflow génération
├── controllers/
│   └── ViewerController.ts     # Controller - Opérations viewer
├── stores/
│   └── trip.store.ts           # Pinia store - État application
├── views/                      # Composants Vue (SFC)
├── models/                     # Types TypeScript
└── utils/                      # Utilitaires
```

### Conventions de Code

#### Visibilité Explicite
```typescript
export class MyService {
  public publicMethod(): void { }      // ✅ Explicite
  private privateMethod(): void { }    // ✅ Explicite
  
  constructor(
    private readonly dependency: Dep   // ✅ readonly pour immutabilité
  ) {}
}
```

#### Documentation JSDoc
```typescript
/**
 * Parse les données de voyage depuis l'input
 * @param input - Répertoire ou fichiers du voyage
 * @returns Promise résolue quand le parsing est terminé
 */
public async parse(input: FFInput): Promise<void> {
  // ...
}
```

#### Décomposition en Méthodes Privées
```typescript
export class ComplexService {
  public async process(): Promise<Result> {
    // ✅ Méthode publique = orchestration
    const step1 = await this.executeStep1()
    const step2 = this.executeStep2(step1)
    return this.finalizeResult(step2)
  }
  
  // ✅ Logique décomposée en méthodes privées
  private async executeStep1(): Promise<Step1> { }
  private executeStep2(input: Step1): Step2 { }
  private finalizeResult(input: Step2): Result { }
}
```

### Exemples d'Utilisation

#### Utiliser un Service Singleton
```typescript
import { loggerService } from '@/services/logger.service'
import { elevationService } from '@/services/elevation.service'

// Logger
loggerService.debug('my-scope', 'Message de debug')
loggerService.time('operation')
// ... code ...
loggerService.timeEnd('operation')

// Elevation
const altitude = await elevationService.getElevation(48.8566, 2.3522)
```

#### Utiliser un Orchestrateur
```typescript
import { tripParser } from '@/services/parse.service'
import { artifactGenerator } from '@/services/generate.service'

// Parser un voyage
await tripParser.parse(inputDirectory)

// Générer les artefacts HTML
const artifacts = await artifactGenerator.generate(inputDirectory, {
  photosPlan: userPlanText
})
```

#### Créer un Builder
```typescript
import { CoverBuilder } from '@/services/builders/cover.builder'

// Nouvelle instance avec contexte
const builder = new CoverBuilder(trip, photosMapping, photoDataUrlMap)
const coverHtml = builder.build()
```

### Documentation Complète

Pour une documentation détaillée de l'architecture :

- 📖 [Architecture ES2015/OOP](backlog/docs/doc-3%20-%20Architecture-ES2015-OOP.md) - Vue d'ensemble, patterns, exemples
- 📊 [Diagrammes UML](backlog/docs/doc-4%20-%20Diagrammes-UML.md) - Diagrammes de classes (Mermaid)
- 💉 [Guide Injection de Dépendances](backlog/docs/doc-5%20-%20Guide-Injection-Dependances.md) - Comparaison Java/Spring vs TypeScript
- 📚 [Glossaire Java ↔ TypeScript](backlog/docs/doc-6%20-%20Glossaire-Java-TypeScript.md) - Correspondances pour développeurs Java

## Polices locales (optionnel)
## Limites / Compatibilité
Pour une parité visuelle hors-ligne complète, vous pouvez embarquer Noto Serif en local:

1. Téléchargez les fichiers WOFF2 de Noto Serif (Regular et Italic) et placez-les dans `public/assets/fonts/` avec ces noms exacts:
	- `NotoSerif-Regular.woff2`
	- `NotoSerif-Italic.woff2`
2. Le générateur détecte et inclut automatiquement ces fichiers; l’export single-file les inline.
3. Sinon, le fallback utilise la police système "Noto Serif" ou `serif`.
- File System Access API (Chrome/Edge) recommandé.
- Fallback: input type=file (webkitdirectory) et zip via fflate.
- Tout reste local, aucune donnée n’est envoyée. Les drapeaux utilisent un emoji, et les cartes pays sont locales.

## Page de couverture

Le générateur ajoute automatiquement une page de couverture en première page du `travel_book.html`.

Contenu:

- Photo de couverture: `trip.cover_photo.path` (ou `cover_photo_path`). Si absente, première photo disponible d'une étape. Si aucune photo n'est disponible, un fond uni couleur thème est utilisé.
- Année du voyage: dérivée de `trip.start_date`.
- Titre du voyage: `trip.name`.

Mise en forme:

- Bloc sur toute la page (`.cover-page`) avec image en background (`.cover-background`).
- Titre et année centrés verticalement et horizontalement (overlay `.cover-overlay`).
- Lisibilité assurée par un overlay semi-transparent et `text-shadow`.
- Classes préfixées `cover-` pour éviter collisions.

Personnalisation:

- Modifier les styles dans `public/assets/style.css` (section `/* --- Couverture --- */`).
- Vous pouvez remplacer dynamiquement la photo choisie en ajoutant / modifiant `trip.cover_photo` avant l'appel à `generateArtifacts`.
- Pour désactiver la page de couverture, retirer l'appel `buildCoverSection()` dans `generate.service.ts` (ou ajouter un flag futur si besoin).

Tests: voir `tests/generate.service.spec.ts` pour des exemples de contrôle de la couverture (année, titre, fallback photo).

## Page Statistiques (2ᵉ page)

Une page de statistiques (`.stats-page`) est automatiquement insérée juste après la page de couverture.

Contenu principal:

- Pays traversés (uniques, dans l'ordre de première apparition) affichés sous forme de silhouettes SVG locales (`public/assets/images/maps/<code>.svg`). Si une carte est manquante, un placeholder est généré.
- Nom de chaque pays en français, centré dans/au-dessus de la silhouette (majuscules). Les noms proviennent d'un mapping interne ou d'`Intl.DisplayNames`.
- Statistiques clés (icônes inline + valeur + label):
	- Kilomètres (arrondi) — utilise `trip.total_km` si disponible sinon distance cumulée approximative entre étapes (Haversine).
	- Jours de voyage (calcul `(end-start)+1`).
	- Nombre d'étapes.
	- Nombre total de photos (somme des photos chargées pour chaque étape).
	- Distance maximum depuis l'étape de départ + petit diagramme arc représentant le point le plus éloigné.

Structure HTML: blocs `.stats-countries` (flex wrap) et `.stats-metrics` (grid). Chaque métrique a `.stats-metric`, les classes distance: `.stats-distance`, `.stats-distance-diagram`.


Impression: la page conserve `break-after` via la classe de conteneur `break-after stats-page` pour rester isolée en PDF.

Personnalisation:

- Styles: section `/* --- Page Statistiques --- */` à la fin de `public/assets/style.css`.
- Pour désactiver: retirer l'appel `buildStatsSection()` dans `generate.service.ts`.
- Pour ajouter une nouvelle métrique: calculer la valeur dans `buildStatsSection()` (ou externaliser plus tard) et ajouter un bloc `.stats-metric`.

Tests: assertions de présence de `.stats-page` et des labels (KILOMÈTRES, JOURS, ÉTAPES, PHOTOS) dans `tests/generate.service.spec.ts`.

## Page Carte (3ᵉ page)

Une troisième page cartographique est générée après la page de statistiques via la fonction interne `buildMapSection()` dans `generate.service.ts`. Elle affiche:

- Une carte pleine page avec l'itinéraire complet du voyage
- Un tracé rouge reliant toutes les étapes dans l'ordre chronologique
- Des vignettes rondes pour chaque étape, positionnées selon leurs coordonnées GPS, contenant la photo principale de l'étape (ou une icône 📍 en fallback)

**Fonctions internes:**
- `calculateBoundingBox()`: calcule l'enveloppe géographique (min/max lat/lon) de toutes les étapes
- `calculateViewBox()`: génère le viewBox SVG avec padding (15% par défaut)
- `latLonToSvg()`: convertit coordonnées GPS en coordonnées SVG (0-1000)
- `generatePathData()`: crée le path SVG avec commandes M (move) et L (line)
- `generateStepMarkers()`: crée les vignettes SVG (foreignObject + HTML/CSS)

Styles: classes préfixées `.map-*` dans `public/assets/style.css`. Structure racine: `div.break-after.map-page` pour la pagination à l'impression.

Personnalisation:

- Couleur du tracé: modifier `stroke="#FF6B6B"` dans `buildMapSection()`
- Taille des vignettes: modifier `markerSize` dans `generateStepMarkers()`
- Styles: section `/* --- Carte (page 3) --- */` dans `public/assets/style.css`
- Pour désactiver: retirer l'appel `buildMapSection()` dans `generate.service.ts`

Tests: assertions de présence de `.map-page`, tracé SVG path, vignettes foreignObject, dans `tests/generate.service.spec.ts`.

## 🎨 Maquettes & Design

Des maquettes HTML interactives sont disponibles dans `docs/mockups/` pour visualiser l'évolution future du produit :

- **Landing Page moderne** : Page d'accueil avec onboarding
- **Éditeur avancé** : Interface d'édition avec drag & drop
- **Galerie photos intelligente** : Gestionnaire de photos avec IA
- **Timeline interactive** : Visualisation chronologique avec carte

**Voir les maquettes** : Ouvrir `docs/mockups/mockups-index.html` dans votre navigateur

Ces maquettes proposent une vision complète d'un produit web moderne avec :
- Design system cohérent (couleurs, typographie, composants)
- Fonctionnalités innovantes (suggestions IA, édition temps réel)
- Interactions fluides (drag & drop, animations)
- Documentation technique complète

## Contribution

### Pour Développeurs Java

Si vous êtes familier avec Java et Spring, vous vous sentirez à l'aise avec cette architecture :

#### Similarités
- ✅ **Classes ES2015** : Syntaxe quasi-identique à Java
- ✅ **Injection de Dépendances** : Via constructeur (comme Spring)
- ✅ **Singleton Pattern** : `getInstance()` comme en Java
- ✅ **Visibilité** : `public`, `private`, `protected`
- ✅ **Interfaces** : Même concept
- ✅ **Génériques** : `<T>` identique

#### Différences Clés
- ⚠️ **Pas de `@Autowired`** : Injection manuelle dans `getInstance()`
- ⚠️ **`readonly` au lieu de `final`** : Pour propriétés immuables
- ⚠️ **`async/await`** : Plus simple que `CompletableFuture`
- ⚠️ **`T | null`** : Au lieu de `Optional<T>`
- ⚠️ **Arrays natifs** : Au lieu de `ArrayList`, `HashMap`

#### Exemples de Correspondance

| Java Spring | TypeScript |
|-------------|------------|
| `@Service` | `export class` + `getInstance()` |
| `@Autowired` | Injection manuelle via constructeur |
| `private final` | `private readonly` |
| `Optional<T>` | `T \| null` |
| `List<String>` | `string[]` |
| `Map<K, V>` | `Map<K, V>` (ES2015) |

#### Ajouter un Nouveau Service

```typescript
// 1. Créer le service singleton
export class MyService {
  private static instance: MyService | null = null
  
  private constructor(
    private readonly logger: LoggerService
  ) {}
  
  public static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService(
        LoggerService.getInstance()
      )
    }
    return MyService.instance
  }
  
  public doSomething(): void {
    this.logger.debug('my-service', 'Doing something')
  }
}

// 2. Exporter le singleton
export const myService = MyService.getInstance()

// 3. Utiliser
import { myService } from '@/services/my.service'
myService.doSomething()
```

### Conventions de Contribution

1. **Typage strict** : Toujours typer les paramètres et retours
2. **Visibilité explicite** : Utiliser `public`/`private`
3. **Documentation JSDoc** : Pour toutes les méthodes publiques
4. **Tests unitaires** : Vitest (comme JUnit)
5. **Décomposition** : Méthodes privées pour logique interne
6. **Immutabilité** : Préférer `const` et `readonly`

### Lancer les Tests

```bash
npm run test              # Tests unitaires
npm run test:coverage     # Avec couverture
npm run typecheck         # Vérification types
npm run lint              # ESLint
```
