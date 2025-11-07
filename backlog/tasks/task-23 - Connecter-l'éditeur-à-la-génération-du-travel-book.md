---
id: task-23
title: Connecter l'éditeur à la génération du travel book
status: In Progress
assignee:
  - '@github-copilot'
created_date: '2025-11-07 20:19'
updated_date: '2025-11-07 20:19'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Ajouter l'intégration entre l'éditeur et les services de génération existants pour produire un nouveau travel book directement depuis l'interface. Gestion des états de chargement et des erreurs attendue.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Un bouton ou action de l\'éditeur déclenche ArtifactGenerator et met à jour l\'aperçu avec le travel book généré.
- [ ] #2 L\'utilisateur reçoit un retour visuel en cas de succès ou d\'échec.
- [ ] #3 Les actions de génération sont verrouillées le temps du traitement pour éviter les doubles requêtes.
<!-- AC:END -->
