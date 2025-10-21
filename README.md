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

