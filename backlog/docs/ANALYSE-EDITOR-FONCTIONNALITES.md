# Analyse: Fonctionnalités de l'Éditeur (editor.html)

## ❌ PROBLÈME IDENTIFIÉ

La tâche **21.2 - Éditeur d'album avec drag & drop avancé** est marquée Done mais n'a implémenté que **l'import de dossier Polarsteps** (AlbumImportPanel).

L'éditeur visuel complet décrit dans `docs/mockups/editor.html` n'est **PAS implémenté**.

---

## 📋 FONCTIONNALITÉS DE editor.html À IMPLÉMENTER

### 1. LAYOUT & STRUCTURE (3 colonnes)

#### Header (Barre supérieure)
- [ ] Logo Travel Book
- [ ] Titre du projet (éditable inline avec contenteditable)
- [ ] Indicateur de sauvegarde (Enregistré / Enregistrement...)
- [ ] Bouton "Importer" (✅ FAIT via AlbumImportPanel)
- [ ] Bouton "Prévisualiser"
- [ ] Bouton "Exporter"

#### Sidebar gauche (280px)
- [ ] Onglets: Étapes / Thèmes / Options
- [ ] **Liste des étapes** réorganisable par drag & drop
  - [ ] Poignée de drag (⋮⋮)
  - [ ] Icône/emoji de l'étape
  - [ ] Nom de l'étape
  - [ ] Métadonnées (nombre de photos, durée)
  - [ ] État actif visuel
- [ ] Bouton "Ajouter une étape"
- [ ] Scrollable si beaucoup d'étapes

#### Zone centrale (Main Editor)
- [ ] **Toolbar contextuelle** sticky en haut:
  - [ ] Groupe 1: Type de contenu (Texte, Photo, Carte)
  - [ ] Groupe 2: Formatage texte (Gras, Italique, Souligné)
  - [ ] Groupe 3: Autres (Emoji, Lien)
  - [ ] Groupe 4: Historique (Annuler, Refaire)
- [ ] **Canvas d'édition**:
  - [ ] Titre d'étape (input large, éditable)
  - [ ] **Grille de photos** (grid responsive)
    - [ ] Photos existantes avec overlay d'actions au hover
    - [ ] Actions: Éditer, Réorganiser, Supprimer
    - [ ] Slots vides avec bouton +
  - [ ] **Éditeur de texte riche** (contenteditable)
    - [ ] Placeholder "Racontez votre étape..."
    - [ ] Support formatage (gras, italique via toolbar)
    - [ ] Support emoji, liens

#### Panel droit (Preview - 400px)
- [ ] Header avec titre "Aperçu"
- [ ] **Modes de preview**:
  - [ ] Mobile (📱)
  - [ ] Desktop (💻)
  - [ ] PDF (📄)
- [ ] **Contenu preview** en temps réel
  - [ ] Miniature de la page actuelle
  - [ ] Mise à jour automatique à la saisie
- [ ] **Statistiques du voyage**:
  - [ ] Nombre de photos (card gradient primary)
  - [ ] Nombre d'étapes (card gradient secondary)
  - [ ] Nombre de jours (card gradient accent)
  - [ ] Nombre de pages estimé (card gradient success)

---

### 2. INTERACTIONS & COMPORTEMENTS

#### Drag & Drop des étapes
- [ ] Rendre les étapes draggable
- [ ] Feedback visuel pendant le drag (.dragging class)
- [ ] Réorganisation en live dans la liste
- [ ] Mise à jour de l'ordre après drop
- [ ] Persistance de l'ordre

#### Édition inline
- [ ] Titre du projet éditable (header)
- [ ] Titre d'étape éditable (canvas)
- [ ] Texte éditable (contenteditable dans canvas)
- [ ] Focus/blur avec styles visuels
- [ ] Validation à la perte de focus

#### Auto-save
- [ ] Détection des changements (input events)
- [ ] Debounce de 1 seconde
- [ ] Indicateur visuel:
  - [ ] "Enregistrement..." + indicator orange
  - [ ] "Enregistré" + indicator vert avec animation pulse
- [ ] Sauvegarde dans store Pinia

#### Preview temps réel
- [ ] Synchronisation canvas → preview
- [ ] Changement de mode (mobile/desktop/PDF)
- [ ] Scaling adaptatif selon le mode
- [ ] Mise à jour des statistiques en temps réel

#### Toolbar
- [ ] Toggle actif/inactif des boutons
- [ ] Exécution des commandes de formatage
- [ ] États disabled si non applicable

#### Gestion photos
- [ ] Ajout de photos (bouton +)
- [ ] Overlay au hover avec actions
- [ ] Édition photo (ouverture modal/galerie)
- [ ] Suppression avec confirmation
- [ ] Réorganisation par drag & drop

---

### 3. COMPOSANTS VUE À CRÉER

```
src/views/
  EditorView.vue                    # Layout principal 3 colonnes

src/components/editor/
  EditorHeader.vue                  # Barre supérieure
  EditorSidebar.vue                 # Sidebar avec onglets
  StepList.vue                      # Liste des étapes
  StepItem.vue                      # Item d'étape draggable
  EditorToolbar.vue                 # Toolbar contextuelle
  EditorCanvas.vue                  # Zone d'édition principale
  PhotoGrid.vue                     # Grille de photos
  PhotoSlot.vue                     # Slot photo individuel
  TextEditor.vue                    # Éditeur de texte riche
  PreviewPanel.vue                  # Panel de preview
  PreviewModes.vue                  # Sélecteur de mode
  StatsCards.vue                    # Cartes de statistiques
```

---

### 4. STORE PINIA

```typescript
// stores/editor.store.ts
interface EditorState {
  currentTrip: Trip | null
  currentStepIndex: number
  editHistory: EditAction[]
  historyIndex: number
  autoSaveStatus: 'idle' | 'saving' | 'saved'
  previewMode: 'mobile' | 'desktop' | 'pdf'
  activeSidebarTab: 'steps' | 'themes' | 'options'
}

Actions nécessaires:
- setCurrentStep(index: number)
- updateStepTitle(stepId: number, title: string)
- updateStepContent(stepId: number, content: string)
- reorderSteps(fromIndex: number, toIndex: number)
- addPhoto(stepId: number, photo: Photo)
- removePhoto(stepId: number, photoId: number)
- undo()
- redo()
- autoSave()
- exportProject(format: 'pdf' | 'html')
```

---

### 5. COMPOSABLES

```typescript
// composables/useEditor.ts
- useEditorLayout()      # Gestion layout responsive
- useDragAndDrop()       # Logique drag & drop générique
- useAutoSave()          # Auto-save avec debounce
- useHistory()           # Undo/redo
- useTextFormatting()    # Formatage texte riche
- usePreview()           # Gestion preview temps réel
```

---

### 6. TESTS UNITAIRES REQUIS

```
tests/editor/
  EditorView.spec.ts              # Layout 3 colonnes, responsive
  EditorHeader.spec.ts            # Titre éditable, boutons, save status
  StepList.spec.ts                # Liste, sélection, ordre
  StepItem.spec.ts                # Drag, affichage, métadonnées
  EditorToolbar.spec.ts           # Boutons, états, actions
  PhotoGrid.spec.ts               # Grille, ajout, suppression
  TextEditor.spec.ts              # Édition, formatage
  PreviewPanel.spec.ts            # Modes, sync, stats
  
  useAutoSave.spec.ts             # Debounce, états, sauvegarde
  useDragAndDrop.spec.ts          # Logique drag & drop
  useHistory.spec.ts              # Undo/redo, limite
```

---

### 7. STYLES & DESIGN SYSTEM

- [ ] Importer design-system.css dans le projet
- [ ] Adapter les classes CSS pour Vue (scoped/modules)
- [ ] Variables CSS déjà définies dans design-system.css
- [ ] Composants Button, Card, Badge déjà stylés
- [ ] Animations (pulse, fadeIn, etc.) prêtes

---

## 🎯 PROPOSITION: NOUVELLE DÉCOMPOSITION DES TÂCHES

### task-21.2.1 - Layout éditeur et navigation (NOUVEAU)
**Priorité: HIGH**
**Parent: 21.2**

**Description:**
Créer la structure de base de l'éditeur avec le layout 3 colonnes (sidebar, main, preview), le header avec actions, et la navigation entre étapes.

**AC:**
1. Layout 3 colonnes (sidebar 280px, main flex-1, preview 400px) responsive
2. Header avec logo, titre éditable et boutons d'action (Importer, Prévisualiser, Exporter)
3. Sidebar avec onglets (Étapes/Thèmes/Options) fonctionnels
4. Liste des étapes affichée avec métadonnées (nom, nb photos, durée)
5. Sélection d'étape active avec feedback visuel
6. Preview panel avec header et sélecteur de mode
7. Statistiques du voyage affichées (4 cards avec gradients)
8. Layout responsive: masque preview sur tablette, layout vertical sur mobile
9. Tests unitaires pour tous les composants de layout

**Estimation:** 1-2 jours

---

### task-21.2.2 - Drag & Drop des étapes (NOUVEAU)
**Priorité: HIGH**
**Parent: 21.2**

**Description:**
Implémenter la fonctionnalité de réorganisation des étapes par drag & drop avec feedback visuel et persistance.

**AC:**
1. Les étapes sont draggable avec poignée visible (⋮⋮)
2. Feedback visuel pendant le drag (opacity, rotation, classes CSS)
3. Réorganisation en temps réel de la liste
4. Mise à jour de l'ordre dans le store après drop
5. Persistance de l'ordre lors du rechargement
6. Composable useDragAndDrop() réutilisable
7. Tests unitaires du comportement drag & drop

**Estimation:** 1-2 jours

---

### task-21.2.3 - Éditeur de contenu d'étape (NOUVEAU)
**Priorité: HIGH**
**Parent: 21.2**

**Description:**
Implémenter l'éditeur de contenu d'une étape: titre, photos, texte avec toolbar de formatage.

**AC:**
1. Titre d'étape éditable inline avec validation
2. Grille de photos responsive (auto-fill, minmax(200px, 1fr))
3. Ajout de photos via slot + avec sélecteur de fichier
4. Overlay d'actions sur photos au hover (éditer, réorganiser, supprimer)
5. Éditeur de texte riche (contenteditable) avec placeholder
6. Toolbar sticky avec groupes d'outils:
   - Type de contenu (Texte, Photo, Carte)
   - Formatage (Gras, Italique, Souligné)
   - Autres (Emoji, Lien)
   - Historique (Annuler, Refaire)
7. Application du formatage (execCommand ou API moderne)
8. Composable useTextFormatting() pour logique de formatage
9. Tests unitaires de l'éditeur, toolbar et formatage

**Estimation:** 2-3 jours

---

### task-21.2.4 - Auto-save et historique (NOUVEAU)
**Priorité: MEDIUM**
**Parent: 21.2**

**Description:**
Implémenter l'auto-save automatique avec feedback visuel et l'historique undo/redo.

**AC:**
1. Détection automatique des changements (input/blur events)
2. Debounce de 1 seconde avant déclenchement sauvegarde
3. Indicateur visuel de statut avec animation:
   - "Enregistrement..." + point orange
   - "Enregistré" + point vert avec pulse
4. Historique undo/redo (minimum 20 actions)
5. Raccourcis clavier Ctrl+Z (undo) / Ctrl+Shift+Z (redo)
6. Composable useAutoSave() avec debounce
7. Composable useHistory() avec stack d'actions
8. Tests unitaires auto-save (debounce, états) et historique (limite, undo/redo)

**Estimation:** 1 jour

---

### task-21.2.5 - Preview temps réel (NOUVEAU)
**Priorité: MEDIUM**
**Parent: 21.2**

**Description:**
Implémenter la preview en temps réel avec modes d'affichage et statistiques mises à jour automatiquement.

**AC:**
1. Synchronisation automatique canvas → preview (watch reactive)
2. 3 modes de preview fonctionnels (Mobile, Desktop, PDF)
3. Scaling adaptatif selon le mode sélectionné
4. Mise à jour temps réel des statistiques:
   - Nombre de photos total
   - Nombre d'étapes
   - Nombre de jours calculé
   - Estimation du nombre de pages
5. Composable usePreview() pour logique de synchronisation
6. Tests unitaires de synchronisation et calcul des statistiques

**Estimation:** 1-2 jours

---

## 📊 ESTIMATION GLOBALE

### Complexité par sous-tâche:
- **task-21.2.1** (Layout): MEDIUM - 1-2 jours
- **task-21.2.2** (Drag & Drop): MEDIUM - 1-2 jours
- **task-21.2.3** (Éditeur contenu): HIGH - 2-3 jours
- **task-21.2.4** (Auto-save): LOW - 1 jour
- **task-21.2.5** (Preview): MEDIUM - 1-2 jours

**Tests:** ~30% du temps de dev (inclus dans les estimations)

**Total estimé:** 6-10 jours de développement

---

## ✅ RECOMMANDATION

### Actions immédiates:

1. **Créer les sous-tâches 21.2.1 à 21.2.5** dans le backlog
2. **Marquer task-21.2 comme parente** des nouvelles sous-tâches
3. **Commencer par task-21.2.1** (Layout) car c'est la fondation

### Ordre d'implémentation:

1. **Layout & navigation** (21.2.1) → Fondation essentielle
2. **Drag & Drop** (21.2.2) → Fonctionnalité clé différenciante
3. **Éditeur de contenu** (21.2.3) → Cœur métier
4. **Auto-save** (21.2.4) → Amélioration UX importante
5. **Preview** (21.2.5) → Polish final

### Principes à respecter:

- ✅ **Suivre les maquettes** `docs/mockups/editor.html` pour le design
- ✅ **Tests unitaires** obligatoires pour chaque composant
- ✅ **Responsive** dès le début (mobile-first)
- ✅ **Composables** pour réutilisabilité
- ✅ **Design system** existant (design-system.css)
- ✅ **Architecture OOP** ES2015 pour services

---

**Créé le:** 3 novembre 2025  
**Auteur:** @agent-k  
**Statut:** Analyse complète - En attente de validation
