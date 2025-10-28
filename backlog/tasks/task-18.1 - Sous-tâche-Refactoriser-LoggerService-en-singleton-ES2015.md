---
id: task-18.1
title: 'Sous-tâche: Refactoriser LoggerService en singleton ES2015'
status: In Progress
assignee:
  - '@copilot'
created_date: '2025-10-28 19:36'
updated_date: '2025-10-28 19:50'
labels:
  - refactoring
  - typescript
dependencies: []
parent_task_id: task-18
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Transformer le service logger.service.ts en classe singleton ES2015 avec méthodes publiques/privées claires
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Classe LoggerService créée avec constructeur privé
- [x] #2 Pattern singleton implémenté (getInstance)
- [x] #3 Export singleton loggerService disponible
- [x] #4 Tous les imports migés vers loggerService
- [x] #5 Tests unitaires adaptés pour la classe
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
✅ Refactorisation de LoggerService terminée avec succès

**Changements effectués:**
- Classe LoggerService créée avec pattern Singleton ES2015
- Constructeur privé implémenté
- Méthode statique getInstance() ajoutée
- Export singleton loggerService disponible
- Wrapper rétrocompatible logger exporté (deprecated)
- Visibilité explicite (public) sur toutes les méthodes
- JSDoc complété pour chaque méthode publique

**Migrations effectuées:**
- generate.service.ts : import et usages migés vers loggerService
- builders/*.ts : tous les builders migés vers loggerService
- tests/logger.service.spec.ts : tests adaptés + tests Singleton ajoutés

**Validation:**
- ✅ Tous les tests passent (83/83)
- ✅ Aucune erreur de compilation
- ✅ Tests Singleton ajoutés et validés
- ✅ Rétrocompatibilité préservée avec export logger (deprecated)
<!-- SECTION:NOTES:END -->
