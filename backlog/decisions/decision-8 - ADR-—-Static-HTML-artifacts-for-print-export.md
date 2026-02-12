---
id: decision-8
title: ADR — Static HTML artifacts for print/export
date: '2025-11-10 23:04'
status: accepted
---
## Context
The application produces travel books intended to be printable or exportable (PDF). The UX requires precise pagination, page-break rules, and predictable styling across browsers and print renderers.

## Decision
Generate static HTML artifacts tailored for print/export with dedicated CSS rules (page breaks, print-safe fonts, cover/stat pages) and maintain a consistent structure (`div.break-after.*`) to control pagination.

## Consequences

- Predictable print layout and easier PDF conversion via headless browsers.
- Need to maintain separate styles and test printing across target browsers.
- Slight increase in CSS and layout maintenance work.

