-- PincabOS Scores en ligne : base de données (Cloudflare D1)
CREATE TABLE IF NOT EXISTS pincabs (
  id TEXT PRIMARY KEY,                 -- identifiant public du pincab
  nom TEXT NOT NULL,                   -- nom affiché (« Pincab de Daniel »)
  secret TEXT NOT NULL,                -- clé de signature (connue du pincab et du serveur seulement)
  cree TEXT NOT NULL,
  approuve INTEGER NOT NULL DEFAULT 0, -- 1 = visible dans « Tous les pincabs » (validé par l'administrateur)
  bloque INTEGER NOT NULL DEFAULT 0,   -- 1 = plus aucun score accepté
  ip TEXT
);
CREATE TABLE IF NOT EXISTS cartes (
  id TEXT PRIMARY KEY,
  pseudo TEXT NOT NULL,
  initiales TEXT NOT NULL,
  jeton_hash TEXT NOT NULL UNIQUE,     -- empreinte du code de la carte (le code lui-même n'est jamais stocké)
  cree TEXT NOT NULL,
  ip TEXT
);
CREATE TABLE IF NOT EXISTS liens (     -- carte liée à un pincab, initiales uniques par pincab
  carte_id TEXT NOT NULL,
  pincab_id TEXT NOT NULL,
  initiales TEXT NOT NULL,
  cree TEXT NOT NULL,
  PRIMARY KEY (carte_id, pincab_id),
  UNIQUE (pincab_id, initiales)
);
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,                 -- identifiant unique du QR : un score ne compte qu'une fois
  pincab_id TEXT NOT NULL,
  carte_id TEXT NOT NULL,
  table_cle TEXT NOT NULL,             -- « VPX:afm_113b », « PBFX:12 »...
  table_nom TEXT NOT NULL,
  systeme TEXT NOT NULL,
  score INTEGER NOT NULL,
  initiales TEXT NOT NULL,
  date_partie TEXT NOT NULL,
  ajoute TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_scores_table ON scores (table_cle, score DESC);
CREATE INDEX IF NOT EXISTS idx_scores_carte ON scores (carte_id, ajoute DESC);
CREATE INDEX IF NOT EXISTS idx_scores_ajoute ON scores (ajoute DESC);
CREATE INDEX IF NOT EXISTS idx_pincabs_ip ON pincabs (ip, cree);

-- Durée de jeu agrégée par pincab. Les identifiants rendent l'envoi idempotent après une coupure réseau.
CREATE TABLE IF NOT EXISTS sessions_pincab (
  id TEXT PRIMARY KEY,
  pincab_id TEXT NOT NULL,
  duree INTEGER NOT NULL,
  table_nom TEXT NOT NULL DEFAULT '',
  fin TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_pincab ON sessions_pincab (pincab_id, fin DESC);
