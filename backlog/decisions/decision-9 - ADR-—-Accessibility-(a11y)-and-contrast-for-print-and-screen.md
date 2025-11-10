---
id: decision-9
title: ADR — Accessibility (a11y) and contrast for print and screen
date: '2025-11-10 23:04'
status: accepted
---
## Context
The travel books will be consumed both on-screen and in print. Ensuring accessibility (semantic HTML, ARIA where needed, keyboard navigation) and sufficient contrast for printed pages and screens is important for inclusivity and compliance.

## Decision
Adopt accessibility best practices: use semantic markup, provide ARIA labels for interactive controls, ensure keyboard navigation where applicable, and enforce contrast ratios suitable for screen and print. Add accessibility checks to CI where practical.

## Consequences

- Improved inclusivity and better compliance with accessibility guidelines.
- Additional development and testing effort (contrast checks, semantic markup reviews).
- May require visual adjustments for print-specific contrast and color usage.

