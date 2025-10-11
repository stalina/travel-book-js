---
id: task-6
title: Ajouter une page de couverture au travel book
status: To Do
assignee: []
created_date: '2025-10-11 23:22'
labels: []
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Créer la première page du travel book contenant la photo de couverture, l'année du voyage, et le titre centré en blanc comme l'exemple fourni. Générer cette page via generate.service.ts avant les pages d'étapes.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 La page de couverture est ajoutée en tout début de travel_book.html
- [ ] #2 La photo de couverture provient du trip (cover_photo ou première photo d'étape fallback) et est affichée plein cadre avec recadrage cohérent
- [ ] #3 L'année du voyage (année de start_date) est affichée dans un cartouche sobre
- [ ] #4 Le titre du voyage (trip.name) est centré horizontalement et verticalement sur la photo en texte blanc avec bonne lisibilité (fond semi-transparent ou ombre)
- [ ] #5 La mise en page respecte les marges/impositions actuelles pour export PDF : taille page identique, pas de débordement hors zone imprimable
- [ ] #6 Le build single-file continue de fonctionner avec la page de couverture
- [ ] #7 Tests: au moins un test vérifie la présence des éléments (année, titre, balise couverture)
- [ ] #8 Documentation README et instructions Copilot mises à jour pour expliquer la page de couverture et comment la personnaliser
<!-- AC:END -->
