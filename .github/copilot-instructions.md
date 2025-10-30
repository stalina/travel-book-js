
<!-- BACKLOG.MD GUIDELINES START -->
# Instructions for the usage of Backlog.md CLI Tool

## Backlog.md: Comprehensive Project Management Tool via CLI

### Assistant Objective

Efficiently manage all project tasks, status, and documentation using the Backlog.md CLI, ensuring all project metadata
remains fully synchronized and up-to-date.

### Core Capabilities

- ✅ **Task Management**: Create, edit, assign, prioritize, and track tasks with full metadata
- ✅ **Search**: Fuzzy search across tasks, documents, and decisions with `backlog search`
- ✅ **Acceptance Criteria**: Granular control with add/remove/check/uncheck by index
- ✅ **Board Visualization**: Terminal-based Kanban board (`backlog board`) and web UI (`backlog browser`)
- ✅ **Git Integration**: Automatic tracking of task states across branches
- ✅ **Dependencies**: Task relationships and subtask hierarchies
- ✅ **Documentation & Decisions**: Structured docs and architectural decision records
- ✅ **Export & Reporting**: Generate markdown reports and board snapshots
- ✅ **AI-Optimized**: `--plain` flag provides clean text output for AI processing

### Why This Matters to You (AI Agent)

1. **Comprehensive system** - Full project management capabilities through CLI
2. **The CLI is the interface** - All operations go through `backlog` commands
3. **Unified interaction model** - You can use CLI for both reading (`backlog task 1 --plain`) and writing (
   `backlog task edit 1`)
4. **Metadata stays synchronized** - The CLI handles all the complex relationships

### Key Understanding

- **Tasks** live in `backlog/tasks/` as `task-<id> - <title>.md` files
- **You interact via CLI only**: `backlog task create`, `backlog task edit`, etc.
- **Use `--plain` flag** for AI-friendly output when viewing/listing
- **Never bypass the CLI** - It handles Git, metadata, file naming, and relationships

---

# ⚠️ CRITICAL: NEVER EDIT TASK FILES DIRECTLY. Edit Only via CLI

**ALL task operations MUST use the Backlog.md CLI commands**

- ✅ **DO**: Use `backlog task edit` and other CLI commands
- ✅ **DO**: Use `backlog task create` to create new tasks
- ✅ **DO**: Use `backlog task edit <id> --check-ac <index>` to mark acceptance criteria
- ❌ **DON'T**: Edit markdown files directly
- ❌ **DON'T**: Manually change checkboxes in files
- ❌ **DON'T**: Add or modify text in task files without using CLI

**Why?** Direct file editing breaks metadata synchronization, Git tracking, and task relationships.

---

## 1. Source of Truth & File Structure

### 📖 **UNDERSTANDING** (What you'll see when reading)

- Markdown task files live under **`backlog/tasks/`** (drafts under **`backlog/drafts/`**)
- Files are named: `task-<id> - <title>.md` (e.g., `task-42 - Add GraphQL resolver.md`)
- Project documentation is in **`backlog/docs/`**
- Project decisions are in **`backlog/decisions/`**

### 🔧 **ACTING** (How to change things)

- **All task operations MUST use the Backlog.md CLI tool**
- This ensures metadata is correctly updated and the project stays in sync
- **Always use `--plain` flag** when listing or viewing tasks for AI-friendly text output

---

## 2. Common Mistakes to Avoid

### ❌ **WRONG: Direct File Editing**

```markdown
# DON'T DO THIS:

1. Open backlog/tasks/task-7 - Feature.md in editor
2. Change "- [ ]" to "- [x]" manually
3. Add notes directly to the file
4. Save the file
```

### ✅ **CORRECT: Using CLI Commands**

```bash
# DO THIS INSTEAD:
backlog task edit 7 --check-ac 1  # Mark AC #1 as complete
backlog task edit 7 --notes "Implementation complete"  # Add notes
backlog task edit 7 -s "In Progress" -a @agent-k  # Multiple commands: change status and assign the task when you start working on the task
```

---

## 3. Understanding Task Format (Read-Only Reference)

⚠️ **FORMAT REFERENCE ONLY** - The following sections show what you'll SEE in task files.
**Never edit these directly! Use CLI commands to make changes.**

### Task Structure You'll See

```markdown
---
id: task-42
title: Add GraphQL resolver
status: To Do
assignee: [@sara]
labels: [backend, api]
---

## Description

Brief explanation of the task purpose.

## Acceptance Criteria

<!-- AC:BEGIN -->

- [ ] #1 First criterion
- [x] #2 Second criterion (completed)
- [ ] #3 Third criterion

<!-- AC:END -->

## Implementation Plan

1. Research approach
2. Implement solution

## Implementation Notes

Summary of what was done.
```

### How to Modify Each Section

| What You Want to Change | CLI Command to Use                                       |
|-------------------------|----------------------------------------------------------|
| Title                   | `backlog task edit 42 -t "New Title"`                    |
| Status                  | `backlog task edit 42 -s "In Progress"`                  |
| Assignee                | `backlog task edit 42 -a @sara`                          |
| Labels                  | `backlog task edit 42 -l backend,api`                    |
| Description             | `backlog task edit 42 -d "New description"`              |
| Add AC                  | `backlog task edit 42 --ac "New criterion"`              |
| Check AC #1             | `backlog task edit 42 --check-ac 1`                      |
| Uncheck AC #2           | `backlog task edit 42 --uncheck-ac 2`                    |
| Remove AC #3            | `backlog task edit 42 --remove-ac 3`                     |
| Add Plan                | `backlog task edit 42 --plan "1. Step one\n2. Step two"` |
| Add Notes (replace)     | `backlog task edit 42 --notes "What I did"`              |
| Append Notes            | `backlog task edit 42 --append-notes "Another note"` |

---

## 4. Defining Tasks

### Creating New Tasks

**Always use CLI to create tasks:**

```bash
# Example
backlog task create "Task title" -d "Description" --ac "First criterion" --ac "Second criterion"
```

### Title (one liner)

Use a clear brief title that summarizes the task.

### Description (The "why")

Provide a concise summary of the task purpose and its goal. Explains the context without implementation details.

### Acceptance Criteria (The "what")

**Understanding the Format:**

- Acceptance criteria appear as numbered checkboxes in the markdown files
- Format: `- [ ] #1 Criterion text` (unchecked) or `- [x] #1 Criterion text` (checked)

**Managing Acceptance Criteria via CLI:**

⚠️ **IMPORTANT: How AC Commands Work**

- **Adding criteria (`--ac`)** accepts multiple flags: `--ac "First" --ac "Second"` ✅
- **Checking/unchecking/removing** accept multiple flags too: `--check-ac 1 --check-ac 2` ✅
- **Mixed operations** work in a single command: `--check-ac 1 --uncheck-ac 2 --remove-ac 3` ✅

```bash
# Examples

# Add new criteria (MULTIPLE values allowed)
backlog task edit 42 --ac "User can login" --ac "Session persists"

# Check specific criteria by index (MULTIPLE values supported)
backlog task edit 42 --check-ac 1 --check-ac 2 --check-ac 3  # Check multiple ACs
# Or check them individually if you prefer:
backlog task edit 42 --check-ac 1    # Mark #1 as complete
backlog task edit 42 --check-ac 2    # Mark #2 as complete

# Mixed operations in single command
backlog task edit 42 --check-ac 1 --uncheck-ac 2 --remove-ac 3

# ❌ STILL WRONG - These formats don't work:
# backlog task edit 42 --check-ac 1,2,3  # No comma-separated values
# backlog task edit 42 --check-ac 1-3    # No ranges
# backlog task edit 42 --check 1         # Wrong flag name

# Multiple operations of same type
backlog task edit 42 --uncheck-ac 1 --uncheck-ac 2  # Uncheck multiple ACs
backlog task edit 42 --remove-ac 2 --remove-ac 4    # Remove multiple ACs (processed high-to-low)
```

**Key Principles for Good ACs:**

- **Outcome-Oriented:** Focus on the result, not the method.
- **Testable/Verifiable:** Each criterion should be objectively testable
- **Clear and Concise:** Unambiguous language
- **Complete:** Collectively cover the task scope
- **User-Focused:** Frame from end-user or system behavior perspective

Good Examples:

- "User can successfully log in with valid credentials"
- "System processes 1000 requests per second without errors"
- "CLI preserves literal newlines in description/plan/notes; `\\n` sequences are not auto‑converted"

Bad Example (Implementation Step):

- "Add a new function handleLogin() in auth.ts"
- "Define expected behavior and document supported input patterns"

### Task Breakdown Strategy

1. Identify foundational components first
2. Create tasks in dependency order (foundations before features)
3. Ensure each task delivers value independently
4. Avoid creating tasks that block each other

### Task Requirements

- Tasks must be **atomic** and **testable** or **verifiable**
- Each task should represent a single unit of work for one PR
- **Never** reference future tasks (only tasks with id < current task id)
- Ensure tasks are **independent** and don't depend on future work

---

## 5. Implementing Tasks

### 5.1. First step when implementing a task

The very first things you must do when you take over a task are:

* set the task in progress
* assign it to yourself

```bash
# Example
backlog task edit 42 -s "In Progress" -a @{myself}
```

### 5.2. Create an Implementation Plan (The "how")

Previously created tasks contain the why and the what. Once you are familiar with that part you should think about a
plan on **HOW** to tackle the task and all its acceptance criteria. This is your **Implementation Plan**.
First do a quick check to see if all the tools that you are planning to use are available in the environment you are
working in.   
When you are ready, write it down in the task so that you can refer to it later.

```bash
# Example
backlog task edit 42 --plan "1. Research codebase for references\n2Research on internet for similar cases\n3. Implement\n4. Test"
```

## 5.3. Implementation

Once you have a plan, you can start implementing the task. This is where you write code, run tests, and make sure
everything works as expected. Follow the acceptance criteria one by one and MARK THEM AS COMPLETE as soon as you
finish them.

### 5.4 Implementation Notes (PR description)

When you are done implementing a tasks you need to prepare a PR description for it.
Because you cannot create PRs directly, write the PR as a clean description in the task notes.
Append notes progressively during implementation using `--append-notes`:

```
backlog task edit 42 --append-notes "Implemented X" --append-notes "Added tests"
```

```bash
# Example
backlog task edit 42 --notes "Implemented using pattern X because Reason Y, modified files Z and W"
```

**IMPORTANT**: Do NOT include an Implementation Plan when creating a task. The plan is added only after you start the
implementation.

- Creation phase: provide Title, Description, Acceptance Criteria, and optionally labels/priority/assignee.
- When you begin work, switch to edit, set the task in progress and assign to yourself
  `backlog task edit <id> -s "In Progress" -a "..."`.
- Think about how you would solve the task and add the plan: `backlog task edit <id> --plan "..."`.
- Add Implementation Notes only after completing the work: `backlog task edit <id> --notes "..."` (replace) or append progressively using `--append-notes`.

## Phase discipline: What goes where

- Creation: Title, Description, Acceptance Criteria, labels/priority/assignee.
- Implementation: Implementation Plan (after moving to In Progress and assigning to yourself).
- Wrap-up: Implementation Notes (Like a PR description), AC and Definition of Done checks.

**IMPORTANT**: Only implement what's in the Acceptance Criteria. If you need to do more, either:

1. Update the AC first: `backlog task edit 42 --ac "New requirement"`
2. Or create a new follow up task: `backlog task create "Additional feature"`

---

## 6. Typical Workflow

```bash
# 1. Identify work
backlog task list -s "To Do" --plain

# 2. Read task details
backlog task 42 --plain

# 3. Start work: assign yourself & change status
backlog task edit 42 -s "In Progress" -a @myself

# 4. Add implementation plan
backlog task edit 42 --plan "1. Analyze\n2. Refactor\n3. Test"

# 5. Work on the task (write code, test, etc.)

# 6. Mark acceptance criteria as complete (supports multiple in one command)
backlog task edit 42 --check-ac 1 --check-ac 2 --check-ac 3  # Check all at once
# Or check them individually if preferred:
# backlog task edit 42 --check-ac 1
# backlog task edit 42 --check-ac 2
# backlog task edit 42 --check-ac 3

# 7. Add implementation notes (PR Description)
backlog task edit 42 --notes "Refactored using strategy pattern, updated tests"

# 8. Mark task as done
backlog task edit 42 -s Done
```

---

## 7. Definition of Done (DoD)

A task is **Done** only when **ALL** of the following are complete:

### ✅ Via CLI Commands:

1. **All acceptance criteria checked**: Use `backlog task edit <id> --check-ac <index>` for each
2. **Implementation notes added**: Use `backlog task edit <id> --notes "..."`
3. **Status set to Done**: Use `backlog task edit <id> -s Done`

### ✅ Via Code/Testing:

4. **Tests pass**: Run test suite and linting
5. **Documentation updated**: Update relevant docs if needed
6. **Code reviewed**: Self-review your changes
7. **No regressions**: Performance, security checks pass

⚠️ **NEVER mark a task as Done without completing ALL items above**

---

## 8. Finding Tasks and Content with Search

When users ask you to find tasks related to a topic, use the `backlog search` command with `--plain` flag:

```bash
# Search for tasks about authentication
backlog search "auth" --plain

# Search only in tasks (not docs/decisions)
backlog search "login" --type task --plain

# Search with filters
backlog search "api" --status "In Progress" --plain
backlog search "bug" --priority high --plain
```

**Key points:**
- Uses fuzzy matching - finds "authentication" when searching "auth"
- Searches task titles, descriptions, and content
- Also searches documents and decisions unless filtered with `--type task`
- Always use `--plain` flag for AI-readable output

---

## 9. Quick Reference: DO vs DON'T

### Viewing and Finding Tasks

| Task         | ✅ DO                        | ❌ DON'T                         |
|--------------|-----------------------------|---------------------------------|
| View task    | `backlog task 42 --plain`   | Open and read .md file directly |
| List tasks   | `backlog task list --plain` | Browse backlog/tasks folder     |
| Check status | `backlog task 42 --plain`   | Look at file content            |
| Find by topic| `backlog search "auth" --plain` | Manually grep through files |

### Modifying Tasks

| Task          | ✅ DO                                 | ❌ DON'T                           |
|---------------|--------------------------------------|-----------------------------------|
| Check AC      | `backlog task edit 42 --check-ac 1`  | Change `- [ ]` to `- [x]` in file |
| Add notes     | `backlog task edit 42 --notes "..."` | Type notes into .md file          |
| Change status | `backlog task edit 42 -s Done`       | Edit status in frontmatter        |
| Add AC        | `backlog task edit 42 --ac "New"`    | Add `- [ ] New` to file           |

---

## 10. Complete CLI Command Reference

### Task Creation

| Action           | Command                                                                             |
|------------------|-------------------------------------------------------------------------------------|
| Create task      | `backlog task create "Title"`                                                       |
| With description | `backlog task create "Title" -d "Description"`                                      |
| With AC          | `backlog task create "Title" --ac "Criterion 1" --ac "Criterion 2"`                 |
| With all options | `backlog task create "Title" -d "Desc" -a @sara -s "To Do" -l auth --priority high` |
| Create draft     | `backlog task create "Title" --draft`                                               |
| Create subtask   | `backlog task create "Title" -p 42`                                                 |

### Task Modification

| Action           | Command                                     |
|------------------|---------------------------------------------|
| Edit title       | `backlog task edit 42 -t "New Title"`       |
| Edit description | `backlog task edit 42 -d "New description"` |
| Change status    | `backlog task edit 42 -s "In Progress"`     |
| Assign           | `backlog task edit 42 -a @sara`             |
| Add labels       | `backlog task edit 42 -l backend,api`       |
| Set priority     | `backlog task edit 42 --priority high`      |

### Acceptance Criteria Management

| Action              | Command                                                                     |
|---------------------|-----------------------------------------------------------------------------|
| Add AC              | `backlog task edit 42 --ac "New criterion" --ac "Another"`                  |
| Remove AC #2        | `backlog task edit 42 --remove-ac 2`                                        |
| Remove multiple ACs | `backlog task edit 42 --remove-ac 2 --remove-ac 4`                          |
| Check AC #1         | `backlog task edit 42 --check-ac 1`                                         |
| Check multiple ACs  | `backlog task edit 42 --check-ac 1 --check-ac 3`                            |
| Uncheck AC #3       | `backlog task edit 42 --uncheck-ac 3`                                       |
| Mixed operations    | `backlog task edit 42 --check-ac 1 --uncheck-ac 2 --remove-ac 3 --ac "New"` |

### Task Content

| Action           | Command                                                  |
|------------------|----------------------------------------------------------|
| Add plan         | `backlog task edit 42 --plan "1. Step one\n2. Step two"` |
| Add notes        | `backlog task edit 42 --notes "Implementation details"`  |
| Add dependencies | `backlog task edit 42 --dep task-1 --dep task-2`         |

### Multi‑line Input (Description/Plan/Notes)

The CLI preserves input literally. Shells do not convert `\n` inside normal quotes. Use one of the following to insert real newlines:

- Bash/Zsh (ANSI‑C quoting):
  - Description: `backlog task edit 42 --desc $'Line1\nLine2\n\nFinal'`
  - Plan: `backlog task edit 42 --plan $'1. A\n2. B'`
  - Notes: `backlog task edit 42 --notes $'Done A\nDoing B'`
  - Append notes: `backlog task edit 42 --append-notes $'Progress update line 1\nLine 2'`
- POSIX portable (printf):
  - `backlog task edit 42 --notes "$(printf 'Line1\nLine2')"`
- PowerShell (backtick n):
  - `backlog task edit 42 --notes "Line1`nLine2"`

Do not expect `"...\n..."` to become a newline. That passes the literal backslash + n to the CLI by design.

Descriptions support literal newlines; shell examples may show escaped `\\n`, but enter a single `\n` to create a newline.

### Implementation Notes Formatting

- Keep implementation notes human-friendly and PR-ready: use short paragraphs or
  bullet lists instead of a single long line.
- Lead with the outcome, then add supporting details (e.g., testing, follow-up
  actions) on separate lines or bullets.
- Prefer Markdown bullets (`-` for unordered, `1.` for ordered) so Maintainers
  can paste notes straight into GitHub without additional formatting.
- When using CLI flags like `--append-notes`, remember to include explicit
  newlines. Example:

  ```bash
  backlog task edit 42 --append-notes $'- Added new API endpoint\n- Updated tests\n- TODO: monitor staging deploy'
  ```

### Task Operations

| Action             | Command                                      |
|--------------------|----------------------------------------------|
| View task          | `backlog task 42 --plain`                    |
| List tasks         | `backlog task list --plain`                  |
| Search tasks       | `backlog search "topic" --plain`              |
| Search with filter | `backlog search "api" --status "To Do" --plain` |
| Filter by status   | `backlog task list -s "In Progress" --plain` |
| Filter by assignee | `backlog task list -a @sara --plain`         |
| Archive task       | `backlog task archive 42`                    |
| Demote to draft    | `backlog task demote 42`                     |

---

## Common Issues

| Problem              | Solution                                                           |
|----------------------|--------------------------------------------------------------------|
| Task not found       | Check task ID with `backlog task list --plain`                     |
| AC won't check       | Use correct index: `backlog task 42 --plain` to see AC numbers     |
| Changes not saving   | Ensure you're using CLI, not editing files                         |
| Metadata out of sync | Re-edit via CLI to fix: `backlog task edit 42 -s <current-status>` |

---

## Remember: The Golden Rule

**🎯 If you want to change ANYTHING in a task, use the `backlog task edit` command.**
**📖 Use CLI to read tasks, exceptionally READ task files directly, never WRITE to them.**

Full help available: `backlog --help`

<!-- BACKLOG.MD GUIDELINES END -->

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
