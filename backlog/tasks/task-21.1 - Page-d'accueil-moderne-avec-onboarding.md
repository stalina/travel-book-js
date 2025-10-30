---
id: task-21.1
title: Page d'accueil moderne avec onboarding
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-30 22:11'
updated_date: '2025-10-30 22:55'
labels: []
dependencies: []
parent_task_id: task-21
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Créer une landing page accueillante avec présentation du produit, fonctionnalités clés, et processus d'onboarding fluide
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Composant HeroSection avec animation gradient et parallaxe
- [ ] #2 Composant FeaturesGrid affichant 9 fonctionnalités clés
- [ ] #3 Composant HowItWorks avec 4 étapes visuelles
- [ ] #4 Composant CallToAction avec boutons principaux
- [ ] #5 Animations au scroll via Intersection Observer
- [ ] #6 Design 100% responsive (mobile, tablet, desktop)
- [ ] #7 Intégration au router Vue avec route /
- [ ] #8 Tests unitaires pour chaque composant
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Migrer le design-system.css en variables CSS globales dans App.vue
2. Créer composants techniques réutilisables (BaseButton, BaseCard, etc.)
3. Créer composants fonctionnels de la landing page :
   - LandingHero.vue (section hero avec animations)
   - LandingFeatures.vue (grille 9 fonctionnalités)
   - LandingHowItWorks.vue (4 étapes processus)
   - LandingCTA.vue (appels à l'action)
4. Créer composable useScrollAnimation.ts pour Intersection Observer
5. Créer vue LandingView.vue qui orchestre tous les composants
6. Mettre à jour le router pour rediriger / vers la landing
7. Tests unitaires pour chaque composant (Vitest)
8. Documentation et notes d'implémentation
<!-- SECTION:PLAN:END -->
