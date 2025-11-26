# 🎯 Configuration Analytics - Prochaines étapes

## ✅ Ce qui a été fait

L'intégration de Microsoft Clarity est **complète et fonctionnelle**. Le code est prêt à tracker les événements dès que vous configurerez votre Project ID.

## 📋 Ce qu'il reste à faire

### 1. Créer un compte Microsoft Clarity (5 minutes)

1. Aller sur [https://clarity.microsoft.com/](https://clarity.microsoft.com/)
2. Se connecter avec un compte Microsoft (gratuit)
3. Cliquer sur **"+ New Project"**
4. Remplir :
   - **Name** : Travel Book JS
   - **Website URL** : `https://stalina.github.io/travel-book-js/`
5. Cliquer sur **"Create"**
6. Copier le **Project ID** affiché (format : `abcdefghij`, 10 caractères)

### 2. Configurer pour le développement local

Créer un fichier `.env.local` à la racine du projet :

```bash
echo "VITE_CLARITY_PROJECT_ID=votre_project_id_ici" > .env.local
```

**Important :** Remplacez `votre_project_id_ici` par votre vrai Project ID copié à l'étape 1.

### 3. Configurer pour GitHub Pages (production)

1. Aller dans votre repository GitHub : [https://github.com/stalina/travel-book-js](https://github.com/stalina/travel-book-js)
2. **Settings** > **Secrets and variables** > **Actions**
3. Cliquer sur **"New repository secret"**
4. Nom : `VITE_CLARITY_PROJECT_ID`
5. Value : Coller votre Project ID
6. **Add secret**

Le workflow GitHub Actions injectera automatiquement cette variable lors du build de production.

### 4. Tester l'intégration

#### En local :

1. Lancer l'app : `npm run dev`
2. Ouvrir la console navigateur (F12)
3. Vérifier le message : `[Analytics] Microsoft Clarity initialized`
4. Naviguer sur l'app (landing, upload, édition, export)
5. Aller sur le [dashboard Clarity](https://clarity.microsoft.com/) et vérifier les événements (délai ~2-5 min)

#### En production (après déploiement) :

1. Merger la branche `feat/user-stat` dans `main`
2. Attendre le déploiement GitHub Pages (~2-3 min)
3. Visiter [https://stalina.github.io/travel-book-js/](https://stalina.github.io/travel-book-js/)
4. Vérifier les événements dans le dashboard Clarity

### 5. Consulter les statistiques

Une fois configuré, vous pourrez voir dans le dashboard Clarity :

- **Nombre de visiteurs** sur la landing page
- **Source de trafic** (Google, direct, référents)
- **Taux de conversion** : combien créent un album
- **Utilisation de l'éditeur** : combien modifient leurs étapes
- **Taux d'export** : combien téléchargent leur travel book
- **Session replays** : voir exactement comment les utilisateurs naviguent
- **Heatmaps** : zones de clics et scroll

## 📊 Événements trackés

| Étape du parcours | Événement Clarity |
|-------------------|-------------------|
| Visite landing page | `landing_view` |
| Upload fichier | `upload_start` → `upload_success` |
| Ouverture éditeur | `editor_view` |
| Génération travel book | `generate_start` → `generate_success` |
| Ouverture viewer | `viewer_open` |
| Export PDF | `export_pdf_start` → `export_pdf_success` |

## 📚 Documentation complète

Voir `backlog/docs/doc-13 - Guide-Analytics-Microsoft-Clarity.md` pour :
- Architecture technique détaillée
- Liste exhaustive des événements
- Guide de consultation du dashboard
- Conformité RGPD
- Maintenance et évolution

## ⚠️ Important

- Le fichier `.env.local` est dans `.gitignore`, il ne sera jamais commité
- Sans Project ID configuré, l'app fonctionne normalement mais sans analytics
- La page de politique de confidentialité est accessible via le footer ou `/privacy`

---

**Besoin d'aide ?** Consultez la doc complète ou ouvrez une issue GitHub.
