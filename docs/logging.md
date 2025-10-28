# Système de Logging du Travel Book

## Vue d'ensemble

Le générateur de travel book utilise un système de logging à plusieurs niveaux pour faciliter le débogage et suivre la progression de la génération.

**Fichier source** : `src/services/logger.service.ts`  
**Tests unitaires** : `tests/logger.service.spec.ts` (24 tests)

## Niveaux de log

### INFO (toujours affiché)
Affiche les étapes importantes de la génération :
- Début de la génération
- Chargement des assets
- Chargement des altitudes
- Génération de chaque section (couverture, stats, carte, étapes)
- Fin de la génération

### DEBUG (affiché uniquement en mode debug)
Affiche les détails de chaque opération :
- Taille des assets chargés
- Photos sélectionnées pour chaque étape
- Ratios des photos
- Détails des mappings
- etc.

## Activer le mode debug

### Depuis la console du navigateur

```javascript
// Activer le mode debug
window.TravelBook.enableDebug(true)

// Vérifier si le mode debug est activé
window.TravelBook.isDebugEnabled()

// Désactiver le mode debug
window.TravelBook.enableDebug(false)
```

### Dans le code

```typescript
import { logger } from './services/logger.service'

// Activer le mode debug
logger.setDebugEnabled(true)

// Vérifier si le mode debug est activé
logger.isDebugEnabled()
```

## Exemple de logs

### Mode normal (INFO uniquement)

```
[TravelBook][generate] Début de la génération { tripId: 1, steps: 5 }
[TravelBook][generate] Chargement des assets CSS et fonts
[TravelBook][generate] Chargement des altitudes en masse
[TravelBook][generate] Traitement de 5 étapes
[TravelBook][generate] Chargement des cartes SVG des pays
[TravelBook][generate] Génération de la page de couverture
[TravelBook][generate] Génération de la page de statistiques
[TravelBook][generate] Génération de la page carte
[TravelBook][generate] Génération des pages pour 5 étapes
[TravelBook][TIMING] generateArtifacts 2340ms
[TravelBook][generate] Génération terminée { manifestEntries: 42 }
[TravelBook][generate] Construction du fichier HTML autonome
[TravelBook][TIMING] buildSingleFileHtml 450ms
[TravelBook][generate] Fichier HTML autonome prêt { size: 1234567 }
```

### Mode debug (INFO + DEBUG)

```
[TravelBook][generate] Début de la génération { tripId: 1, steps: 5 }
[TravelBook][generate] Chargement des assets CSS et fonts
[TravelBook][DEBUG][generate] Assets CSS chargés { styleLen: 12456, fontsLen: 1234 }
[TravelBook][DEBUG][generate] Font Brandon_Grotesque_medium.otf inclus { size: 45678 }
[TravelBook][DEBUG][generate] Font inclus: NotoSerif-Regular.woff2
[TravelBook][DEBUG][generate] Font inclus: NotoSerif-Italic.woff2
[TravelBook][generate] Chargement des altitudes en masse
[TravelBook][DEBUG][generate] Altitudes chargées { total: 5, resolved: 5 }
[TravelBook][generate] Traitement de 5 étapes
[TravelBook][DEBUG][generate] Traitement étape: Paris { id: 10 }
[TravelBook][DEBUG][generate] Photos sélectionnées { count: 8 }
[TravelBook][DEBUG][generate] Ratios calculés { portrait: 3, landscape: 5, unknown: 0 }
[TravelBook][DEBUG][generate] Politique de couverture { useCover: true }
[TravelBook][DEBUG][generate] Couverture choisie { index: 1, ratio: 'LANDSCAPE' }
[TravelBook][DEBUG][generate] Pages par lignes générées
... (répété pour chaque étape)
[TravelBook][DEBUG][generate] Manifest initialisé { entries: 42 }
[TravelBook][DEBUG][generate] Template HTML personnalisé appliqué
[TravelBook][generate] Chargement des cartes SVG des pays
[TravelBook][DEBUG][generate] Carte SVG incluse: fr { size: 12345 }
[TravelBook][DEBUG][generate] Carte SVG incluse: it { size: 23456 }
[TravelBook][generate] Génération de la page de couverture
[TravelBook][generate] Génération de la page de statistiques
[TravelBook][generate] Génération de la page carte
[TravelBook][DEBUG][map-builder] Construction de la section carte
[TravelBook][DEBUG][map-builder] Récupération des tuiles satellite { zoom: 6, tilesX: 4, tilesY: 3 }
[TravelBook][DEBUG][map-builder] Tuile récupérée: 32,21
[TravelBook][DEBUG][map-builder] Tuile récupérée: 32,22
... (une ligne par tuile)
[TravelBook][DEBUG][map-builder] Tuiles satellite récupérées { count: 12 }
[TravelBook][DEBUG][map-builder] ViewBox ajustée calculée { x: ..., y: ..., width: ..., height: ... }
[TravelBook][DEBUG][map-builder] Tracé de l'itinéraire généré { length: 245, steps: 5 }
[TravelBook][DEBUG][map-builder] Vignettes d'étapes générées { count: 5 }
[TravelBook][generate] Génération des pages pour 5 étapes
[TravelBook][DEBUG][generate] HTML travel_book généré { size: 987654 }
[TravelBook][TIMING] generateArtifacts 2340ms
[TravelBook][generate] Génération terminée { manifestEntries: 42 }
[TravelBook][generate] Construction du fichier HTML autonome
[TravelBook][DEBUG][generate] DataURL map construite { assets: 42 }
[TravelBook][DEBUG][generate] Styles inlinés { blocks: 2 }
[TravelBook][DEBUG][generate] Assets inlinés
[TravelBook][TIMING] buildSingleFileHtml 450ms
[TravelBook][generate] Fichier HTML autonome prêt { size: 1234567 }
```

## Utilisation dans le code

### Pour ajouter des logs INFO (étapes importantes)

```typescript
logger.info('module', 'Message important')
logger.info('module', 'Message avec données', { key: 'value' })
```

### Pour ajouter des logs DEBUG (détails)

```typescript
logger.debug('module', 'Message de debug')
logger.debug('module', 'Message avec détails', { count: 42 })
```

### Pour mesurer le temps d'exécution

```typescript
logger.time('operationName')
// ... opération ...
logger.timeEnd('operationName', true)  // true = afficher même en mode production
```

## Conseils

- Utilisez **INFO** pour les étapes que l'utilisateur devrait voir (progression de la génération)
- Utilisez **DEBUG** pour les détails techniques utiles au débogage
- Le mode debug est désactivé par défaut pour ne pas surcharger la console
- Activez le mode debug uniquement quand vous avez besoin d'investiguer un problème
