# Guide Analytics pour Travel Book JS

## Vue d'ensemble

Travel Book JS intègre Google Analytics 4 (GA4) via Google Tag Manager (GTM) pour suivre l'utilisation de l'application de manière anonyme et respectueuse de la vie privée.

## 🔐 Conformité RGPD et Confidentialité

### Principes clés

1. **Consentement explicite requis** : GTM n'est chargé qu'après acceptation de la bannière de cookies
2. **Aucune donnée personnelle collectée** : Le site reste 100% côté client
3. **Transparence totale** : Politique de confidentialité détaillée disponible
4. **Droit de refus** : L'utilisateur peut refuser les cookies sans impact sur l'utilisation

### Données collectées

**Uniquement avec consentement**, nous collectons :
- Navigation anonyme (pages visitées)
- Actions utilisateur (création album, édition, prévisualisation, export)
- Statistiques d'usage (nombre d'étapes dans un voyage)
- Informations techniques (navigateur, OS, source de référencement)

**Jamais collecté** :
- Vos fichiers JSON Polarsteps
- Vos photos de voyage
- Vos informations personnelles
- Vos carnets de voyage générés
- Votre adresse IP (anonymisée par GA4)

## 📊 Événements trackés

### 1. Navigation (page_view)
```typescript
analyticsService.trackPageView(pageName, pageTitle)
```
- **Landing page** : Arrivée sur le site
- **Home** : Page d'import de fichiers
- **Editor** : Page d'édition du voyage
- **Privacy** : Page de politique de confidentialité

### 2. Création d'album (album_creation_start)
```typescript
analyticsService.trackAlbumCreationStart()
```
- Déclenché quand l'utilisateur sélectionne un fichier JSON ou un dossier

### 3. Ouverture de l'éditeur (editor_opened)
```typescript
analyticsService.trackEditorOpened(stepCount)
```
- Déclenché quand l'éditeur charge un voyage
- Paramètre : `stepCount` (nombre d'étapes)

### 4. Ouverture de la prévisualisation (preview_opened)
```typescript
analyticsService.trackPreviewOpened()
```
- Déclenché quand l'utilisateur ouvre le panneau de prévisualisation

### 5. Export PDF (pdf_exported)
```typescript
analyticsService.trackPdfExported()
```
- Déclenché quand l'utilisateur clique sur le bouton d'impression/export PDF

## 🛠️ Architecture technique

### AnalyticsService (Singleton)

Service core suivant l'architecture ES2015/OOP du projet :

```typescript
// Utilisation
import { analyticsService } from '@/services/analytics.service'

// Tracker un événement
analyticsService.trackPageView('landing')
analyticsService.trackAlbumCreationStart()
analyticsService.trackEditorOpened(12)
analyticsService.trackPreviewOpened()
analyticsService.trackPdfExported()

// Gestion du consentement
analyticsService.updateConsent(true)  // Accepter
analyticsService.updateConsent(false) // Refuser
```

### Composant CookieConsent

Bannière de consentement affichée automatiquement au premier chargement :

```vue
<CookieConsent />
```

- Stocke le choix dans `localStorage.analytics_consent`
- Recharge la page après acceptation pour initialiser GTM
- Ne s'affiche plus après un choix fait

### Intégration GTM dans index.html

```html
<script>
  // Chargement conditionnel basé sur le consentement
  var consent = localStorage.getItem('analytics_consent');
  if (consent === 'granted') {
    // Charger GTM...
  }
</script>
```

## 📈 Tunnel de conversion

Le tunnel de conversion typique d'un utilisateur :

```
Landing Page (100%)
    ↓
Album Creation Start (X%)
    ↓
Editor Opened (Y%)
    ↓
Preview Opened (Z%)
    ↓
PDF Exported (W%)
```

Cela permet de répondre à des questions comme :
- Combien de visiteurs arrivent sur le site ?
- Quel pourcentage essaie de créer un album ?
- Combien vont jusqu'à l'export PDF ?
- Quelle est la source de trafic la plus efficace ?

## 🔧 Configuration de Google Tag Manager

Voir le guide complet : [Guide Configuration Google Tag Manager](./backlog/docs/doc-13%20-%20Guide-Configuration-Google-Tag-Manager.md)

### Résumé de la configuration

1. **Balise Google Analytics 4** : Configuration de base avec votre ID de mesure
2. **Déclencheurs personnalisés** : Un pour chaque événement
3. **Variables** : Pour capturer les paramètres (page_name, step_count, etc.)
4. **Balises d'événements** : Une pour chaque événement personnalisé

## 🧪 Tests

### En développement local

1. Lancez l'application : `npm run dev`
2. Ouvrez la console navigateur (F12)
3. Acceptez les cookies via la bannière
4. Effectuez des actions (navigation, import, etc.)
5. Vérifiez les logs : `[Analytics] Event sent: { event: '...' }`

### Vérifier le dataLayer

```javascript
// Dans la console du navigateur
console.log(window.dataLayer)
// Devrait afficher un tableau avec vos événements
```

### Mode Aperçu GTM

1. Dans GTM, cliquez sur **Aperçu**
2. Connectez-vous à votre site
3. Tag Assistant vous montrera en temps réel les événements déclenchés

### Rapports temps réel GA4

1. Ouvrez Google Analytics 4
2. **Rapports** → **Temps réel**
3. Effectuez des actions sur le site
4. Les événements apparaissent immédiatement

## 📖 Politique de confidentialité

La politique de confidentialité complète est disponible à `/privacy` ou `#/privacy`.

Points clés :
- Application 100% côté client
- Aucune transmission de données à un serveur
- Cookies uniquement pour Analytics (avec consentement)
- Conformité RGPD
- Droit de retrait du consentement à tout moment

## 🔒 Gestion du consentement

### Accepter les cookies

L'utilisateur accepte via la bannière → la page se recharge → GTM est chargé

```javascript
localStorage.getItem('analytics_consent') // 'granted'
```

### Refuser les cookies

L'utilisateur refuse via la bannière → les événements sont bloqués

```javascript
localStorage.getItem('analytics_consent') // 'denied'
```

### Réinitialiser le choix

```javascript
// Dans la console du navigateur
localStorage.removeItem('analytics_consent')
// Puis recharger la page
```

## 📝 Rapports utiles dans GA4

### Événements

**Rapports** → **Engagement** → **Événements**
- Vue de tous les événements personnalisés
- Nombre d'occurrences de chaque événement
- Tendances dans le temps

### Tunnel de conversion

**Explorations** → **Tunnel en entonnoir**
- Configurer les étapes du tunnel
- Visualiser le taux de conversion
- Identifier les points de friction

### Utilisateurs actifs

**Rapports** → **Utilisateurs** → **Aperçu de l'audience**
- Nombre d'utilisateurs actifs
- Utilisateurs nouveaux vs récurrents
- Sources de trafic

### Acquisition

**Rapports** → **Acquisition** → **Vue d'ensemble**
- D'où viennent les visiteurs ?
- Quel canal apporte le plus de trafic ?
- Performance des campagnes

## 🚀 Déploiement

1. **Configurer GTM** selon le guide (doc-13)
2. **Publier la version GTM** après tests
3. **Déployer l'application** sur GitHub Pages
4. **Vérifier** que les événements arrivent bien dans GA4
5. **Monitorer** les rapports régulièrement

## 📚 Ressources

- [Documentation Google Tag Manager](https://support.google.com/tagmanager)
- [Documentation Google Analytics 4](https://support.google.com/analytics/answer/9304153)
- [RGPD et Google Analytics](https://support.google.com/analytics/answer/9976101)
- [Guide Configuration GTM (interne)](./backlog/docs/doc-13%20-%20Guide-Configuration-Google-Tag-Manager.md)

## ❓ FAQ

### Puis-je utiliser l'application sans accepter les cookies ?

Oui ! Toutes les fonctionnalités de l'application fonctionnent normalement sans Analytics. Seul le tracking statistique est désactivé.

### Mes données de voyage sont-elles envoyées à Google ?

Non ! Vos fichiers JSON, photos et carnets de voyage restent sur votre appareil. Seules des informations anonymes d'usage sont collectées (ex: "un utilisateur a ouvert l'éditeur").

### Comment retirer mon consentement ?

Effacez les cookies de votre navigateur pour ce site, ou supprimez la clé `analytics_consent` du localStorage. La bannière réapparaîtra au prochain chargement.

### Les événements n'apparaissent pas dans GA4

- Vérifiez que vous avez accepté les cookies
- Attendez quelques minutes (délai de propagation)
- Vérifiez la configuration GTM
- Consultez les rapports en temps réel de GA4

### Comment désactiver complètement le tracking ?

Refusez les cookies via la bannière. Le code JavaScript détectera le refus et ne poussera plus d'événements dans le dataLayer.
