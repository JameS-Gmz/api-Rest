# Playforge
PlayForge est un site de partage et d'achat de jeu indépendant.

## SYSTEME DE NOTIFICATION : 

Mise à Jour d'un jeu de la Bibliothèque

Mise en ligne d'un jeu d'une catégorie likée 

Nouveaux Commentaires/Développeurs

Promo sur certains jeux

## SYSTEME DE BIBLIOTHEQUE :
- stockage des jeux téléchargés 
- stockage pendant une durée de 1 semaine des jeux supprimés
- stockage et récalpitulatif des jeux payés
- jeux souhaités ? (possibilité d'ajouter les jeux télécharger dans une collections)

## SYSTEME DE LOG :
- profil / signIn / signUp 
- modification de profil (photo/name/description)
- obtention des rôles (Développeurs/Utilisateurs)

## Roles :
- Users : classe parent qui permet d'acceder aux download / commentaires / bibliotheque / notifications
- Développeurs : possibilités d'upload mais vérification necessaires par carte d'identitée et paiement de 5€ ?? 
- Admin : contrôle total

## SYSTEME D'UPLOAD ET DE DOWNLOAD :

- possibilité d'upload des fichiers
- possibilité de Download des fichiers 

## SYSTEME DE COMMENTAIRES/NOTES : 

- espace commentaires sous chaque jeux
- notation des jeux par des Users et/ou developpeurs

````mermaid
 erDiagram
 
Game
Category
Cart
User
Role

Game{
id INT
price DECIMAL
name STRING
image URL
}

````

