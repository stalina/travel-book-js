Release v0.1.0 — Minor release

Highlights
- Initial public release of Travel Book JS.
- Generates a printable Travel Book with:
  - Cover page (auto-generated from trip data / first photo fallback)
  - Statistics page (country list, total distance, days, photos)
  - Map page (SVG route + step thumbnails)
- All generation code runs entirely in the browser (no server-side runtime).
- Unit tests included (Vitest), basic styles and assets.

Notes
- This release is intended as a first stable minor release. Some UI polish and performance improvements are planned in follow-ups.
- If you find regressions in printing or CSS page-breaks, open an issue with a minimal reproduction.

How to use
1. Build the app: `npm run build`.
2. Open `dist/index.html` (or deploy `dist/` to a static host).
3. See README.md for usage and examples.

Files changed
- main logic in `src/services/generate.service.ts` (cover/stats/map builders)
- styles in `public/assets/style.css`
- tests in `tests/generate.service.spec.ts` and related specs
