---
title: 'Versioning, Build and Deployment Guide'
created_date: '2025-11-10 23:39'
id: doc-9
type: other
---

# Versioning, Build and Deployment Guide

This document describes how to version the project, build it locally, run tests, and deploy the resulting static artifacts.

## Versioning policy

- Follow Semantic Versioning: MAJOR.MINOR.PATCH.
- Use branch-based releases: `release/x.y.z` when preparing a release.
- Use conventional commits to generate changelogs when useful. Commit prefixes: `feat:`, `fix:`, `chore:`, `docs:`.

## Local development

- Install dependencies:

```bash
npm install
```

- Start development server:

```bash
npm run dev
```

- Build production bundle:

```bash
npm run build
# output is in dist/
```

## Tests and quality gates

- Run unit tests:

```bash
npm test
# or
npm run test
```

- Linting and type checks:

```bash
npm run lint
npm run typecheck
```

- CI pipeline should run: install, lint, typecheck, test, build.

## CI example (GitHub Actions)

- Simple workflow steps:
  1. Checkout
  2. Use Node.js (setup-node)
  3. Install dependencies
  4. Run lint
  5. Run typecheck
  6. Run tests
  7. Run build
  8. Deploy or upload artifacts

## Deployment targets

- GitHub Pages:
  - Use `gh-pages` package or a GitHub Action to build and push to the `gh-pages` branch.
  - Configure repository Pages to use the `gh-pages` branch or `docs/` folder.

- Netlify:
  - Link the repository, set build command `npm run build` and publish directory `dist/`.

- Vercel:
  - Link the repository, set build command `npm run build` and output directory `dist/`.

## Release & tagging process

1. Create release branch: `git checkout -b release/x.y.z`.
2. Update `package.json` version.
3. Run `npm ci && npm run build && npm test`.
4. Commit changes and push branch.
5. Open a PR and merge to main when green.
6. Tag the commit: `git tag -a vX.Y.Z -m "Release vX.Y.Z"` and push tags.

## Rollback strategy

- Re-deploy an earlier tag/commit.
- Maintain stable build artifacts if needed in CI artifacts storage.

## Notes and constraints

- Ensure runtime code is browser-compatible — no Node-only APIs (e.g., fs) at runtime.
- For GitHub Pages, prefer building on CI and deploying the `dist/` artifact.

---

_Last updated: 2025-11-11_
