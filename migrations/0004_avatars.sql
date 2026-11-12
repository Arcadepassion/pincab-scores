-- Images de profil des joueurs (choisies dans le Setup du pincab ou sur la page « Ma carte » du téléphone)
-- (créée aussi automatiquement par le site au premier besoin)
CREATE TABLE IF NOT EXISTS avatars (
  carte_id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  image BLOB NOT NULL,
  version TEXT NOT NULL,
  maj TEXT NOT NULL
);
