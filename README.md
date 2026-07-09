# Mon Carnet

Application de gestion de compte pour petits commerçants (ventes, dépenses, ardoises/crédits clients, modes de paiement).

## Déployer sur Netlify (méthode simple, glisser-déposer)

1. Aller sur https://app.netlify.com et créer un compte gratuit (email + mot de passe, pas besoin de numéro fiscal).
2. Sur cette machine, lancer :
   ```
   npm install
   npm run build
   ```
   Cela crée un dossier `dist/`.
3. Sur Netlify, dans "Sites", glisser-déposer le dossier `dist/` directement dans le navigateur.
4. Netlify vous donne un lien du type `moncarnet-xxxx.netlify.app` — c'est votre application en ligne, accessible à tout le monde.
5. Vous pouvez ensuite renommer le lien (Site settings > Change site name) ou connecter un vrai nom de domaine.

## Déployer via GitHub (méthode recommandée pour les mises à jour faciles)

1. Créer un compte gratuit sur https://github.com
2. Créer un nouveau dépôt et y déposer tous les fichiers de ce dossier
3. Sur Netlify : "Add new site" > "Import an existing project" > connecter GitHub > choisir le dépôt
4. Netlify détecte automatiquement la configuration (build command: `npm run build`, publish directory: `dist`)
5. Chaque modification poussée sur GitHub republie automatiquement le site

## Prochaines étapes (comptes utilisateurs séparés, paiements)

Actuellement, les données sont stockées par utilisateur individuel du navigateur (pas de compte). Pour permettre à plusieurs commerçants d'avoir chacun leur propre carnet séparé avec connexion, il faudra ajouter une vraie base de données et un système d'authentification — étape à construire séparément.
