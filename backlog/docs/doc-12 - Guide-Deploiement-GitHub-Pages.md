# Guide de Déploiement sur GitHub Pages

Ce document explique comment activer et gérer le déploiement automatique du projet Travel Book JS sur GitHub Pages.

## Configuration Initiale

### 1. Activer GitHub Pages dans le Repository

1. Allez sur votre repository GitHub : `https://github.com/stalina/travel-book-js`
2. Cliquez sur **Settings** (Paramètres)
3. Dans le menu latéral, cliquez sur **Pages**
4. Sous **Source**, sélectionnez **GitHub Actions**

### 2. Premier Déploiement

Le workflow GitHub Actions (`.github/workflows/deploy.yml`) se déclenche automatiquement :

- **À chaque push** sur la branche `main`
- **Manuellement** depuis l'onglet Actions de GitHub

Pour déclencher manuellement :
1. Allez dans l'onglet **Actions** du repository
2. Sélectionnez le workflow **Deploy to GitHub Pages**
3. Cliquez sur **Run workflow**
4. Sélectionnez la branche `main`
5. Cliquez sur **Run workflow**

### 3. Vérifier le Déploiement

Une fois le workflow terminé :
- Le site sera disponible à : `https://stalina.github.io/travel-book-js/`
- L'URL apparaîtra dans l'onglet **Pages** des settings
- Un badge vert avec l'URL s'affichera dans l'onglet **Actions** après un déploiement réussi

## Workflow CI/CD

Le workflow automatisé effectue les étapes suivantes :

### Job `build`
1. ✅ Checkout du code
2. ✅ Installation de Node.js 20 avec cache npm
3. ✅ Installation des dépendances (`npm ci`)
4. ✅ Vérification des types TypeScript (`npm run typecheck`)
5. ✅ Exécution des tests unitaires (`npm run test`)
6. ✅ Build de production (`npm run build`)
7. ✅ Upload de l'artefact pour déploiement

### Job `deploy`
1. ✅ Déploiement sur GitHub Pages
2. ✅ Publication de l'URL du site

## Configuration Vite

Le fichier `vite.config.ts` est configuré pour GitHub Pages :

```typescript
base: process.env.NODE_ENV === 'production' ? '/travel-book-js/' : '/'
```

Cette configuration :
- En **production** : utilise `/travel-book-js/` comme base path (nom du repository)
- En **développement local** : utilise `/` pour un fonctionnement normal

## Maintenance

### Désactiver le Déploiement Automatique

Pour suspendre temporairement les déploiements automatiques :
1. Renommez le fichier `.github/workflows/deploy.yml` en `.github/workflows/deploy.yml.disabled`
2. Ou commentez le trigger `on: push:` dans le fichier

### Modifier la Branche de Déploiement

Pour déployer depuis une autre branche que `main`, modifiez dans `.github/workflows/deploy.yml` :

```yaml
on:
  push:
    branches:
      - votre-branche  # Changez ici
```

### Désactiver les Tests ou Type Check

Si vous souhaitez accélérer le déploiement, vous pouvez commenter ces étapes dans le workflow :

```yaml
# - name: Run type check
#   run: npm run typecheck

# - name: Run tests
#   run: npm run test
```

⚠️ **Non recommandé** : Les tests et le type check garantissent la qualité du code déployé.

## Dépannage

### Le Workflow Échoue

1. Consultez les logs dans l'onglet **Actions**
2. Vérifiez que les tests passent localement : `npm run test`
3. Vérifiez le type check : `npm run typecheck`
4. Vérifiez le build : `npm run build`

### Le Site ne s'Affiche pas Correctement

- Vérifiez que le `base` dans `vite.config.ts` correspond au nom du repository
- Vérifiez que tous les liens dans votre code utilisent des chemins relatifs ou le router Vue
- Consultez la console du navigateur pour les erreurs 404

### Permissions Manquantes

Si vous obtenez une erreur de permissions :
1. Allez dans **Settings** > **Actions** > **General**
2. Sous **Workflow permissions**, sélectionnez **Read and write permissions**
3. Cochez **Allow GitHub Actions to create and approve pull requests**
4. Cliquez sur **Save**

## Ressources

- [Documentation GitHub Pages](https://docs.github.com/en/pages)
- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [Documentation Vite - Deploying a Static Site](https://vitejs.dev/guide/static-deploy.html)
