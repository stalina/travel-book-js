# 🚀 Guide de Démarrage Rapide - Maquettes Travel Book

## ⚡ Lancement Express (3 secondes)

### Option 1 : Un seul fichier
```bash
# Ouvrir directement l'index dans votre navigateur
open docs/mockups/mockups-index.html
```

### Option 2 : Serveur local (Recommandé)
```bash
# Démarrer le serveur
cd docs/mockups
python3 -m http.server 8888

# Dans un autre terminal ou navigateur
open http://localhost:8888/mockups-index.html
```

---

## 📂 Fichiers à Consulter

### 🎨 Maquettes Interactives
1. **`mockups-index.html`** → Page d'accueil des maquettes (commencez ici !)
2. **`index.html`** → Landing page moderne
3. **`editor.html`** → Éditeur principal avec drag & drop
4. **`gallery.html`** → Galerie photos intelligente
5. **`timeline.html`** → Timeline interactive

### 📖 Documentation
6. **`README.md`** → Documentation technique complète
7. **`VISION-PRODUIT.md`** → Vision stratégique et roadmap
8. **`PRESENTATION.md`** → Présentation du projet
9. **`DELIVERABLES.md`** → Liste des livrables
10. **`CREDITS.md`** → Crédits et licences

### 🎨 Styles
11. **`design-system.css`** → Système de design réutilisable

---

## 🎯 Navigation Recommandée

### Première Visite
1. Ouvrir `mockups-index.html` → Hub central avec liens vers tout
2. Cliquer sur chaque maquette pour explorer
3. Lire `PRESENTATION.md` pour vue d'ensemble
4. Consulter `README.md` pour détails techniques

### Pour Développeurs
1. Lire `README.md` → Documentation technique
2. Examiner `design-system.css` → Variables et composants
3. Analyser le code source de chaque maquette
4. Consulter `VISION-PRODUIT.md` → Roadmap d'implémentation

### Pour Décideurs/Product Owners
1. Lire `PRESENTATION.md` → Vue d'ensemble
2. Explorer les maquettes interactives
3. Consulter `VISION-PRODUIT.md` → Stratégie produit
4. Lire `DELIVERABLES.md` → Ce qui a été livré

---

## 💡 Interactions à Tester

### Landing Page (`index.html`)
- ✅ Scroll → Animations des cartes
- ✅ Hover sur features → Effet de survol
- ✅ Clic "Créer mon album" → Navigation
- ✅ Clic "Voir une démo" → Smooth scroll

### Éditeur (`editor.html`)
- ✅ Drag & drop des étapes dans la sidebar
- ✅ Clic sur étape → Activation
- ✅ Édition titre (contenteditable)
- ✅ Hover sur photo → Actions overlay
- ✅ Onglets sidebar (Étapes/Thèmes/Options)
- ✅ Preview modes (mobile/desktop/PDF)
- ✅ Auto-save (éditer → indicateur change)

### Galerie (`gallery.html`)
- ✅ Filtres (lieu, date, tag)
- ✅ Modes d'affichage (grille/compacte/liste)
- ✅ Sélection photos → Barre d'actions apparaît
- ✅ Clic "Éditer" → Modal éditeur
- ✅ Filtres photo (Original, Vivid, Nature...)
- ✅ Sliders ajustements (luminosité, contraste, saturation)
- ✅ Recadrage (ratios 16:9, 4:3, 1:1...)

### Timeline (`timeline.html`)
- ✅ Clic marqueur carte → Sélectionne étape
- ✅ Clic étape → Active marqueur
- ✅ Play/pause → Défilement automatique
- ✅ Clic barre progression → Seek
- ✅ Filtres catégories (Tout, Nature, Culture...)
- ✅ Synchronisation carte ↔ timeline

---

## 🛠️ Commandes Utiles

### Serveur Local
```bash
# Démarrer serveur Python
python3 -m http.server 8888

# Ou avec Node.js (si http-server installé)
npx http-server -p 8888

# Ou avec PHP
php -S localhost:8888
```

### Navigateur
```bash
# macOS
open http://localhost:8888/mockups-index.html

# Linux
xdg-open http://localhost:8888/mockups-index.html

# Windows
start http://localhost:8888/mockups-index.html
```

### Édition
```bash
# Ouvrir dans VS Code
code docs/mockups/

# Ouvrir un fichier spécifique
code docs/mockups/editor.html
```

---

## 📱 Test sur Différents Devices

### Responsive Design Tester
1. Ouvrir une maquette dans Chrome/Firefox
2. Ouvrir DevTools (F12)
3. Activer mode responsive (Cmd+Shift+M / Ctrl+Shift+M)
4. Tester différentes résolutions :
   - Mobile : 375x667 (iPhone SE)
   - Tablet : 768x1024 (iPad)
   - Desktop : 1920x1080

### Points de Rupture (Breakpoints)
- **< 768px** : Mobile
- **768px - 1200px** : Tablet
- **> 1200px** : Desktop

---

## 🎨 Personnalisation

### Changer les Couleurs
Éditez `design-system.css` et modifiez les variables CSS :
```css
:root {
  --color-primary: #FF6B6B;     /* Rouge voyage */
  --color-secondary: #4ECDC4;   /* Turquoise */
  --color-accent: #FFE66D;      /* Jaune */
}
```

### Changer les Polices
```css
:root {
  --font-family-base: 'Votre Police', sans-serif;
  --font-family-display: 'Votre Police Titre', serif;
}
```

### Modifier les Espacements
```css
:root {
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  /* etc. */
}
```

---

## 🐛 Résolution de Problèmes

### Les animations ne fonctionnent pas
- ✅ Vérifier que JavaScript est activé
- ✅ Ouvrir la console (F12) pour voir les erreurs
- ✅ Tester dans un navigateur moderne (Chrome, Firefox, Safari)

### Le serveur ne démarre pas
- ✅ Vérifier que Python 3 est installé : `python3 --version`
- ✅ Essayer un autre port : `python3 -m http.server 9000`
- ✅ Vérifier qu'aucun autre serveur n'utilise le port 8888

### Les styles ne s'appliquent pas
- ✅ Vérifier que `design-system.css` est dans le même dossier
- ✅ Rafraîchir le cache du navigateur (Cmd+Shift+R / Ctrl+F5)
- ✅ Vérifier la console pour erreurs de chargement CSS

### Le drag & drop ne fonctionne pas
- ✅ Tester dans Chrome ou Firefox (meilleur support)
- ✅ Vérifier que vous glissez bien la "poignée" (⋮⋮)
- ✅ Essayer sur desktop (le mobile peut nécessiter touch events)

---

## 📊 Compatibilité

### Navigateurs Testés
| Navigateur | Version | Support |
|------------|---------|---------|
| Chrome     | 120+    | ✅ Complet |
| Firefox    | 120+    | ✅ Complet |
| Safari     | 17+     | ✅ Complet |
| Edge       | 120+    | ✅ Complet |
| IE11       | -       | ❌ Non supporté |

### Fonctionnalités Requises
- ✅ CSS Grid
- ✅ CSS Flexbox
- ✅ CSS Variables
- ✅ CSS Animations
- ✅ HTML5 Drag & Drop API
- ✅ Intersection Observer API
- ✅ ContentEditable

---

## 🎓 Ressources

### Documentation Interne
- `README.md` → Guide technique complet
- `VISION-PRODUIT.md` → Stratégie et roadmap
- `PRESENTATION.md` → Présentation projet
- `DELIVERABLES.md` → Liste livrables
- `CREDITS.md` → Licences et crédits

### Liens Externes
- [MDN Web Docs](https://developer.mozilla.org) → Référence Web
- [CSS-Tricks](https://css-tricks.com) → Techniques CSS
- [Vue.js](https://vuejs.org) → Framework recommandé
- [Unsplash](https://unsplash.com) → Photos gratuites

---

## ✅ Checklist Découverte

### Pour Commencer
- [ ] Ouvrir `mockups-index.html`
- [ ] Explorer les 4 maquettes
- [ ] Tester les interactions
- [ ] Lire `PRESENTATION.md`

### Pour Comprendre
- [ ] Lire `README.md`
- [ ] Examiner `design-system.css`
- [ ] Analyser le code source
- [ ] Consulter `VISION-PRODUIT.md`

### Pour Implémenter
- [ ] Lire roadmap dans `VISION-PRODUIT.md`
- [ ] Identifier patterns réutilisables
- [ ] Planifier migration vers Vue
- [ ] Prioriser fonctionnalités

---

## 🎉 C'est Parti !

Vous êtes prêt à explorer les maquettes ! Commencez par :

```bash
open docs/mockups/mockups-index.html
```

Ou avec serveur :

```bash
cd docs/mockups && python3 -m http.server 8888
# Puis ouvrir http://localhost:8888/mockups-index.html
```

**Bon voyage dans l'univers Travel Book ! ✈️**

---

**Besoin d'aide ?**
- 📖 Consultez `README.md`
- 🐛 Vérifiez la section "Résolution de Problèmes"
- 💬 Créez une issue dans la backlog
