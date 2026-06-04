# Proposition architecturale

## Objectif

Proposer une architecture simple, realiste et comprehensible pour un projet academique de gestion des ressources materielles.

## Choix recommande

L'architecture recommandee est un **monolithe modulaire en trois tiers** :

1. **Frontend web** : interface utilisateur pour les enseignants, chefs de departement, responsable, fournisseurs, techniciens et administrateur.
2. **Backend API REST** : logique metier, securite, validations, notifications et journalisation.
3. **Base de donnees PostgreSQL** : stockage relationnel des utilisateurs, ressources, appels d'offres, offres, pannes, garanties et journaux d'audit.

## Justification

Cette architecture est adaptee au contexte parce qu'elle :

- reste simple a developper, tester et deployer par un groupe d'etudiants ;
- permet une separation claire entre interface, logique metier et donnees ;
- facilite la securite par authentification JWT et controle d'acces par roles ;
- evite la complexite inutile d'une architecture microservices pour un perimetre encore limite ;
- reste extensible grace a une organisation interne par modules.

## Couches et responsabilites

| Couche          | Responsabilites                                                                          |
| --------------- | ---------------------------------------------------------------------------------------- |
| Presentation    | Formulaires, tableaux de bord, listes, detail des ressources, messages de validation.    |
| API/Application | Orchestration des cas d'utilisation, validation des regles metier, notifications, audit. |
| Domaine         | Entites et services metier : besoins, appels d'offres, offres, inventaire, maintenance.  |
| Persistance     | Acces PostgreSQL, transactions, contraintes d'integrite, migrations.                     |

## Interactions principales

1. L'utilisateur agit depuis le navigateur.
2. Le frontend appelle l'API REST avec un jeton d'authentification.
3. L'API verifie le role et applique les regles metier.
4. Les donnees sont lues ou ecrites dans PostgreSQL.
5. Les notifications et journaux d'audit sont crees pour les actions importantes.

## Technologies possibles

| Partie          | Choix possible                                      |
| --------------- | --------------------------------------------------- |
| Frontend        | React ou Angular                                    |
| Backend         | Spring Boot ou Node.js/NestJS                       |
| Base de donnees | PostgreSQL                                          |
| Securite        | JWT, RBAC, hashage des mots de passe                |
| Deploiement     | Docker Compose pour frontend, backend et PostgreSQL |
