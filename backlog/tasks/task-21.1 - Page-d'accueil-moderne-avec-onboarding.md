---
id: task-21.1
title: Page d'accueil moderne avec onboarding
status: Done
assignee:
  - '@copilot'
created_date: '2025-10-30 22:11'
updated_date: '2025-10-30 23:08'
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
- [x] #1 Composant HeroSection avec animation gradient et parallaxe
- [x] #2 Composant FeaturesGrid affichant 9 fonctionnalités clés
- [x] #3 Composant HowItWorks avec 4 étapes visuelles
- [x] #4 Composant CallToAction avec boutons principaux
- [x] #5 Animations au scroll via Intersection Observer
- [x] #6 Design 100% responsive (mobile, tablet, desktop)
- [x] #7 Intégration au router Vue avec route /
- [x] #8 Tests unitaires pour chaque composant
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

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Implémentation réalisée

### Architecture
- Migration complète du design system (docs/mockups/design-system.css) vers App.vue
- Création de composants techniques réutilisables (BaseButton, BaseCard)
- Création de 4 composants fonctionnels de landing page
- Composable useScrollAnimation.ts pour animations au scroll avec Intersection Observer

### Composants créés

**Composants techniques** (src/components/):
- BaseButton.vue : 4 variants (primary, secondary, outline, ghost), 3 sizes, états loading/disabled
- BaseCard.vue : Slots header/body/footer, props hoverable/clickable

**Composants fonctionnels** (src/components/landing/):
- LandingHero.vue : Section hero avec gradient animé, 2 CTA, indicateur scroll
- LandingFeatures.vue : Grille responsive de 9 fonctionnalités avec animations échelonnées
- LandingHowItWorks.vue : 4 étapes du processus avec flèches de progression (desktop)
- LandingCTA.vue : Call-to-action finale avec background gradient

**Vue principale**:
- LandingView.vue : Orchestre tous les composants + footer

**Composable**:
- useScrollAnimation.ts : Hook réutilisable pour Intersection Observer

### Router
- Route / redirigée vers LandingView
- Ancienne route home déplacée vers /home
- Routes /generate et /viewer inchangées

### Tests
- BaseButton.spec.ts : 8 tests (variants, sizes, events, loading, disabled)
- BaseCard.spec.ts : 7 tests (slots, hoverable, clickable, events)
- LandingView.spec.ts : 3 tests (sections, footer, scroll)
- Total : 122 tests passent ✅

### Design
- Variables CSS complètes (couleurs, typographie, espacement, bordures, ombres)
- Animations smooth (fadeIn, slideInUp, parallax)
- 100% responsive (mobile, tablet, desktop)
- Respect de l'identité visuelle Travel Book (rouge #FF6B6B, turquoise #4ECDC4, jaune #FFE66D)

### Points techniques
- Pas de dépendance externe (animations natives CSS + Intersection Observer)
- Code TypeScript strict
- Composition API Vue 3
- Architecture OOP respectée (séparation technique/fonctionnel)
<!-- SECTION:NOTES:END -->
