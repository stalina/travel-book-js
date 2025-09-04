# travel-book-js (SPA Vue 3)

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

 Allez dans l’onglet "Viewer" et cliquez sur "Afficher dans l'application" pour voir le livre intégré (sans Service Worker ni blob).
 Utilisez "Télécharger (fichier unique)" pour exporter un HTML autonome (toutes ressources inlinées).

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
