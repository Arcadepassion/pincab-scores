# PincabOS Scores en ligne

Serveur du tableau des scores en ligne de PincabOS (Cloudflare Workers + base D1, gratuit).

## Principe
- Chaque pincab s'**active** une fois (`POST /api/pincab/activer`) et reçoit un identifiant + une **clé secrète**.
- Chaque score affiché en QR code est **signé** par le pincab (HMAC-SHA256, 16 octets) : un QR fait à la main est refusé.
- Un QR = un score = **un seul** enregistrement (identifiant unique `u`). Les scans suivants affichent « déjà en ligne ».
- Le joueur crée sa **carte joueur** sur son téléphone (pseudo + initiales, code de secours, pas d'e-mail),
  puis la **lie** une fois au pincab en scannant le QR « Lier une carte » (valable 10 min).
- Sur un pincab, deux cartes ne peuvent pas avoir les mêmes initiales : un score signé « DAN » ne peut être
  récupéré que par la carte DAN liée à ce pincab, **après confirmation** sur le téléphone.
- « Tous les pincabs » ne montre que les pincabs **validés** par l'administrateur (page `/admin`).

## Format des QR (créés par PincabOS)
`https://<adresse>/s?p=<données>&g=<signature>` et `https://<adresse>/lier?p=<données>&g=<signature>`
- données = JSON compact encodé en base64url :
  - score : `{"v":1,"pc":"<id pincab>","t":"VPX:<rom>","n":"<nom table>","sy":"VPX","sc":<score>,"i":"<initiales>","d":"<date>","u":"<id unique>"}`
  - liaison : `{"v":1,"pc":"<id pincab>","k":"lien","x":<expiration en secondes Unix>}`
- signature = base64url( HMAC-SHA256(clé secrète, données)[:16] )

## Déploiement (une seule fois)
1. Compte Cloudflare gratuit.
2. Base : `npx wrangler d1 create pincab-scores` → recopier `database_id` dans `wrangler.toml`.
3. Tables : `npx wrangler d1 execute pincab-scores --remote --file=schema.sql`
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
