# Guide Analytics - Microsoft Clarity

Ce document explique comment configurer et utiliser le système de suivi statistique (analytics) avec Microsoft Clarity dans Travel Book JS.

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Configuration initiale](#configuration-initiale)
3. [Événements trackés](#événements-trackés)
4. [Consultation des données](#consultation-des-données)
5. [Conformité RGPD](#conformité-rgpd)
6. [Architecture technique](#architecture-technique)

---

## Vue d'ensemble

Travel Book JS utilise **Microsoft Clarity** pour comprendre l'utilisation de l'application et améliorer l'expérience utilisateur. Clarity est :

- ✅ **Gratuit** et sans limitation de trafic
- ✅ **Conforme au RGPD** et CCPA
- ✅ **Compatible front-only** (pas besoin de serveur)
- ✅ **Privacy-friendly** : masquage automatique des PII (données personnelles)
- ✅ **Complet** : heatmaps, session replays, métriques comportementales

### Pourquoi Clarity ?

- Pas de banner de consentement obligatoire (cookies techniques)
- Dashboard intégré et intuitif
- Enregistrements de sessions pour comprendre les problèmes UX
- Intégration simple (un seul script)

---

## Configuration initiale

### 1. Créer un compte Microsoft Clarity

1. Aller sur [https://clarity.microsoft.com/](https://clarity.microsoft.com/)
2. Se connecter avec un compte Microsoft (gratuit)
3. Créer un nouveau projet
4. Copier le **Project ID** (format : `abcdefghij`, 10 caractères)

### 2. Configurer le projet

#### Pour le développement local :

1. Créer un fichier `.env.local` à la racine du projet :

```bash
VITE_CLARITY_PROJECT_ID=votre_project_id_ici
```

2. Le fichier `.env.local` est ignoré par Git (`.gitignore`), donc votre ID reste privé.

#### Pour la production (GitHub Pages) :

1. Aller dans les **Settings** du repository GitHub
2. **Secrets and variables** > **Actions**
3. Créer un secret `VITE_CLARITY_PROJECT_ID` avec votre Project ID
4. Le workflow GitHub Actions injectera automatiquement la variable lors du build

**Note :** Le `.env.example` sert de template pour documenter les variables nécessaires.

### 3. Vérifier l'intégration

1. Lancer l'application en dev : `npm run dev`
2. Ouvrir la console du navigateur
3. Vérifier le message : `[Analytics] Microsoft Clarity initialized`
4. Aller sur le dashboard Clarity et vérifier que les événements arrivent (délai ~2-5 min)

---

## Événements trackés

Le système track automatiquement les événements suivants :

### 📊 Landing Page

| Événement | Description | Métadonnées |
|-----------|-------------|-------------|
| `landing_view` | Visite de la page d'accueil | `source` (referrer) |

### 📤 Upload & Création

| Événement | Description | Métadonnées |
|-----------|-------------|-------------|
| `upload_start` | Début de sélection de dossier | - |
| `album_create_start` | Début du parsing Polarsteps | - |
| `upload_success` | Import réussi | - |
| `upload_error` | Échec de l'import | `error` |

### ✏️ Édition

| Événement | Description | Métadonnées |
|-----------|-------------|-------------|
| `editor_view` | Ouverture de l'éditeur | - |
| `editor_step_edit` | Modification d'une étape | (À implémenter si besoin) |
| `editor_photo_add` | Ajout de photo | (À implémenter si besoin) |

### 🔍 Génération & Prévisualisation

| Événement | Description | Métadonnées |
|-----------|-------------|-------------|
| `generate_start` | Début génération travel book | - |
| `generate_success` | Génération réussie | - |
| `generate_error` | Échec de génération | `error` |
| `viewer_open` | Ouverture du viewer | - |

### 📥 Export

| Événement | Description | Métadonnées |
|-----------|-------------|-------------|
| `export_pdf_start` | Début export HTML | - |
| `export_pdf_success` | Export réussi | - |
| `export_pdf_error` | Échec export | `error` |

---

## Consultation des données

### Dashboard Clarity

1. Se connecter sur [https://clarity.microsoft.com/](https://clarity.microsoft.com/)
2. Sélectionner votre projet **Travel Book JS**

### Métriques disponibles

#### 1. **Overview** (Vue d'ensemble)
- Nombre de sessions
- Nombre d'utilisateurs
- Durée moyenne de session
- Pages par session

#### 2. **Recordings** (Enregistrements)
- Replay vidéo des sessions utilisateurs
- Filtrage par :
  - Événements personnalisés (`landing_view`, `upload_success`, etc.)
  - Durée de session
  - Appareil (mobile/desktop)
  - Pays

#### 3. **Heatmaps** (Cartes thermiques)
- Clics
- Scrolling
- Zones d'attention

#### 4. **Insights** (Analyses IA)
- Dead clicks (clics sans effet)
- Rage clicks (clics répétés)
- Quick backs (retours rapides)
- Erreurs JavaScript

### Exemple de filtrage par funnel

Pour suivre le parcours complet :

1. **Dashboard** > **Recordings**
2. Filtrer par événements :
   - `landing_view` → Combien arrivent ?
   - `upload_success` → Combien importent avec succès ?
   - `editor_view` → Combien passent en édition ?
   - `export_pdf_success` → Combien exportent ?

3. Calculer les taux de conversion :
   ```
   Taux d'import = upload_success / landing_view
   Taux d'édition = editor_view / upload_success
   Taux d'export = export_pdf_success / editor_view
   ```

---

## Conformité RGPD

### Ce que Clarity collecte

**Données anonymisées :**
- Comportement de navigation (clics, scroll, pages visitées)
- Données techniques (navigateur, OS, résolution écran)
- Localisation approximative (pays/région via IP)

**PII automatiquement masquées :**
- Champs de formulaire
- Numéros (téléphone, CB, etc.)
- Emails
- Contenu sensible

### Divulgation requise

✅ **Déjà implémenté** : Politique de confidentialité accessible depuis le footer de la landing page (`/privacy`).

Le texte informe les utilisateurs que :
1. Nous utilisons Microsoft Clarity
2. Clarity collecte des données de navigation
3. Les données sont traitées selon la politique Microsoft
4. Lien vers la déclaration de confidentialité Microsoft

### Pas de banner de consentement obligatoire

Les cookies Clarity sont **techniques** (non-publicitaires), donc selon le RGPD :
- ❌ Pas de popup obligatoire
- ✅ Information transparente dans la politique de confidentialité (déjà fait)

### Droits des utilisateurs

Les utilisateurs peuvent :
- **Do Not Track (DNT)** : Clarity respecte le signal DNT du navigateur
- **Bloquer les cookies** : Via les paramètres du navigateur
- **Demander suppression** : Via Microsoft (lien dans la politique de confidentialité)

---

## Architecture technique

### Pattern Singleton

```typescript
// services/analytics.service.ts
export class AnalyticsService {
  private static instance: AnalyticsService | null = null
  
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }
}

export const analyticsService = AnalyticsService.getInstance()
```

### Initialisation

```typescript
// main.ts
import { analyticsService } from './services/analytics.service'

analyticsService.initialize()
```

### Utilisation dans les composants

```typescript
// LandingView.vue
import { analyticsService, AnalyticsEvent } from '../services/analytics.service'

onMounted(() => {
  const source = analyticsService.getTrafficSource()
  analyticsService.trackEvent(AnalyticsEvent.LANDING_VIEW, { referrer: source })
})
```

### Utilisation dans les composables

```typescript
// usePolarstepsImport.ts
analyticsService.trackEvent(AnalyticsEvent.UPLOAD_START)
// ... logique import ...
analyticsService.trackEvent(AnalyticsEvent.UPLOAD_SUCCESS)
```

### API du service

#### `initialize(): void`
Initialise le script Clarity. À appeler au démarrage de l'app.

#### `trackEvent(event: AnalyticsEvent, metadata?: AnalyticsMetadata): void`
Track un événement personnalisé avec métadonnées optionnelles.

#### `trackPageView(pageName: string, metadata?: AnalyticsMetadata): void`
Track une page vue (en plus du tracking automatique).

#### `getTrafficSource(): string`
Récupère la source de trafic (referrer ou 'direct').

#### `setCustomProperty(key: string, value: string | number | boolean): void`
Définit une propriété personnalisée pour la session.

---

## Maintenance et évolution

### Ajouter un nouvel événement

1. **Définir l'événement** dans `analytics.service.ts` :

```typescript
export enum AnalyticsEvent {
  // ...
  MY_NEW_EVENT = 'my_new_event'
}
```

2. **Tracker l'événement** au bon endroit :

```typescript
analyticsService.trackEvent(AnalyticsEvent.MY_NEW_EVENT, { 
  customData: 'value' 
})
```

3. **Documenter** dans ce guide (section "Événements trackés")

### Désactiver temporairement

Pour désactiver Clarity sans supprimer le code :

1. Supprimer `VITE_CLARITY_PROJECT_ID` du `.env.local`
2. Le service ne s'initialisera pas et les appels seront silencieux (no-op)

### Changer de solution analytics

Si besoin de migrer vers Google Analytics, Plausible, etc. :

1. Modifier uniquement `analytics.service.ts`
2. Garder la même API publique (`trackEvent`, `trackPageView`, etc.)
3. Les composants n'ont pas besoin d'être modifiés (principe SOLID)

---

## Ressources

- [Documentation Microsoft Clarity](https://learn.microsoft.com/en-us/clarity/)
- [Clarity Privacy & GDPR](https://learn.microsoft.com/en-us/clarity/faq#privacy)
- [Déclaration de confidentialité Microsoft](https://privacy.microsoft.com/en-us/privacystatement)

---

**Auteur** : Travel Book JS Team  
**Dernière mise à jour** : 26 novembre 2025
