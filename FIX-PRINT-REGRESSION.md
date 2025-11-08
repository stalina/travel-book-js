# Correctif : Régression d'impression et rendu visuel des photos

## Problèmes identifiés

### 1. Pages blanches à l'impression
Lors de l'impression du document HTML généré (Travel Book), les pages contenant des photos apparaissaient blanches, alors que le rendu à l'écran était correct.

### 2. Rendu visuel incorrect des photos
- **Coins arrondis non souhaités** sur les photos (border-radius: 18px)
- **Style des numéros de photo changé** : fond noir arrondi en bas à droite au lieu de rouge centré en bas
- **Espacement excessif** : gap de 24px et padding de 20px sur le layout
- **Fond gris** sur les conteneurs de photos (background: #f4f6f8)

### 3. Pages supplémentaires vides
Le padding de 20px sur `.break-after` n'était pas supprimé en mode print, causant des débordements et des pages vides.

## Cause racine

La refonte du système de mise en page des photos (migration vers `StepGenerationPlan`) a introduit de nouveaux styles CSS qui ne correspondaient pas au rendu original :

### Ancien code (fonctionnel)
```css
.photo-container {
  background-size: auto 100%;
  border-radius: 0;
  /* Pas de padding ni coins arrondis */
}

.photo-index {
  bottom: 30px;
  left: 50%;
  color: red;
  font-size: 40px;
}
```

### Nouveau code (problématique)
```css
.layout-photo {
  border-radius: 18px;     /* ❌ Coins arrondis */
  background: #f4f6f8;     /* ❌ Fond gris */
}

.layout-photo-index {
  bottom: 16px;
  right: 16px;             /* ❌ Position changée */
  background: rgba(0, 0, 0, 0.6);  /* ❌ Fond noir */
  color: #fff;             /* ❌ Texte blanc */
}

.step-layout {
  gap: 24px;               /* ❌ Espacement trop grand */
  padding: 20px;           /* ❌ Padding en double avec .break-after */
}
```

## Solution appliquée

### 1. Ajout de `print-color-adjust: exact` pour l'impression
Force le navigateur à afficher les images de fond lors de l'impression sur :
- `.layout-photo-image` (photos dans les pages)
- `.cover-background` (page de couverture)
- `.photo-container` (ancien système, par sécurité)

### 2. Restauration du style visuel original

#### Conteneur de photos
```css
.layout-photo {
  border-radius: 0;        /* ✅ Pas de coins arrondis */
  overflow: visible;       /* ✅ Pas de clip */
  background: transparent; /* ✅ Pas de fond gris */
}
```

#### Numéros de photos
```css
.layout-photo-index {
  bottom: 30px;            /* ✅ Position originale */
  left: 50%;               /* ✅ Centré horizontalement */
  transform: translate(-50%, 0);
  background: transparent; /* ✅ Pas de fond noir */
  color: red;              /* ✅ Texte rouge */
  font-size: 40px;         /* ✅ Taille originale */
}
```

#### Layout et espacement
```css
.step-layout {
  gap: 20px;               /* ✅ Espacement original */
  padding: 0;              /* ✅ Suppression du double padding */
}

@media print {
  .break-after {
    padding: 0;            /* ✅ Suppression du padding à l'impression */
  }
}
```

## Explication technique

### Problème d'impression : `print-color-adjust`
La propriété CSS `print-color-adjust` (anciennement `-webkit-print-color-adjust`) contrôle si le navigateur peut optimiser les couleurs lors de l'impression. 

**Valeurs :**
- `economy` (par défaut) : Le navigateur peut supprimer les images de fond pour économiser l'encre
- `exact` : Force le navigateur à respecter exactement les couleurs et images de fond

Chrome/Safari supprime par défaut les `background-image` lors de l'impression à moins que `print-color-adjust: exact` soit explicitement défini.

### Problème de pages vides : padding en cascade
Le HTML généré a la structure suivante :
```html
<div class="break-after">           <!-- padding: 20px -->
  <div class="step-layout">         <!-- était padding: 20px aussi ! -->
    <div class="layout-photo">...</div>
  </div>
</div>
```

Le double padding (20px + 20px = 40px) causait un débordement de hauteur, créant des pages vides. De plus, le padding de `.break-after` n'était pas supprimé en mode print.

**Solution :**
- Suppression du padding sur `.step-layout` (padding: 0)
- Ajout de `padding: 0` sur `.break-after` en mode `@media print`

## Tests

✅ Tous les tests unitaires passent (32 fichiers, 257 tests)
✅ Pas de régression détectée

## Changements détaillés dans `public/assets/style.css`

| Propriété | Avant | Après | Raison |
|-----------|-------|-------|--------|
| `.step-layout` `gap` | 24px | 20px | ✅ Correspondance avec l'ancien système |
| `.step-layout` `padding` | 20px | 0 | ✅ Évite le double padding avec `.break-after` |
| `.layout-photo` `border-radius` | 18px | 0 | ✅ Pas de coins arrondis comme l'original |
| `.layout-photo` `background` | #f4f6f8 | transparent | ✅ Pas de fond gris |
| `.layout-photo-index` `bottom` | 16px | 30px | ✅ Position originale |
| `.layout-photo-index` position | right: 16px | left: 50% + transform | ✅ Centré comme l'original |
| `.layout-photo-index` `color` | #fff | red | ✅ Rouge comme l'original |
| `.layout-photo-index` `font-size` | 28px | 40px | ✅ Taille originale |
| `.layout-photo-index` `background` | rgba(0,0,0,0.6) | transparent | ✅ Pas de fond noir |
| `@media print .break-after` | - | padding: 0 | ✅ Évite les pages vides |
| Toutes images de fond | - | print-color-adjust: exact | ✅ Force l'impression |

## À tester manuellement

1. **Import et génération**
   - Importer un album Polarstep
   - Générer le Travel Book sans modification
   
2. **Rendu à l'écran**
   - Ouvrir le HTML généré dans Chrome/Safari
   - Vérifier que les photos n'ont **PAS** de coins arrondis ✅
   - Vérifier que les numéros sont **rouges et centrés en bas** de chaque photo ✅
   - Vérifier qu'il n'y a **pas de fond gris** autour des photos ✅
   - Vérifier que l'espacement entre les photos semble correct ✅
   
3. **Impression**
   - Lancer l'impression (Cmd+P / Ctrl+P) ou "Enregistrer en PDF"
   - Vérifier que :
     - La page de couverture affiche bien la photo de fond ✅
     - Les pages de statistiques s'affichent correctement ✅
     - Les pages de photos montrent bien les images (pas de pages blanches) ✅
     - Il n'y a **pas de pages vides supplémentaires** entre les pages de contenu ✅
     - Les numéros de photos ne s'affichent pas (cachés en mode print) ✅

## Fichiers modifiés

- `public/assets/style.css` : 
  - Ajout de `print-color-adjust: exact` sur 3 classes CSS
  - Restauration des styles visuels originaux (pas de coins arrondis, numéros rouges centrés)
  - Suppression du double padding (pages vides)

## Impact visuel attendu

### Avant (problématique)
- 📸 Photos avec coins arrondis (18px)
- 🔢 Numéros blancs sur fond noir en bas à droite
- 🎨 Fond gris (#f4f6f8) autour des photos
- 📄 Pages blanches à l'impression
- ⚠️ Pages vides supplémentaires (débordement)

### Après (corrigé)
- 📸 Photos avec coins nets (border-radius: 0)
- 🔢 Numéros rouges centrés en bas
- 🎨 Pas de fond (transparent)
- 📄 Photos visibles à l'impression
- ✅ Pas de pages vides (padding correct)

## Références

- [MDN: print-color-adjust](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust)
- [CSS Working Group: color-adjust](https://drafts.csswg.org/css-color-adjust-1/#print-color-adjust)
