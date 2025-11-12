## Contributing to Travel Book JS

Thank you for your interest in contributing. This project accepts improvements, bug fixes and documentation updates. Contributions should follow the repository conventions and respect the client-only runtime constraint (no server runtime code at runtime).

Getting started

1. Fork the repository and create a feature branch from `main` (or the default branch used by maintainers). Use descriptive branch names like `feat/<short-description>` or `fix/<short-description>`.
2. Run the project locally:

```bash
npm install
npm run dev
```

Coding conventions

- TypeScript strict mode is enabled. Keep types explicit where helpful.
- Use ES2015 classes and constructor-based dependency injection patterns as the project follows an OOP style.
- Singletons: core utility services are implemented as singletons (getInstance()).
- Builders and orchestrators should be instantiated per use, not as singletons.

Tests & QA

-- Unit tests: Vitest. Run `npm run test` and add tests for new logic. Aim for clear, small tests (happy path + 1 edge case).
-- Type checking: run `npm run typecheck`.


Backlog.md workflow (required)

This project uses Backlog.md to manage tasks, decisions (ADRs) and documentation. All contributors must create the relevant Backlog.md entries when they work on features, bugs, or architectural changes.

Backlog.md repository: https://github.com/MrLesk/Backlog.md

Typical commands (run from the project root):

```bash
# create a new task
backlog task create "Short task title"

# create a decision (ADR)
backlog decision create "ADR - Short Decision Title"

# create a documentation page in backlog
backlog document create "Design Notes"
```

If you are unfamiliar with Backlog.md, read the backlog workflow overview in `backlog/` or run `backlog --help`.

Other useful scripts:

```bash
# fetch country maps or external assets used by dev scripts
npm run fetch:maps
```

Pull requests

- Open PRs against the main integration branch. Provide a clear description, screenshots (if UI changes), and tests when applicable.
- For architectural changes, add an ADR under `backlog/decisions/` describing the context, decision and consequences.

Local runtime constraint

All code that runs in the browser must not rely on a server-side runtime. Network calls to external APIs are allowed only when relevant and with explicit fallback; prefer local data and resources.

Contact

If you have questions, open an issue describing your proposal or join any maintainer communication channel listed in the project docs.
