# Catalogue des artefacts

Ce catalogue complete les fichiers sources. Pour chaque artefact, le code source est dans le fichier indique.

| Artefact | Objectif | Explication courte | Source | Notes pour le rapport |
|---|---|---|---|---|
| BPMN - Collecte et validation des besoins | Montrer comment les besoins enseignants deviennent des besoins departementaux valides. | Le processus separe enseignant, chef de departement et responsable. | `docs/bpmn/01-collecte-validation-besoins.mmd` | A placer dans la section analyse metier. |
| BPMN - Appel d'offre | Montrer la creation et publication d'un appel d'offre. | Le responsable regroupe les besoins, definit les dates et publie. | `docs/bpmn/02-appel-offre.mmd` | Insister sur la regle des dates debut/fin. |
| BPMN - Soumission et evaluation des offres | Montrer la participation fournisseur et la selection. | Les offres sont acceptees seulement pendant un appel actif ; les invalides sont eliminees avec motif. | `docs/bpmn/03-soumission-evaluation-offres.mmd` | Relier aux regles BR-02 a BR-05. |
| BPMN - Livraison, inventaire et affectation | Montrer la reception et la mise en inventaire. | Chaque ressource recoit un code inventaire puis peut etre affectee. | `docs/bpmn/04-livraison-inventaire-affectation.mmd` | Utile pour expliquer le cycle de vie d'une ressource. |
| BPMN - Signalement de panne et maintenance | Montrer le traitement d'une panne. | L'enseignant signale, le technicien intervient et produit un constat si necessaire. | `docs/bpmn/05-signalement-maintenance.mmd` | Relier aux exigences FR-18 a FR-20. |
| BPMN - Garantie | Montrer la demande de reparation ou remplacement. | Le responsable agit seulement si la garantie est encore valide. | `docs/bpmn/06-garantie-reparation-remplacement.mmd` | Mentionner la contrainte BR-10. |
| Diagramme des exigences | Regrouper exigences fonctionnelles, non fonctionnelles et regles. | Le diagramme montre les contraintes qui supportent ou limitent les fonctions. | `docs/requirements/requirements-diagram.mmd` | A utiliser apres les tables FR/NFR/BR. |
| Cas d'utilisation global | Presenter les interactions principales des acteurs avec le systeme. | Il relie acteurs, cas principaux et relations include/extend. | `docs/uml/use-cases.puml` | Rendre le diagramme `Global_Use_Cases`. |
| Cas d'utilisation par acteur | Detaille le perimetre fonctionnel de chaque acteur. | Le meme fichier contient une vue par responsable, chef, enseignant, fournisseur, technicien et administrateur. | `docs/uml/use-cases.puml` | Rendre chaque bloc PlantUML separement si besoin. |
| Diagramme de packages | Organiser le systeme en modules logiques. | Les packages suivent les domaines : securite, besoins, appels d'offres, inventaire, maintenance, audit. | `docs/uml/package-diagram.puml` | Sert de transition vers l'architecture. |
| WBS | Decouper le projet en lots de travail. | Le mindmap liste analyse, modelisation, architecture, implementation, tests et finalisation. | `docs/project-management/wbs.mmd` | A integrer dans la partie gestion de projet. |
| Gantt | Planifier les phases du projet. | Le planning inclut dependencies, releases, integration, deploiement et soutenance. | `docs/project-management/gantt.mmd` | Les dates sont previsionnelles et ajustables. |
| Proposition architecturale | Justifier l'architecture retenue. | Le document recommande un monolithe modulaire 3-tiers. | `docs/architecture/architecture-proposal.md` | A placer avant composants et deploiement. |
| Diagramme de composants | Montrer les composants frontend, backend et base. | Les modules backend correspondent aux packages logiques. | `docs/architecture/component-diagram.puml` | Relier aux NFR de securite, audit et maintenabilite. |
| Diagramme de deploiement | Montrer l'execution sur navigateur, serveurs et PostgreSQL. | La vue inclut conteneurs Docker et volume persistant. | `docs/architecture/deployment-diagram.puml` | Adapter si le prototype n'utilise pas Docker. |
| Diagramme de classes | Decrire le modele de domaine. | Il couvre utilisateurs, besoins, appels, offres, ressources, maintenance et garantie. | `docs/uml/class-diagram.puml` | Ne pas surcharger avec des methodes dans le rapport. |
| Diagrammes de sequence | Decrire les workflows applicatifs critiques. | Neuf sequences couvrent les cas de bout en bout. | `docs/uml/sequence-diagrams.puml` | Rendre chaque bloc `Seq_*` separement. |
| Revue de coherence | Verifier l'alignement des artefacts. | La table controle acteurs, exigences, processus, classes, sequences, architecture et NFR. | `docs/testing/consistency-review.md` | A utiliser en conclusion technique. |
