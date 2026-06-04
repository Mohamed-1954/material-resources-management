# Notes de deploiement

## Objectif

Decrire un deploiement academique simple pour le prototype.

## Configuration recommandee

- Un conteneur frontend servant l'application web.
- Un conteneur backend exposant l'API REST.
- Un conteneur PostgreSQL avec volume persistant.
- Variables d'environnement pour l'URL de base de donnees, la cle JWT et les parametres applicatifs.

## Points de vigilance

- Ne jamais stocker la cle JWT ou les mots de passe dans le code source.
- Activer les migrations de base de donnees au demarrage ou pendant le deploiement.
- Initialiser les roles de base : responsable, chef de departement, enseignant, fournisseur, technicien, administrateur.
- Prevoir des sauvegardes de la base PostgreSQL.
- Garder les logs d'audit separes des logs techniques.
