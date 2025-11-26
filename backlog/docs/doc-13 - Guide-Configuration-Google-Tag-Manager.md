# Guide de configuration Google Tag Manager pour Travel Book JS

## Introduction

Ce guide explique comment configurer Google Tag Manager (GTM) pour recevoir et transmettre les événements personnalisés à Google Analytics 4.

## Prérequis

- Un compte Google Tag Manager avec le conteneur `GTM-TDDMJFGF` déjà créé
- Un compte Google Analytics 4 avec une propriété configurée
- L'ID de mesure GA4 (format : `G-XXXXXXXXXX`)

## Architecture mise en place

```
Application Vue.js
    ↓
AnalyticsService (singleton)
    ↓
dataLayer.push({ event: '...', ... })
    ↓
Google Tag Manager (GTM-TDDMJFGF)
    ↓
Google Analytics 4 (G-XXXXXXXXXX)
```

## Événements personnalisés envoyés

L'application envoie les événements suivants via `dataLayer.push()` :

### 1. `page_view`
- **Déclenché** : À chaque changement de route
- **Paramètres** :
  - `page_name` : nom de la page (landing, home, editor, privacy)
  - `page_title` : titre de la page

### 2. `album_creation_start`
- **Déclenché** : Quand l'utilisateur sélectionne un fichier JSON ou un dossier
- **Paramètres** : aucun

### 3. `editor_opened`
- **Déclenché** : Quand l'éditeur s'ouvre avec des données chargées
- **Paramètres** :
  - `step_count` : nombre d'étapes dans le voyage

### 4. `preview_opened`
- **Déclenché** : Quand la prévisualisation est ouverte
- **Paramètres** : aucun

### 5. `pdf_exported`
- **Déclenché** : Quand l'utilisateur lance l'impression/export PDF
- **Paramètres** : aucun

### 6. `consent_update`
- **Déclenché** : Quand l'utilisateur modifie son consentement
- **Paramètres** :
  - `analytics_consent` : 'granted' ou 'denied'

## Configuration de Google Tag Manager

### Étape 1 : Créer la balise Google Analytics 4

1. Dans GTM, allez dans **Balises** → **Nouveau**
2. Cliquez sur **Configuration de balise**
3. Choisissez **Google Analytics : Balise Google**
4. Entrez votre **ID de mesure** GA4 (G-XXXXXXXXXX)
5. Dans les **Déclencheurs**, sélectionnez **Initialization - All Pages**
6. Nommez la balise : `GA4 - Configuration`
7. Enregistrez

### Étape 2 : Créer les déclencheurs personnalisés

Pour chaque événement personnalisé, créez un déclencheur :

#### Déclencheur : page_view
1. **Déclencheurs** → **Nouveau**
2. Type : **Événement personnalisé**
3. Nom de l'événement : `page_view`
4. Enregistrez sous le nom : `CE - Page View`

#### Déclencheur : album_creation_start
1. **Déclencheurs** → **Nouveau**
2. Type : **Événement personnalisé**
3. Nom de l'événement : `album_creation_start`
4. Enregistrez sous le nom : `CE - Album Creation Start`

#### Déclencheur : editor_opened
1. **Déclencheurs** → **Nouveau**
2. Type : **Événement personnalisé**
3. Nom de l'événement : `editor_opened`
4. Enregistrez sous le nom : `CE - Editor Opened`

#### Déclencheur : preview_opened
1. **Déclencheurs** → **Nouveau**
2. Type : **Événement personnalisé**
3. Nom de l'événement : `preview_opened`
4. Enregistrez sous le nom : `CE - Preview Opened`

#### Déclencheur : pdf_exported
1. **Déclencheurs** → **Nouveau**
2. Type : **Événement personnalisé**
3. Nom de l'événement : `pdf_exported`
4. Enregistrez sous le nom : `CE - PDF Exported`

### Étape 3 : Créer les variables personnalisées

Pour capturer les paramètres des événements, créez des variables de couche de données :

#### Variable : page_name
1. **Variables** → **Nouvelle**
2. Type : **Variable de couche de données**
3. Nom de la variable de couche de données : `page_name`
4. Enregistrez sous le nom : `DL - Page Name`

#### Variable : page_title
1. **Variables** → **Nouvelle**
2. Type : **Variable de couche de données**
3. Nom de la variable de couche de données : `page_title`
4. Enregistrez sous le nom : `DL - Page Title`

#### Variable : step_count
1. **Variables** → **Nouvelle**
2. Type : **Variable de couche de données**
3. Nom de la variable de couche de données : `step_count`
4. Enregistrez sous le nom : `DL - Step Count`

### Étape 4 : Créer les balises d'événements

Pour chaque événement personnalisé, créez une balise :

#### Balise : Page View
1. **Balises** → **Nouveau**
2. Type : **Google Analytics : Événement Google Analytics 4**
3. **ID de mesure** : Utilisez la variable `{{Google tag: measurement ID}}`
4. **Nom de l'événement** : `page_view`
5. **Paramètres d'événement** :
   - Ajouter une ligne : `page_name` → `{{DL - Page Name}}`
   - Ajouter une ligne : `page_title` → `{{DL - Page Title}}`
6. **Déclencheur** : `CE - Page View`
7. Enregistrez sous le nom : `GA4 - Event - Page View`

#### Balise : Album Creation Start
1. **Balises** → **Nouveau**
2. Type : **Google Analytics : Événement Google Analytics 4**
3. **ID de mesure** : Utilisez la variable `{{Google tag: measurement ID}}`
4. **Nom de l'événement** : `album_creation_start`
5. **Déclencheur** : `CE - Album Creation Start`
6. Enregistrez sous le nom : `GA4 - Event - Album Creation Start`

#### Balise : Editor Opened
1. **Balises** → **Nouveau**
2. Type : **Google Analytics : Événement Google Analytics 4**
3. **ID de mesure** : Utilisez la variable `{{Google tag: measurement ID}}`
4. **Nom de l'événement** : `editor_opened`
5. **Paramètres d'événement** :
   - Ajouter une ligne : `step_count` → `{{DL - Step Count}}`
6. **Déclencheur** : `CE - Editor Opened`
7. Enregistrez sous le nom : `GA4 - Event - Editor Opened`

#### Balise : Preview Opened
1. **Balises** → **Nouveau**
2. Type : **Google Analytics : Événement Google Analytics 4**
3. **ID de mesure** : Utilisez la variable `{{Google tag: measurement ID}}`
4. **Nom de l'événement** : `preview_opened`
5. **Déclencheur** : `CE - Preview Opened`
6. Enregistrez sous le nom : `GA4 - Event - Preview Opened`

#### Balise : PDF Exported
1. **Balises** → **Nouveau**
2. Type : **Google Analytics : Événement Google Analytics 4**
3. **ID de mesure** : Utilisez la variable `{{Google tag: measurement ID}}`
4. **Nom de l'événement** : `pdf_exported`
5. **Déclencheur** : `CE - PDF Exported`
6. Enregistrez sous le nom : `GA4 - Event - PDF Exported`

## Étape 5 : Tester la configuration

### Mode Aperçu de GTM

1. Dans GTM, cliquez sur **Aperçu** en haut à droite
2. Entrez l'URL de votre site : `https://stalina.github.io/travel-book-js/`
3. Le Tag Assistant se connectera à votre site
4. Testez chaque événement :
   - Naviguez entre les pages → vérifiez `page_view`
   - Importez un fichier JSON → vérifiez `album_creation_start`
   - Ouvrez l'éditeur → vérifiez `editor_opened`
   - Ouvrez la prévisualisation → vérifiez `preview_opened`
   - Cliquez sur imprimer → vérifiez `pdf_exported`

### Vérification dans GA4 en temps réel

1. Ouvrez Google Analytics 4
2. Allez dans **Rapports** → **Temps réel**
3. Effectuez des actions sur le site
4. Vérifiez que les événements apparaissent dans le rapport en temps réel

## Étape 6 : Publier la version

Une fois les tests concluants :

1. Dans GTM, cliquez sur **Envoyer** en haut à droite
2. Donnez un nom à la version : `v1.0 - Initial GA4 setup`
3. Ajoutez une description : `Configuration initiale des événements personnalisés`
4. Cliquez sur **Publier**

## Rapports utiles dans GA4

### Rapport personnalisé sur le tunnel de conversion

1. Dans GA4, allez dans **Explorations**
2. Créez une nouvelle exploration **Tunnel en entonnoir**
3. Configurez les étapes :
   - Étape 1 : `page_view` (page_name = 'landing')
   - Étape 2 : `album_creation_start`
   - Étape 3 : `editor_opened`
   - Étape 4 : `preview_opened`
   - Étape 5 : `pdf_exported`

Cela vous donnera une visualisation du parcours utilisateur et du taux de conversion à chaque étape.

### Événements personnalisés

Dans **Rapports** → **Engagement** → **Événements**, vous verrez tous vos événements personnalisés avec leur nombre d'occurrences.

## Gestion du consentement

Le code implémenté respecte le RGPD :

1. **Avant consentement** : GTM n'est pas chargé, seul `dataLayer` est initialisé
2. **Après acceptation** : La page se recharge et GTM est chargé
3. **Après refus** : Les événements sont bloqués par `AnalyticsService`

Le consentement est stocké dans `localStorage` sous la clé `analytics_consent`.

## Dépannage

### Les événements n'apparaissent pas dans GTM Preview

- Vérifiez que le consentement est accordé (bannière cookies)
- Ouvrez la console du navigateur et vérifiez les logs `[Analytics]`
- Vérifiez que `dataLayer` contient bien vos événements : `console.log(window.dataLayer)`

### Les événements apparaissent dans GTM mais pas dans GA4

- Vérifiez que l'ID de mesure GA4 est correct
- Attendez quelques minutes (délai de propagation)
- Vérifiez les rapports en temps réel de GA4

### Le site ne charge pas GTM

- Videz le localStorage : `localStorage.clear()`
- Rechargez la page
- Acceptez les cookies via la bannière

## Ressources

- [Documentation GTM](https://support.google.com/tagmanager)
- [Documentation GA4](https://support.google.com/analytics/answer/9304153)
- [DataLayer GTM](https://developers.google.com/tag-platform/tag-manager/datalayer)
