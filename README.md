# PincabOS Scores en ligne

Serveur du tableau des scores en ligne de PincabOS (Cloudflare Workers + base D1, gratuit).

## Principe
- Chaque pincab s'**active** une fois (`POST /api/pincab/activer`) et reçoit un identifiant + une **clé secrète**.
- Le pincab signe ses envois de scores et de sessions en HMAC-SHA256. Le frontend transmet automatiquement les scores correspondant aux initiales d'un profil créé dans Setup, avec mise en attente hors ligne.
- Les anciens scores restent dans D1. Une mise à niveau du schéma ajoute uniquement la table des sessions (`CREATE TABLE IF NOT EXISTS`) et ne réinitialise pas les données.
- Le téléphone n'est pas nécessaire pour publier chaque score. Le QR public du frontend ouvre le site en consultation libre; le profil joueur et les succès individuels sont affichés publiquement.
- Un QR privé du Setup connecte le profil du joueur sur son téléphone. Le joueur peut modifier son pseudo, délier un pincab ou supprimer son compte. La suppression libère le pseudo et anonymise les anciens scores sans les effacer.
- Le nom du pincab est modifiable sans toucher aux scores. Le temps de jeu affiché est total par pincab; les succès sont individuels et basés sur les scores.
- L'onglet En ligne du frontend s'affiche uniquement quand le partage est activé et le site accessible.

## Format des QR (créés par PincabOS)
`https://<adresse>/s?p=<données>&g=<signature>` et `https://<adresse>/lier?p=<données>&g=<signature>`
- données = JSON compact encodé en base64url :
  - score : `{"v":1,"pc":"<id pincab>","t":"VPX:<rom>","n":"<nom table>","sy":"VPX","sc":<score>,"i":"<initiales>","d":"<date>","u":"<id unique>"}`
  - liaison : `{"v":1,"pc":"<id pincab>","k":"lien","x":<expiration en secondes Unix>}`
- signature = base64url( HMAC-SHA256(clé secrète, données)[:16] )

## Déploiement (une seule fois)
1. Compte Cloudflare gratuit.
2. Base : `npx wrangler d1 create pincab-scores` → recopier `database_id` dans `wrangler.toml`.
3. Pour une base existante, appliquer la mise à niveau non destructive : `npx wrangler d1 execute pincab-scores --remote --file=schema.sql`. Les tables existantes et scores sont conservés; seule la table des sessions est ajoutée si elle manque.
4. Clé d'administration : `npx wrangler secret put ADMIN_CLE` (12 caractères minimum).
5. `npx wrangler deploy` → adresse `https://pincab-scores.pincab.workers.dev`

## Tests en local
```
npm install
npx wrangler d1 execute pincab-scores --local --file=schema.sql
npx wrangler dev --local          # avec un fichier .dev.vars : ADMIN_CLE="..."
python tests/scenario.py          # 28 vérifications (signatures, triche, doublons, classements...)
```

## Images
- Icônes du site : `public/images/` (reprises de `C:\pincab_os\assets`, réduites pour le téléphone), servies par Cloudflare.
- Logo de chaque table : pris dans la médiathèque GitHub `Arcadepassion/pincab_os-media-library` (`wheel/<nom de la table>.png`),
  réduit à la volée par wsrv.nl (service gratuit). Table absente de la médiathèque : logo générique. Ajouter la wheel
  dans la médiathèque suffit pour qu'elle apparaisse sur le site.

## Vérification automatique des scores
- Chaque score reçu passe des contrôles de vraisemblance (`raisonSuspect` dans `src/index.js`, seuils dans `VERIF`) :
  durée de partie (20 s à 6 h), nombre de scores par heure / par jour et par pincab, date dans le futur,
  score plus de 10 fois supérieur au meilleur score des autres pincabs sur la même table, points par seconde
  plus de 5 fois supérieurs aux autres pincabs, pincab avec déjà 3 scores en attente.
- Un score anormal n'entre pas dans les classements et ne déclenche aucune alerte : il est gardé dans la table
  `scores_suspects` (créée automatiquement) et l'administrateur l'accepte ou le refuse sur la page `/admin`.
- Le pincab affiche l'état du score (« EN VÉRIFICATION », puis « ✓ EN LIGNE » ou « REFUSÉ »).

## Langues du site
- 10 langues (les mêmes que PincabOS), français par défaut ; le choix (menu avec drapeaux dans l'en-tête) est gardé
  sur le téléphone (`localStorage`). Drapeaux : `public/images/drapeaux/*.svg`.
