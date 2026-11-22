-- NOUVEAU : profil existant ajouté à un autre système (QR « Ajouter un profil existant » du Setup / Frontend /
-- page web). Chaque système reçoit sa propre clé : seule son empreinte est gardée, dans liens.jeton_hash.
-- « Délier » (téléphone) ou « Retirer de ce pincab » (Setup) efface le lien, donc la clé.
-- (fait aussi automatiquement par le site au premier besoin : assurerImports)
ALTER TABLE liens ADD COLUMN jeton_hash TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS liens_jeton ON liens (jeton_hash);
-- clé en attente que le système la récupère (une seule fois ; effacée au bout de 15 minutes)
CREATE TABLE IF NOT EXISTS imports_attente (
  pincab_id TEXT NOT NULL,
  demande TEXT NOT NULL,
  carte_id TEXT NOT NULL,
  code TEXT NOT NULL,
  cree_ms INTEGER NOT NULL,
  PRIMARY KEY (pincab_id, demande)
);
