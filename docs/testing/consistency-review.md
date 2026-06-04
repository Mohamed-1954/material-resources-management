# Consistency Review

## Objectif

Verifier que les artefacts produits restent coherents entre eux et avec le cahier des charges.

## Verification

| Point controle | Resultat |
|---|---|
| Acteurs coherents | Les memes acteurs sont utilises dans exigences, BPMN, cas d'utilisation, sequences et architecture. |
| Processus et cas d'utilisation alignes | Chaque processus metier correspond a des cas d'utilisation principaux. |
| Exigences couvertes | Les exigences fonctionnelles couvrent besoins, appels d'offres, fournisseurs, offres, inventaire, affectations, pannes, constats, garanties, notifications et audit. |
| Regles metier integrees | Les dates d'appel d'offre, la soumission active, le motif d'elimination, le moins-disant, le code inventaire, les constats severes et la garantie sont presents dans les diagrammes. |
| Modele de classes compatible | Les entites du diagramme de classes supportent les workflows de soumission, validation, selection, livraison, affectation, maintenance et garantie. |
| Sequences compatibles | Les sequences utilisent les memes modules et entites que l'architecture et le modele de classes. |
| Packages et architecture alignes | Les packages logiques correspondent aux modules du backend API dans le diagramme de composants. |
| Exigences non fonctionnelles refletees | Securite, controle d'acces, audit, integrite et maintenabilite sont integres dans l'architecture proposee. |

## Synthese

Les artefacts forment un ensemble coherent pour un rapport academique. Le principal point a clarifier avec le client reste la granularite de selection du moins-disant : selection globale par offre ou selection par ligne de materiel. Par defaut, les diagrammes retiennent une selection globale de l'offre valide au total le plus bas, car c'est l'interpretation la plus directe du cahier des charges.
