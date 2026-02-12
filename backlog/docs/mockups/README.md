# 🎨 Maquettes Travel Book - Interface Moderne

Ce dossier contient les maquettes HTML interactives pour la refonte visuelle et fonctionnelle de Travel Book.

## 📋 Vue d'ensemble

Les maquettes présentent une vision complète d'un produit web moderne, user-friendly et esthétique pour la création d'albums de voyage. Elles sont entièrement fonctionnelles en HTML/CSS/JavaScript vanilla pour une démonstration interactive.

## 🎯 Objectifs du design

- **Moderne** : Interface épurée utilisant les dernières tendances (glassmorphism, gradients, micro-interactions)
- **User-friendly** : Navigation intuitive, drag & drop, feedback visuel immédiat
- **Esthétique** : Design system cohérent, palette de couleurs harmonieuse, typographie soignée
- **Original** : Fonctionnalités innovantes (IA suggestions, timeline interactive, éditeur contextuel)

## 📄 Maquettes disponibles

### 1. Landing Page (`index.html`)
**Page d'accueil avec onboarding**

**Fonctionnalités :**
- Hero section animée avec effet parallaxe
- Présentation des 9 fonctionnalités clés (cartes interactives)
- Section "Comment ça marche" avec 4 étapes visuelles
- Call-to-action multiples
- Bouton de démo flottant
- Animations au scroll

**Design highlights :**
- Gradient animé en background
- Cartes avec effet hover et barre de progression colorée
- Numéros d'étape en cercles gradient
- Responsive complet

---

### 2. Éditeur Principal (`editor.html`)
**Interface d'édition avec drag & drop avancé**

**Layout :**
- Header : titre du projet (éditable inline), statut sauvegarde, actions principales
- Sidebar gauche : liste des étapes (réorganisable par drag & drop), onglets (Étapes/Thèmes/Options)
- Zone centrale : toolbar contextuelle + canvas d'édition
- Panel droit : preview en temps réel + statistiques

**Fonctionnalités :**
- Drag & drop des étapes pour réorganisation
- Titre d'étape éditable inline
- Grille de photos avec overlay d'actions
- Éditeur de texte riche (contenteditable)
- Toolbar avec outils de formatage
- Preview multi-device (mobile/desktop/PDF)
- Auto-save avec indicateur visuel
- Statistiques temps réel (photos, étapes, jours, pages)

**Interactions :**
- Glisser-déposer fluide avec feedback visuel
- Hover effects sur tous les éléments cliquables
- États actifs bien marqués
- Transitions douces

---

### 3. Galerie Photos (`gallery.html`)
**Gestionnaire de photos intelligent**

**Fonctionnalités :**
- Filtres avancés (lieu, date, tag) avec selects stylés
- 3 modes d'affichage : grille / compacte / liste
- Sélection multiple avec checkbox (affichage au hover)
- Barre d'actions flottante pour sélection groupée
- Badges IA "Coup de cœur" sur photos recommandées
- Modal d'édition complète intégrée

**Éditeur de photo intégré :**
- Canvas principal avec image
- Sidebar avec :
  - 6 filtres prédéfinis (Original, Vivid, Nature, Urban, Vintage, B&W)
  - Sliders d'ajustement (luminosité, contraste, saturation)
  - Options de recadrage (16:9, 4:3, 1:1, 9:16, libre)
- Actions : annuler, valider, fermer

**Suggestions de mise en page :**
- Panel avec 4 layouts recommandés
- Preview visuelle de chaque layout
- Grille 2×2, Hero+2, 3 colonnes, pleine page

**Design highlights :**
- Cards photos avec effet zoom au hover
- Overlay semi-transparent avec actions
- Sélection marquée par bordure colorée
- Barre d'actions avec glassmorphism
- Modal plein écran avec grid layout

---

### 4. Timeline Interactive (`timeline.html`)
**Visualisation chronologique du voyage**

**Layout split-screen :**
- Gauche : carte interactive avec marqueurs animés
- Droite : timeline scrollable des étapes

**Fonctionnalités :**
- Marqueurs cliquables sur la carte (numérotés)
- Tooltip au hover sur chaque marqueur
- Animation pulse sur marqueur actif
- Contrôles de lecture (play/pause)
- Barre de progression interactive (clic pour naviguer)
- Filtres par catégorie (Tout, Nature, Culture, Gastronomie)
- Cards d'étape avec thumbnail, résumé, métadonnées
- Synchronisation carte ↔ timeline

**Barre de stats en footer :**
- 4 métriques clés : Photos, Kilomètres, Étapes, Jours
- Icônes colorées avec gradients différents
- Design compact et lisible

**Interactions :**
- Clic sur marqueur → activation étape correspondante
- Clic sur étape → activation marqueur + scroll
- Play automatique avec transition toutes les 3s
- Seek sur barre de progression

---

## 🎨 Design System (`design-system.css`)

### Variables CSS organisées

**Palette de couleurs :**
- Primary : `#FF6B6B` (rouge voyage)
- Secondary : `#4ECDC4` (turquoise)
- Accent : `#FFE66D` (jaune soleil)
- Neutrals : background, surface, borders
- States : success, warning, error, info

**Typographie :**
- Base : System fonts (San Francisco, Segoe UI, Roboto)
- Display : Georgia (pour titres élégants)
- Mono : SF Mono (code/données)
- Tailles : xs (12px) à 5xl (48px)
- Weights : normal, medium, semibold, bold

**Espacement :**
- Scale cohérente : xs (4px) à 4xl (96px)
- Basé sur multiples de 4px

**Bordures :**
- Radius : sm (6px) à 2xl (24px) + full (cercle)
- Ombres : 5 niveaux (sm à 2xl) + inner

**Composants réutilisables :**
- Boutons (primary, secondary, outline, ghost) + tailles (sm, base, lg)
- Cards avec header/title/subtitle
- Badges (primary, secondary, success, warning)
- Inputs et labels
- Animations prédéfinies (fadeIn, slideInUp, pulse)

**Utilitaires :**
- Flexbox : `.flex`, `.flex-col`, `.items-center`, etc.
- Grid : `.grid`, `.grid-cols-2/3/4`
- Spacing : `.gap-sm/md/lg`
- Text : `.text-center`, `.font-bold`
- Radius, shadows : classes prédéfinies

---

## 🚀 Fonctionnalités innovantes proposées

### 1. Intelligence Artificielle
- **Suggestions de photos** : analyse et recommandation des meilleures photos
- **Layouts automatiques** : proposition de mises en page optimales selon le contenu
- **Texte contextuel** : suggestions de descriptions basées sur les métadonnées (lieu, date)
- **Détection qualité** : identification des photos floues, mal cadrées

### 2. Édition avancée
- **Drag & drop universel** : réorganisation fluide des étapes, photos, blocs de texte
- **Preview temps réel** : visualisation instantanée sur tous devices
- **Édition inline** : modification directe des titres, textes sans popup
- **Historique undo/redo** : annulation illimitée des actions

### 3. Expérience utilisateur
- **Auto-save** : sauvegarde automatique avec indicateur visuel
- **Raccourcis clavier** : productivité accrue
- **Mode focus** : masquage des distractions pour écriture
- **Dark mode** : thème sombre pour travail de nuit

### 4. Export & Partage
- **Multi-format** : PDF (print), HTML (web), Instagram Stories, Twitter thread
- **Optimisation automatique** : compression images, responsive
- **Partage direct** : liens de partage, QR codes
- **Templates réseaux sociaux** : formats optimisés par plateforme

### 5. Collaboration (future)
- **Commentaires** : annotations sur photos/sections
- **Versions** : historique complet des modifications
- **Partage édition** : invitation collaborateurs
- **Suggestions** : propositions de modifications

---

## 🎯 Technologies & Approche

### Stack proposée
- **Vue 3 Composition API** : framework principal
- **TypeScript** : typage fort
- **Pinia** : gestion d'état
- **HTML5 APIs** :
  - File System Access API (lecture dossiers)
  - Canvas API (manipulation images)
  - Intersection Observer (animations scroll)
  - Drag & Drop API
- **CSS modernes** :
  - CSS Grid & Flexbox
  - CSS Variables (theming dynamique)
  - CSS Animations
- **Build** : Vite (performance optimale)

### Principes d'architecture
- **Component-based** : composants réutilisables
- **Atomic Design** : atoms → molecules → organisms
- **Mobile-first** : responsive par défaut
- **Progressive Enhancement** : fonctionnalités additionnelles selon support navigateur
- **Accessibility** : ARIA, contraste, navigation clavier
- **Performance** : lazy loading, code splitting, optimisation assets

---

## 📱 Responsive Design

Toutes les maquettes sont pensées pour s'adapter :

### Desktop (>1200px)
- Layout complet avec tous les panels
- Sidebar + main + preview

### Tablet (768px - 1200px)
- Layout simplifié
- Sidebar rétractable
- Preview en modal

### Mobile (<768px)
- Layout vertical
- Navigation bottom sheet
- Actions principales accessibles

---

## 🎨 Inspirations & Références

**Design :**
- Notion (éditeur inline, blocks)
- Figma (interface multi-panel, collaboration)
- Canva (templates, drag & drop)
- Instagram (stories, filtres)
- Apple Photos (galerie, édition)

**Patterns :**
- Timeline : Trello, Asana
- Drag & drop : Monday.com
- Éditeur riche : Medium, Ghost
- Carte interactive : Google My Maps

---

## 🔄 Prochaines étapes

### Phase 1 : Fondations (Tâche 21.1 - 21.2)
✅ Landing page moderne
✅ Éditeur avec drag & drop

### Phase 2 : Fonctionnalités avancées (Tâche 21.3 - 21.5)
- [ ] Galerie intelligente avec édition photos
- [ ] Timeline interactive avec carte
- [ ] Éditeur de texte riche contextuel

### Phase 3 : Personnalisation (Tâche 21.6)
- [ ] Système de thèmes
- [ ] Templates prédéfinis
- [ ] Customisation couleurs/polices

### Phase 4 : Export & Partage (Tâche 21.7)
- [ ] Export multi-format
- [ ] Optimisation pour réseaux sociaux
- [ ] Partage direct

---

## 🔗 Navigation entre maquettes

- **index.html** → Bouton "Créer mon album" → `editor.html`
- **editor.html** → Sidebar onglet "Photos" → pourrait ouvrir `gallery.html`
- **editor.html** → Header "Prévisualiser" → pourrait ouvrir `timeline.html`
- **gallery.html** → Standalone ou intégré dans `editor.html`
- **timeline.html** → Standalone ou mode présentation

---

## 💡 Notes d'implémentation

### Drag & Drop
```javascript
// Pattern utilisé dans editor.html
element.setAttribute('draggable', 'true')
element.addEventListener('dragstart', handleDragStart)
element.addEventListener('dragover', handleDragOver)
element.addEventListener('drop', handleDrop)
```

### Auto-save
```javascript
// Pattern de debounce pour performance
let saveTimeout
element.addEventListener('input', () => {
  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(save, 1000)
})
```

### Animations scroll
```javascript
// Intersection Observer pour animations entrée
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible')
    }
  })
})
```

---

## 📝 Feedback & Itérations

Ces maquettes sont des **propositions initiales** et peuvent être :
- Ajustées selon les retours utilisateurs
- Enrichies de nouvelles fonctionnalités
- Simplifiées si trop complexes
- Combinées ou séparées selon l'architecture finale

**Objectif** : Servir de base visuelle et fonctionnelle pour le développement du produit complet.

---

## 🎓 Pour les développeurs

### Ouvrir les maquettes
```bash
# Depuis le dossier du projet
cd docs/mockups

# Ouvrir dans le navigateur (macOS)
open index.html

# Ou servir avec un serveur local
python3 -m http.server 8000
# Puis ouvrir http://localhost:8000
```

### Structure des fichiers
```
docs/mockups/
├── design-system.css   # Variables et composants réutilisables
├── index.html          # Landing page
├── editor.html         # Éditeur principal
├── gallery.html        # Galerie photos
├── timeline.html       # Timeline interactive
└── README.md           # Ce fichier
```

### Réutilisation du code
- Les classes CSS du design system peuvent être copiées directement
- Les patterns JavaScript sont vanilla et facilement adaptables en Vue
- Les layouts Grid/Flex sont modernes et bien supportés
- Les animations CSS sont performantes

---

**Créé avec ❤️ pour Travel Book - Mai 2024**
