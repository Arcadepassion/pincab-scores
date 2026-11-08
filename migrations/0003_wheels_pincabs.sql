-- Wheels envoyées par les pincabs pour les tables absentes de la médiathèque GitHub
-- (créée aussi automatiquement par le site au premier besoin)
CREATE TABLE IF NOT EXISTS wheels_pincabs (
  nom_norm TEXT PRIMARY KEY,
  nom TEXT NOT NULL,
  type TEXT NOT NULL,
  image BLOB NOT NULL,
  pincab_id TEXT NOT NULL,
  ajoute TEXT NOT NULL
);
