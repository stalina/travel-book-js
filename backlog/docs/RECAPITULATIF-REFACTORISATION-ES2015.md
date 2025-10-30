# 📦 Récapitulatif : Refactorisation ES2015 Architecture OOP

**Date** : 28 octobre 2025  
**Tâche principale** : task-18  
**Statut** : To Do (Ready to Start)

---

## 🎯 Objectif Global

Refactoriser l'ensemble du projet **Travel Book JS** pour adopter une **architecture orientée objet (OOP)** avec des **classes ES2015**, rendant le code plus accessible aux développeurs issus du monde **Java**.

### Périmètre

- ✅ **Services TypeScript** (Logger, Elevation, FileSystem, etc.)
- ✅ **Builders HTML** (Cover, Stats, Map, Step)
- ✅ **Services métier** (Generate, Parse)
- ✅ **Composants Vue.js** (HomeView, GenerationView, ViewerView)
- ✅ **Stores Pinia** (TripStore)
- ✅ **Tests unitaires** (Vitest)
- ✅ **Documentation** (README, instructions Copilot)

---

## 📋 Structure des Tâches Créées

### Tâche Principale

**task-18** : Refactorisation ES2015 complète : Architecture OOP pour développeurs Java  
- **Priorité** : HIGH  
- **Labels** : refactoring, architecture, typescript, vue  
- **8 Acceptance Criteria** à valider

### Sous-tâches (14 au total)

#### Phase 1 : Services Core (3 tâches)
1. **task-18.1** : Refactoriser LoggerService en singleton ES2015
2. **task-18.2** : Refactoriser ElevationService en singleton ES2015
3. **task-18.3** : Refactoriser FileSystemService en classe ES2015

#### Phase 2 : Builders (4 tâches)
4. **task-18.4** : Refactoriser CoverBuilder en classe avec contexte
5. **task-18.5** : Refactoriser StatsBuilder en classe avec contexte
6. **task-18.6** : Refactoriser MapBuilder en classe avec contexte
7. **task-18.7** : Refactoriser StepBuilder en classe avec contexte

#### Phase 3 : Services Métier (2 tâches)
8. **task-18.8** : Refactoriser TripParser en classe orchestratrice
9. **task-18.9** : Refactoriser ArtifactGenerator en classe orchestratrice

#### Phase 4 : Couche Vue (2 tâches)
10. **task-18.10** : Refactoriser composants Vue avec Composition API structurée
11. **task-18.11** : Adapter TripStore pour injection de dépendances

#### Phase 5 : Tests et Documentation (3 tâches)
12. **task-18.12** : Refactoriser tests unitaires pour architecture classe
13. **task-18.13** : Créer documentation migration ES2015
14. **task-18.14** : Mettre à jour README et instructions Copilot

---

## 📚 Documents Créés

### 1. Guide d'Architecture OOP
**Fichier** : `backlog/docs/doc-2 - Refactorisation-ES2015-Guide-Architecture-OOP.md`

**Contenu** :
- Vue d'ensemble du projet actuel vs cible
- Principes de conception (SRP, DI, Singleton, etc.)
- Architecture cible avec diagrammes de classes
- Patterns de refactorisation détaillés (4 patterns)
- Plan d'implémentation par phase
- Conventions de code (nommage, visibilité, structure)
- Exemples de migration (avant/après)
- Tests unitaires (patterns, builders de mocks)
- Glossaire Java ↔ TypeScript
- Critères de validation

### 2. Prompt GitHub Copilot
**Fichier** : `backlog/docs/PROMPT-REFACTORISATION-ES2015.md`

**Contenu** :
- Contexte du projet et contraintes
- 4 Patterns de refactorisation (Singleton, Builder, Orchestrateur, Composable)
- Conventions de code strictes
- Migration progressive étape par étape
- Ordre de refactorisation par dépendances
- Tests unitaires (patterns, mocking)
- Checklist par fichier refactorisé
- Pièges à éviter (anti-patterns)
- 2 Exemples complets (LoggerService, CoverBuilder)
- Workflow de refactorisation
- Commandes de validation

---

## 🏗️ Architecture Cible

### Nouvelle Structure de Dossiers

```
src/
├── services/
│   ├── core/                          # Services fondamentaux (singletons)
│   │   ├── LoggerService.ts           ← task-18.1
│   │   ├── ElevationService.ts        ← task-18.2
│   │   └── FileSystemService.ts       ← task-18.3
│   ├── builders/                      # Builders HTML (classes avec contexte)
│   │   ├── CoverBuilder.ts            ← task-18.4
│   │   ├── StatsBuilder.ts            ← task-18.5
│   │   ├── MapBuilder.ts              ← task-18.6
│   │   └── StepBuilder.ts             ← task-18.7
│   ├── generators/                    # Orchestrateurs
│   │   └── ArtifactGenerator.ts       ← task-18.9
│   └── parsers/                       # Parsers de données
│       └── TripParser.ts              ← task-18.8
├── composables/                       # Composables Vue (classes TypeScript)
│   ├── useFileSelection.ts            ← task-18.10
│   └── useGeneration.ts               ← task-18.10
├── stores/
│   └── trip.store.ts                  ← task-18.11 (adaptation)
├── models/
│   └── types.ts                       (inchangé)
└── views/
    ├── HomeView.vue                   ← task-18.10 (utilise composables)
    ├── GenerationView.vue             ← task-18.10 (utilise composables)
    └── ViewerView.vue                 ← task-18.10 (utilise composables)
```

---

## 🔄 Patterns de Refactorisation

### Pattern 1 : Singleton (Services Stateless)

**Cas d'usage** : LoggerService, ElevationService, FileSystemService

**Structure** :
```typescript
export class MyService {
  private static instance: MyService
  private constructor() {}
  
  public static getInstance(): MyService {
    if (!MyService.instance) {
      MyService.instance = new MyService()
    }
    return MyService.instance
  }
  
  public method(): void { /* ... */ }
}

export const myService = MyService.getInstance()
```

---

### Pattern 2 : Builder avec Contexte

**Cas d'usage** : CoverBuilder, StatsBuilder, MapBuilder, StepBuilder

**Structure** :
```typescript
export class MyBuilder {
  constructor(
    private readonly trip: Trip,
    private readonly context: Context
  ) {}
  
  public build(): string {
    return this.generateHtml()
  }
  
  private generateHtml(): string { /* ... */ }
}

// Usage
const builder = new MyBuilder(trip, context)
const html = builder.build()
```

---

### Pattern 3 : Orchestrateur avec DI

**Cas d'usage** : ArtifactGenerator, TripParser

**Structure** :
```typescript
export class MyOrchestrator {
  constructor(
    private readonly service1: Service1,
    private readonly service2: Service2
  ) {}
  
  public async execute(): Promise<Result> {
    const data = await this.service1.load()
    const builder = new MyBuilder(data)
    return builder.build()
  }
}

export const myOrchestrator = new MyOrchestrator(service1, service2)
```

---

### Pattern 4 : Composable Vue (Classe TypeScript)

**Cas d'usage** : useFileSelection, useGeneration

**Structure** :
```typescript
export class MyController {
  private store = useMyStore()
  public readonly state = ref(...)
  
  constructor() { /* init */ }
  
  public handleAction(): void { /* ... */ }
}

export function useMyController(): MyController {
  return new MyController()
}
```

---

## 📊 Ordre d'Exécution Recommandé

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 1 : Services Core                  │
│               (Aucune dépendance entre eux)                 │
└─────────────────────────────────────────────────────────────┘
         │
         ├─► task-18.1: LoggerService
         ├─► task-18.3: FileSystemService
         └─► task-18.2: ElevationService (utilise Logger)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   PHASE 2 : Builders                        │
│              (Dépendent de LoggerService)                   │
└─────────────────────────────────────────────────────────────┘
         │
         ├─► task-18.4: CoverBuilder
         ├─► task-18.5: StatsBuilder
         ├─► task-18.6: MapBuilder
         └─► task-18.7: StepBuilder
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                PHASE 3 : Services Métier                    │
│       (Orchestrent services core et builders)               │
└─────────────────────────────────────────────────────────────┘
         │
         ├─► task-18.8: TripParser (utilise FileSystemService)
         └─► task-18.9: ArtifactGenerator (utilise tous les builders)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   PHASE 4 : Couche Vue                      │
│           (Utilise services métier via DI)                  │
└─────────────────────────────────────────────────────────────┘
         │
         ├─► task-18.10: Composables Vue (useFileSelection, etc.)
         └─► task-18.11: TripStore (injection services)
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              PHASE 5 : Tests et Documentation               │
│                  (Validation finale)                        │
└─────────────────────────────────────────────────────────────┘
         │
         ├─► task-18.12: Tests unitaires
         ├─► task-18.13: Documentation migration
         └─► task-18.14: README et instructions Copilot
```

---

## ✅ Validation Globale

### Critères de Succès (task-18)

- [ ] **AC #1** : Services core (Logger, Elevation, FileSystem) refactorisés en classes singleton
- [ ] **AC #2** : Builders (Cover, Stats, Map, Step) refactorisés en classes avec contexte injecté
- [ ] **AC #3** : Services métier (Generate, Parse) refactorisés en classes orchestratrices
- [ ] **AC #4** : Composants Vue refactorisés avec Composition API + classes TypeScript
- [ ] **AC #5** : Stores Pinia adaptés pour injection de dépendances
- [ ] **AC #6** : Tests unitaires refactorisés pour tester les classes
- [ ] **AC #7** : Documentation technique mise à jour (instructions Copilot, README)
- [ ] **AC #8** : Guide de migration créé pour futurs développeurs

### Commandes de Validation Finale

```bash
# Tests unitaires (couverture > 80%)
npm run test

# Linting TypeScript
npm run lint

# Build de production
npm run build

# Serveur de développement
npm run dev

# Génération d'un travel book test (validation fonctionnelle)
# → Sélectionner un dossier voyage de test
# → Générer le livre
# → Vérifier que toutes les pages (couverture, stats, carte, étapes) s'affichent
```

---

## 🚀 Démarrage de la Refactorisation

### Étape 1 : Lire la Documentation

1. **Guide d'architecture** : `backlog/docs/doc-2 - Refactorisation-ES2015-Guide-Architecture-OOP.md`
2. **Prompt Copilot** : `backlog/docs/PROMPT-REFACTORISATION-ES2015.md`

### Étape 2 : Commencer par task-18.1 (LoggerService)

```bash
# Afficher la tâche
backlog task 18.1 --plain

# Commencer la refactorisation (marquer en cours + assigner)
backlog task edit 18.1 -s "In Progress" -a @yourself

# Après refactorisation : valider
npm run test
npm run dev

# Marquer AC complétés
backlog task edit 18.1 --check-ac 1 --check-ac 2 --check-ac 3 --check-ac 4 --check-ac 5

# Ajouter notes d'implémentation
backlog task edit 18.1 --notes "LoggerService refactorisé en singleton ES2015. Tous les imports migrés. Tests adaptés."

# Marquer Done
backlog task edit 18.1 -s Done
```

### Étape 3 : Continuer avec task-18.2, 18.3, etc.

Suivre l'ordre de dépendances (voir diagramme ci-dessus).

---

## 📖 Ressources Disponibles

| Ressource | Emplacement | Usage |
|-----------|-------------|-------|
| Guide Architecture OOP | `backlog/docs/doc-2 - ...` | Référence complète |
| Prompt Copilot | `backlog/docs/PROMPT-REFACTORISATION-ES2015.md` | Guide GitHub Copilot |
| Tâches Backlog | `backlog task 18.*` | Suivi progression |
| Tests Existants | `tests/*.spec.ts` | Exemples de migration |

---

## 💡 Conseils

1. **Ne pas précipiter** : Refactoriser service par service, phase par phase
2. **Tester fréquemment** : Après chaque service refactorisé, valider tests + build + dev
3. **Documenter au fur et à mesure** : Ajouter notes d'implémentation dans chaque tâche
4. **Conserver rétrocompatibilité** : Wrappers fonctions temporaires si nécessaire
5. **Utiliser le prompt Copilot** : Il contient tous les patterns et anti-patterns

---

## 🎓 Bénéfices Attendus

### Pour Développeurs Java

- ✅ Structure familière (classes, constructeurs, visibilité)
- ✅ Injection de dépendances via constructeur (comme Spring)
- ✅ Hiérarchie claire (Services → Builders → Generators)
- ✅ Testabilité (mocking facilité)

### Pour le Projet

- ✅ Maintenabilité accrue
- ✅ Scalabilité améliorée
- ✅ Onboarding plus rapide pour nouveaux développeurs
- ✅ Code auto-documenté

---

**Prêt à démarrer ?** Commence par lire le prompt Copilot, puis lance-toi sur task-18.1 ! 🚀
