---
id: doc-15
title: Guide to Deploying on GitHub Pages
type: other
created_date: '2025-11-27 08:38'
---
# Guide to Deploying on GitHub Pages

This document explains how to enable and manage automatic deployment of the Travel Book JS project to GitHub Pages.

## Initial Setup

### 1. Enable GitHub Pages in the repository

1. Open your GitHub repository: `https://github.com/stalina/travel-book-js`
2. Click **Settings**
3. In the side menu click **Pages**
4. Under **Source**, select **GitHub Actions**

### 2. First deployment

The GitHub Actions workflow (`.github/workflows/deploy.yml`) is triggered automatically:

- On every push to the `main` branch
- Manually from the repository Actions tab

To run the workflow manually:
1. Open the **Actions** tab in the repository
2. Select the workflow named **Deploy to GitHub Pages**
3. Click **Run workflow**
4. Choose the `main` branch
5. Click **Run workflow**

### 3. Verify the deployment

After the workflow completes:
- The site will be available at: `https://stalina.github.io/travel-book-js/`
- The URL will appear in the **Pages** settings
- A green badge with the URL will be shown in the **Actions** tab after a successful deployment

## CI/CD workflow

The automated workflow performs the following steps:

### Job `build`
1. ✅ Checkout the code
2. ✅ Install Node.js 20 with npm cache
3. ✅ Install dependencies (`npm ci`)
4. ✅ Run TypeScript type check (`npm run typecheck`)
5. ✅ Run unit tests (`npm run test`)
6. ✅ Build production bundle (`npm run build`)
7. ✅ Upload the artifact for deployment

### Job `deploy`
1. ✅ Deploy to GitHub Pages
2. ✅ Publish the site URL

## Vite configuration

The `vite.config.ts` file is configured for GitHub Pages:

```typescript
base: process.env.NODE_ENV === 'production' ? '/travel-book-js/' : '/'
```

This configuration:
- In **production**: uses `/travel-book-js/` as the base path (repository name)
- In **local development**: uses `/` for normal local behavior

## Maintenance

### Disable automatic deployment

To temporarily suspend automatic deployments:
1. Rename `.github/workflows/deploy.yml` to `.github/workflows/deploy.yml.disabled`
2. Or comment out the `on: push:` trigger in the workflow file

### Change the deployment branch

To deploy from a branch other than `main`, edit `.github/workflows/deploy.yml` and update:

```yaml
on:
  push:
    branches:
      - your-branch  # Change here
```

### Disable tests or type check

If you want to speed up deployment you can comment out these steps in the workflow:

```yaml
# - name: Run type check
#   run: npm run typecheck

# - name: Run tests
#   run: npm run test
```

⚠️ Not recommended: tests and type checking help ensure the quality of deployed code.

## Troubleshooting

### The workflow fails

1. Inspect the logs in the **Actions** tab
2. Verify tests pass locally: `npm run test`
3. Verify type check: `npm run typecheck`
4. Verify build: `npm run build`

### The site does not render correctly

- Ensure the `base` setting in `vite.config.ts` matches the repository name
- Ensure links in the code use relative paths or the Vue router
- Check the browser console for 404 errors

### Missing permissions

If you get a permissions error:
1. Go to **Settings** > **Actions** > **General`
2. Under **Workflow permissions**, select **Read and write permissions**
3. Check **Allow GitHub Actions to create and approve pull requests**
4. Click **Save**

## Resources

- [GitHub Pages documentation](https://docs.github.com/en/pages)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
- [Vite - Deploying a Static Site](https://vitejs.dev/guide/static-deploy.html)
