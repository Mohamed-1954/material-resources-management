# 1. Introduction

Ce document presente l'analyse fonctionnelle, les exigences, les regles metier, les scenarios et les wireframes textuels du systeme de gestion des ressources materielles d'une faculte.

Le systeme couvre le cycle complet : expression des besoins par les enseignants, validation par les chefs de departement, appels d'offres, soumission et evaluation des offres fournisseurs, livraison, inventaire, affectation, signalement des pannes, maintenance et demandes de reparation ou remplacement sous garantie.

# 2. Analysis Summary

## Processus metier identifies

| Code | Processus | Objectif |
|---|---|---|
| BP-01 | Collecte et validation des besoins | Centraliser les besoins des enseignants et du departement avant transmission au responsable. |
| BP-02 | Creation d'un appel d'offre | Regrouper les besoins valides et publier un appel d'offre avec date de debut et date de fin. |
| BP-03 | Soumission et evaluation des offres | Permettre aux fournisseurs de proposer leurs offres, eliminer les offres invalides et choisir le moins-disant valide. |
| BP-04 | Livraison, inventaire et affectation | Enregistrer la livraison, attribuer un numero d'inventaire ou code-barres et affecter les ressources. |
| BP-05 | Signalement de panne et maintenance | Declarer une panne, diagnostiquer la ressource et documenter l'intervention. |
| BP-06 | Reparation ou remplacement sous garantie | Demander au fournisseur la reparation ou le remplacement lorsque la garantie est encore valide. |

## Entites majeures du domaine

Utilisateur, Role, Departement, Fournisseur, Besoin, LigneBesoin, AppelOffre, LigneAppelOffre, OffreFournisseur, LigneOffre, Ressource, Ordinateur, Imprimante, Affectation, Panne, InterventionMaintenance, ConstatTechnique, ActionGarantie, Notification, JournalAudit.

## Modules logiques

Authentification et securite, gestion des utilisateurs, gestion des departements, gestion des besoins, gestion des appels d'offres, gestion des fournisseurs, gestion des offres, gestion des ressources et de l'inventaire, gestion des affectations, gestion de maintenance, notifications, audit et tracabilite.

## Workflows necessitant des sequences

Soumission d'un besoin, validation des besoins, creation d'un appel d'offre, soumission d'une offre, evaluation et selection, livraison et affectation, signalement de panne, intervention et constat, action sous garantie.

# 3. Actors

| Acteur | Description | Responsabilites principales |
|---|---|---|
| Responsable des ressources | Acteur central de gestion des acquisitions, ressources et garanties. | Creer les appels d'offres, evaluer les offres, selectionner le fournisseur, enregistrer les livraisons, affecter les ressources, traiter les constats et garanties. |
| Chef de departement | Responsable de la consolidation des besoins d'un departement. | Demander les besoins, les valider, les modifier apres concertation et les transmettre. |
| Enseignant | Utilisateur final des ressources. | Soumettre des besoins, consulter ses ressources, signaler des pannes. |
| Fournisseur | Societe externe proposant et livrant du materiel. | S'inscrire, consulter les appels d'offres, soumettre des offres, recevoir notifications, traiter demandes de garantie. |
| Technicien de maintenance | Membre du service maintenance. | Diagnostiquer les pannes, intervenir, rediger les constats techniques. |
| Administrateur systeme | Acteur technique justifie par la securite et les roles. | Gerer les comptes, roles, droits d'acces et parametrages de base. |

# 4. Functional Requirements

| ID | Exigence fonctionnelle | Priorite | Acteurs concernes | Couverture |
|---|---|---:|---|---|
| FR-01 | Gerer l'authentification securisee des utilisateurs. | Haute | Tous | Authentification, roles |
| FR-02 | Gerer les utilisateurs, roles et droits d'acces. | Haute | Administrateur systeme | Administration |
| FR-03 | Gerer les departements et leurs membres. | Moyenne | Administrateur systeme, chef de departement | Departements |
| FR-04 | Permettre a un enseignant de soumettre un besoin materiel. | Haute | Enseignant | BP-01 |
| FR-05 | Permettre au chef de departement de consolider, modifier et valider les besoins. | Haute | Chef de departement | BP-01 |
| FR-06 | Generer et envoyer la liste previsionnelle d'affectation au responsable. | Moyenne | Chef de departement, responsable | BP-01 |
| FR-07 | Creer et publier un appel d'offre avec date de debut et date de fin. | Haute | Responsable | BP-02 |
| FR-08 | Permettre aux fournisseurs inscrits de consulter les appels d'offres actifs. | Haute | Fournisseur | BP-03 |
| FR-09 | Permettre aux fournisseurs de soumettre une offre detaillee. | Haute | Fournisseur | BP-03 |
| FR-10 | Evaluer les offres et eliminer les fournisseurs non conformes avec motif. | Haute | Responsable | BP-03 |
| FR-11 | Selectionner automatiquement ou manuellement l'offre valide la moins disante. | Haute | Responsable | BP-03 |
| FR-12 | Notifier le fournisseur accepte et les fournisseurs rejetes. | Haute | Responsable, fournisseur | BP-03 |
| FR-13 | Enregistrer une livraison et completer les informations fournisseur si necessaire. | Haute | Responsable | BP-04 |
| FR-14 | Attribuer un numero d'inventaire ou code-barres a chaque ressource livree. | Haute | Responsable | BP-04 |
| FR-15 | Lister, modifier et supprimer les ressources selon les droits. | Moyenne | Responsable | Inventaire |
| FR-16 | Affecter une ressource a un enseignant ou a un departement. | Haute | Responsable | BP-04 |
| FR-17 | Modifier ou supprimer une affectation selon les droits. | Moyenne | Responsable | Affectations |
| FR-18 | Permettre a un enseignant de signaler une panne. | Haute | Enseignant | BP-05 |
| FR-19 | Gerer les interventions de maintenance. | Haute | Technicien | BP-05 |
| FR-20 | Rediger un constat technique pour une panne severe. | Haute | Technicien | BP-05 |
| FR-21 | Gerer les demandes de reparation ou remplacement sous garantie. | Haute | Responsable, fournisseur | BP-06 |
| FR-22 | Envoyer des notifications aux acteurs concernes. | Haute | Tous | Notifications |
| FR-23 | Assurer la tracabilite des operations importantes. | Haute | Tous | Audit |

# 5. Non-Functional Requirements

| ID | Exigence non fonctionnelle | Description | Critere d'acceptation |
|---|---|---|---|
| NFR-01 | Securite | Les acces au logiciel doivent etre securises. | Authentification obligatoire, sessions protegees, mots de passe haches. |
| NFR-02 | Controle d'acces | Chaque acteur accede uniquement aux fonctions autorisees. | Autorisations basees sur les roles. |
| NFR-03 | Tracabilite | Les operations critiques sont journalisees. | JournalAudit conserve acteur, action, date et cible. |
| NFR-04 | Integrite des donnees | Les donnees metier doivent rester coherentes. | Contraintes de dates, statuts et cardinalites en base. |
| NFR-05 | Auditabilite | Les decisions importantes doivent etre justifiables. | Motifs d'elimination, selection et actions de garantie consultables. |
| NFR-06 | Performance | Les listes courantes doivent etre consultables rapidement. | Reponse inferieure a 2 secondes pour les listes usuelles en charge normale. |
| NFR-07 | Disponibilite | Le systeme doit rester disponible pendant les heures de travail. | Sauvegardes et reprise apres incident documentees. |
| NFR-08 | Maintenabilite | Le code doit etre structure en modules simples. | Architecture modulaire et tests automatises. |
| NFR-09 | Ergonomie | Les interfaces doivent etre simples pour les acteurs non techniques. | Parcours courts, libelles clairs, validations visibles. |
| NFR-10 | Confidentialite | Les offres et decisions ne doivent pas etre visibles par des acteurs non autorises. | Les fournisseurs ne consultent pas les offres concurrentes. |

# 6. Business Rules

| ID | Regle metier | Impact |
|---|---|---|
| BR-01 | Un appel d'offre possede une date de debut et une date de fin. | Publication et soumission controlees. |
| BR-02 | Un fournisseur ne peut soumettre une offre que pendant un appel d'offre actif. | Controle de validite des offres. |
| BR-03 | Un fournisseur inscrit sur liste noire peut etre elimine. | Evaluation des fournisseurs. |
| BR-04 | Toute elimination exige un motif communique au fournisseur. | Auditabilite et transparence. |
| BR-05 | L'offre valide la moins disante est selectionnee. | Decision d'achat. |
| BR-06 | Chaque ressource livree recoit un numero d'inventaire ou un code-barres unique. | Inventaire. |
| BR-07 | Une ressource peut etre affectee a un enseignant ou a un departement. | Affectations. |
| BR-08 | Une panne severe exige un constat technique. | Maintenance. |
| BR-09 | Les pannes d'imprimantes sont uniquement d'ordre materiel. | Validation des constats. |
| BR-10 | Une action de garantie est autorisee uniquement avant expiration de la garantie. | Garantie fournisseur. |
| BR-11 | Une ressource supprimee ne doit pas avoir d'affectation active ni de panne ouverte. | Integrite. |
| BR-12 | Une offre rejetee ou eliminee ne peut pas etre selectionnee. | Coherence de selection. |

# 7. Business Process Diagrams

Les sources Mermaid se trouvent dans `docs/bpmn/` :

| Processus | Fichier |
|---|---|
| Collecte et validation des besoins | `docs/bpmn/01-collecte-validation-besoins.mmd` |
| Appel d'offre | `docs/bpmn/02-appel-offre.mmd` |
| Soumission et evaluation des offres | `docs/bpmn/03-soumission-evaluation-offres.mmd` |
| Livraison, inventaire et affectation | `docs/bpmn/04-livraison-inventaire-affectation.mmd` |
| Signalement de panne et maintenance | `docs/bpmn/05-signalement-maintenance.mmd` |
| Reparation ou remplacement sous garantie | `docs/bpmn/06-garantie-reparation-remplacement.mmd` |

# 8. Requirements Diagram

Le diagramme des exigences est fourni dans `docs/requirements/requirements-diagram.mmd`.

# 9. Clarifications / Questions / Assumptions

## Hypotheses retenues

- Le systeme est une application web accessible aux acteurs internes et aux fournisseurs.
- Les enseignants appartiennent a un seul departement dans le cadre du projet.
- Le responsable peut consolider les besoins de plusieurs departements dans un seul appel d'offre.
- Le choix du moins-disant s'applique apres elimination des offres et fournisseurs invalides.
- Les informations completes du fournisseur peuvent etre saisies au moment de la livraison si elles ne l'ont pas ete a l'inscription.
- La liste noire des fournisseurs est geree par le responsable des ressources.
- Les notifications sont internes au systeme et peuvent etre completees par email dans une version future.

## Ambiguites

- Le budget par departement est mentionne mais les regles de controle budgetaire ne sont pas detaillees.
- La procedure de reunion de concertation n'est pas formalisee : elle est modelisee comme une etape de revision des besoins.
- Le document ne precise pas si l'appel d'offre porte sur un seul type de materiel ou plusieurs lignes ; le modele retient plusieurs lignes.
- Le niveau de validation administrative externe a la faculte n'est pas mentionne.
- La suppression physique des ressources peut poser un probleme d'audit ; le modele recommande plutot une desactivation logique.

## Questions a poser au client

1. Faut-il gerer un budget numerique par departement et bloquer les besoins qui le depassent ?
2. Les fournisseurs doivent-ils fournir des documents administratifs lors de l'inscription ?
3. Une offre peut-elle proposer une marque differente de celle demandee si les caracteristiques sont equivalentes ?
4. Le moins-disant est-il calcule sur le total global ou par ligne de materiel ?
5. Qui valide definitivement la reception conforme de la livraison ?
6. Une ressource peut-elle changer plusieurs fois d'affectation avec historique complet ?
7. Quels canaux de notification sont attendus : application, email, SMS ?
8. Quelle duree de conservation est exigee pour le journal d'audit ?

# 10. Scenarios

| Scenario | Acteur principal | Deroulement nominal | Resultat |
|---|---|---|---|
| Soumission d'un besoin | Enseignant | L'enseignant se connecte, choisit le type de ressource, renseigne les caracteristiques et soumet le besoin. | Le besoin est en attente de validation par le chef. |
| Validation des besoins | Chef de departement | Le chef consulte les besoins, ajuste apres concertation, valide et transmet au responsable. | Les besoins consolides sont transmis. |
| Creation d'un appel d'offre | Responsable | Le responsable regroupe les besoins, definit les dates et publie l'appel d'offre. | L'appel d'offre devient visible aux fournisseurs pendant la periode active. |
| Soumission d'une offre | Fournisseur | Le fournisseur inscrit consulte l'appel actif et soumet prix, marque, garantie, date de livraison et total. | L'offre est enregistree. |
| Selection fournisseur | Responsable | Le responsable elimine les fournisseurs invalides, compare les offres valides et choisit le moins-disant. | Le fournisseur retenu est notifie ; les autres recoivent un rejet. |
| Signalement de panne | Enseignant | L'enseignant selectionne une ressource affectee, decrit la panne et l'envoie au service maintenance. | Une panne ouverte est creee. |
| Constat technique | Technicien | Le technicien intervient, tente la reparation et redige un constat si la panne est severe. | Le constat est transmis au responsable. |
| Garantie | Responsable | Le responsable verifie la garantie et envoie au fournisseur une demande de reparation ou remplacement. | Une action de garantie est creee et suivie. |

# 11. Wireframes

## Page de connexion

- Acteur cible : tous les utilisateurs.
- Objectif : permettre un acces securise.
- Sections : logo/titre, formulaire, messages d'erreur.
- Champs : email ou identifiant, mot de passe.
- Actions : se connecter, mot de passe oublie.

```text
+--------------------------------------------------+
| Gestion des ressources materielles               |
| [ Identifiant ]                                  |
| [ Mot de passe ]                                 |
| (Se connecter)        Mot de passe oublie        |
+--------------------------------------------------+
```

## Tableau de bord du responsable des ressources

- Objectif : piloter les appels d'offres, livraisons, inventaire, maintenance et garanties.
- Sections : indicateurs, appels actifs, livraisons attendues, pannes severes, actions rapides.
- Actions : creer appel d'offre, enregistrer livraison, affecter ressource, traiter constat.

```text
+ Menu +-------------------- Tableau responsable --------------------+
| AO  | Appels actifs | Offres a evaluer | Pannes severes | Garanties |
| Inv | Liste des alertes et actions prioritaires                    |
| Maint                                                               |
+--------------------------------------------------------------------+
```

## Tableau de bord du chef de departement

- Objectif : collecter et valider les besoins du departement.
- Sections : besoins en attente, besoins valides, liste previsionnelle d'affectation.
- Actions : demander besoins, modifier, valider, transmettre.

## Tableau de bord de l'enseignant

- Objectif : soumettre des besoins et signaler des pannes.
- Sections : mes ressources, mes besoins, mes signalements.
- Actions : nouveau besoin, signaler panne, consulter statut.

## Tableau de bord du fournisseur

- Objectif : consulter les appels d'offres et suivre les offres.
- Sections : appels actifs, mes offres, notifications, demandes de garantie.
- Actions : soumettre offre, consulter resultat, repondre demande.

## Tableau de bord du technicien

- Objectif : suivre les pannes et interventions.
- Sections : pannes assignees, interventions en cours, constats a rediger.
- Actions : accepter intervention, cloturer, creer constat.

## Gestion des appels d'offre

- Acteur cible : responsable.
- Champs : titre, dates, lignes de materiel, departements concernes, statut.
- Actions : brouillon, publier, cloturer, evaluer offres.

```text
+ Appel d'offre ------------------------------------------------------+
| Titre [________________]  Debut [date]  Fin [date]                 |
| Lignes: Type | Caracteristiques | Quantite                         |
| (Ajouter ligne) (Enregistrer) (Publier)                             |
+--------------------------------------------------------------------+
```

## Soumission d'une offre fournisseur

- Champs : appel d'offre, lignes d'offre, marque, prix unitaire, quantite, garantie, date livraison, total.
- Actions : sauvegarder brouillon, soumettre.

## Inventaire des ressources

- Acteur cible : responsable.
- Sections : filtres, tableau ressources, detail ressource.
- Champs : code inventaire, type, marque, statut, affectation, garantie.
- Actions : ajouter, modifier, supprimer si autorise, exporter.

## Affectation des ressources

- Acteur cible : responsable.
- Champs : ressource, departement, enseignant optionnel, date debut, commentaire.
- Actions : affecter, modifier, retirer.

## Signalement de panne

- Acteur cible : enseignant.
- Champs : ressource, date apparition, description, urgence, pieces jointes optionnelles.
- Actions : envoyer signalement, annuler.

## Redaction de constat technique

- Acteur cible : technicien.
- Champs : panne, diagnostic, date apparition, frequence, ordre logiciel/materiel, severite.
- Actions : enregistrer constat, transmettre au responsable.

# 12. Global Use Case Diagram

Voir `docs/uml/use-cases.puml`.

# 13. Actor-Specific Use Case Diagrams

Voir `docs/uml/use-cases.puml`, sections par acteur.

# 14. Package Diagram

Voir `docs/uml/package-diagram.puml`.

Le regroupement separe les modules de securite, referentiels, acquisition, inventaire, maintenance et services transverses. Cette decomposition est adaptee a un monolithe modulaire : elle reste simple pour un projet academique tout en evitant un code melange.

# 15. Work Breakdown Structure

Voir `docs/project-management/wbs.mmd`.

# 16. Gantt Diagram

Voir `docs/project-management/gantt.mmd`.

# 17. Architecture Proposal

Voir `docs/architecture/architecture-proposal.md`.

# 18. Component Diagram

Voir `docs/architecture/component-diagram.puml`.

# 19. Deployment Diagram

Voir `docs/architecture/deployment-diagram.puml`.

# 20. Class Diagram

Voir `docs/uml/class-diagram.puml`.

# 21. Sequence Diagrams

Voir `docs/uml/sequence-diagrams.puml`.

# 22. Consistency Review

Voir `docs/testing/consistency-review.md`.

# 23. Final Recommendations

- Garder le prototype sur une architecture web 3-tiers simple.
- Prioriser la release 1 sur authentification, besoins, appels d'offres, fournisseurs, offres et selection.
- Prioriser la release 2 sur inventaire, affectations, pannes, maintenance, constats et garanties.
- Conserver un journal d'audit des decisions importantes : publication d'appel d'offre, elimination, selection, livraison, affectation et action de garantie.
- Preferer une suppression logique pour les donnees critiques afin de preserver la tracabilite.
