---
id: TASK-34
title: Implémenter Google Analytics 4 pour le suivi d'utilisation
status: Done
assignee:
  - '@copilot'
created_date: '2025-11-26 16:34'
updated_date: '2026-02-13 12:51'
labels: []
dependencies: []
priority: high
ordinal: 2000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Mettre en place GA4 pour suivre l'utilisation du site Travel Book JS (front-only) avec des événements personnalisés pour : landing page, création d'album, édition, prévisualisation et export PDF. Inclure la documentation de politique de confidentialité.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 GA4 configuré avec un compte Google Analytics
- [x] #2 Script gtag.js intégré dans l'application
- [x] #3 Événements personnalisés trackés : page_view (landing), album_creation_start, editor_opened, preview_opened, pdf_exported
- [x] #4 Politique de confidentialité rédigée en français
- [x] #5 Bannière de consentement cookies implémentée
- [x] #6 Documentation utilisateur créée pour expliquer les analytics
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Intégrer Google Tag Manager (GTM-TDDMJFGF) dans index.html avec chargement conditionnel basé sur le consentement
2. Créer un service AnalyticsService singleton pour encapsuler la logique GTM/GA4 et pousser les événements dans dataLayer
3. Implémenter le tracking des événements clés via dataLayer.push() :
   - Landing page view (page_view)
   - Album creation start (album_creation_start)
   - Editor opened (editor_opened)
   - Preview opened (preview_opened)
   - PDF export (pdf_exported)
4. Créer une bannière de consentement cookies (composant Vue CookieConsent)
5. Gérer le consentement dans localStorage et initialiser GTM seulement après acceptation
6. Rédiger la politique de confidentialité en français
7. Créer la documentation utilisateur pour les analytics
8. Tester en local avec le mode preview GTM
9. Configurer les tags/triggers/variables dans GTM (guide)
10. Déployer sur GitHub Pages
<!-- SECTION:PLAN:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Implémentation terminée:
- AnalyticsService créé (singleton)
- CookieConsent component avec gestion localStorage
- PrivacyPolicyView avec route /privacy
- GTM intégré dans index.html avec chargement conditionnel
- Tracking ajouté pour tous les événements:
  * page_view dans router (landing, home, editor, privacy)
  * album_creation_start dans trip.store (pickDirectory, setFiles)
  * editor_opened dans EditorView.vue avec stepCount
  * preview_opened dans PreviewPanel.vue (openPanel)
  * pdf_exported dans PreviewPanel.vue (printPreview)
<!-- SECTION:NOTES:END -->
