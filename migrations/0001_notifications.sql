CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint TEXT PRIMARY KEY,
  carte_id TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created TEXT NOT NULL,
  updated TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_carte ON push_subscriptions (carte_id);

CREATE TABLE IF NOT EXISTS score_notifications (
  score_id TEXT PRIMARY KEY,
  carte_id TEXT NOT NULL,
  pincab_id TEXT NOT NULL,
  table_cle TEXT NOT NULL,
  table_nom TEXT NOT NULL,
  systeme TEXT NOT NULL,
  score INTEGER NOT NULL,
  initiales TEXT NOT NULL DEFAULT '',
  place INTEGER NOT NULL,
  cree_ms INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_score_notifications_cree ON score_notifications (cree_ms);
