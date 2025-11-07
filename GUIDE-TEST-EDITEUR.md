# Guide de test de l'éditeur

## Lancer l'application en mode développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## Accéder à l'éditeur

### Option 1 : URL directe
Naviguez vers : `http://localhost:5173/#/editor`

### Option 2 : Depuis la console du navigateur
```javascript
// Charger un voyage de test
const mockTrip = {
  id: 1,
  name: "Voyage de test",
  start_date: 1609459200, // 1er janvier 2021
  end_date: 1612137600,   // 1er février 2021
  steps: [
    {
      id: 1,
      name: "Paris",
      description: "Capitale de la France",
      city: "Paris",
      country: "France",
      country_code: "FR",
      start_time: 1609459200,
      end_time: 1609718400,
      weather_condition: "sunny",
      weather_temperature: 15,
      latitude: 48.8566,
      longitude: 2.3522,
      lat: 48.8566,
      lon: 2.3522,
      slug: "paris"
    },
    {
      id: 2,
      name: "Lyon",
      description: "Ville de la gastronomie",
      city: "Lyon",
      country: "France",
      country_code: "FR",
      start_time: 1609804800,
      end_time: 1610064000,
      weather_condition: "cloudy",
      weather_temperature: 12,
      latitude: 45.7640,
      longitude: 4.8357,
      lat: 45.7640,
      lon: 4.8357,
      slug: "lyon"
    },
    {
      id: 3,
      name: "Marseille",
      description: "Ville portuaire méditerranéenne",
      city: "Marseille",
      country: "France",
      country_code: "FR",
      start_time: 1610150400,
      end_time: 1610409600,
      weather_condition: "sunny",
      weather_temperature: 18,
      latitude: 43.2965,
      longitude: 5.3698,
      lat: 43.2965,
      lon: 5.3698,
      slug: "marseille"
    }
  ]
};

// Dans la console du navigateur
const { useEditorStore } = await import('/src/stores/editor.store.ts');
const editorStore = useEditorStore();
editorStore.setTrip(mockTrip);
```

## Fonctionnalités à tester

### ✅ Layout 3 colonnes (task-21.2.1)

1. **Header**
   - Logo "✈️ Travel Book" affiché
   - Titre du voyage éditable (cliquer dessus)
   - Indicateur de sauvegarde (doit passer à "Enregistrement..." puis "Enregistré")
   - 3 boutons : Importer, Prévisualiser, Exporter

2. **Sidebar (280px)**
   - 3 onglets : Étapes 📍, Thèmes 🎨, Options ⚙️
   - Cliquer sur chaque onglet change le contenu
   - Liste des étapes affichée dans l'onglet Étapes
   - Scrollable si beaucoup d'étapes

3. **Preview Panel (400px)**
   - 3 boutons de mode : 📱 Mobile, 💻 Desktop, 📄 PDF
   - Cliquer change le mode actif (visuellement)
   - 4 cartes de statistiques avec gradients :
     - Photos (violet)
     - Étapes (rose)
     - Jours (bleu)
     - Pages (vert)

4. **Responsive**
   - Réduire la fenêtre < 1200px → Preview panel disparaît
   - Réduire < 768px → Sidebar disparaît, layout vertical

### ✅ Drag & Drop des étapes (task-21.2.2)

1. **Poignée de drag**
   - Symbole "⋮⋮" visible à gauche de chaque étape
   - Curseur change en "grab" au survol

2. **Drag & Drop**
   - Cliquer-maintenir sur une étape
   - Observer : opacity 0.5, légère rotation
   - Glisser vers une autre position
   - Observer : bordure cyan pointillée sur la cible
   - Relâcher : l'ordre change immédiatement
   - Indicateur "Enregistrement..." puis "Enregistré" apparaît

3. **Sélection d'étape**
   - Cliquer sur une étape la met en surbrillance (bordure rouge)
   - L'index de l'étape active est mis à jour

## Tests automatisés

```bash
# Tous les tests
npm test

# Tests de l'éditeur seulement
npm test -- tests/editor/

# Tests du drag & drop
npm test -- tests/composables/useDragAndDrop.spec.ts

# Mode watch pour développement
npm test -- --watch
```

## Vérification du build

```bash
npm run build
```

Doit compiler sans erreur.

## Points d'attention

- Les erreurs TypeScript "Cannot find module 'vue'" dans l'IDE sont des **faux positifs** - le build et les tests fonctionnent
- Le drag & drop nécessite un navigateur moderne (Chrome, Firefox, Safari récents)
- L'auto-save est actuellement simulé (1 seconde de délai) - sera implémenté dans task-21.2.4

## Captures console utiles

```javascript
// Voir l'état du store
const { useEditorStore } = await import('/src/stores/editor.store.ts');
const store = useEditorStore();
console.log('Current trip:', store.currentTrip);
console.log('Current step index:', store.currentStepIndex);
console.log('Total steps:', store.totalSteps);
console.log('Total days:', store.totalDays);

// Changer de mode preview
store.setPreviewMode('mobile'); // ou 'desktop', 'pdf'

// Sélectionner une étape
store.setCurrentStep(1);

// Changer d'onglet sidebar
store.setActiveSidebarTab('themes'); // ou 'steps', 'options'
```
