CREATE TABLE IF NOT EXISTS leaderboard (
  handle TEXT PRIMARY KEY,
  club TEXT NOT NULL DEFAULT 'Pine Rest Muni',
  share_pct REAL NOT NULL DEFAULT 0.0,
  rounds INTEGER NOT NULL DEFAULT 0,
  tier INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO leaderboard (handle, club, share_pct, rounds, tier, updated_at) VALUES
  ('REGENT_CHAIR', 'The Regents'' Sanctuary', 19.4, 142, 5, datetime('now')),
  ('DUNE_CREST_III', 'Dune Crest Private Reserve', 18.7, 118, 4, datetime('now')),
  ('DIRT_KING_49', 'Black Dirt Acres CC', 17.2, 96, 3, datetime('now')),
  ('GRACE_CAP_77', 'Covenant Meadows Links', 16.5, 84, 2, datetime('now')),
  ('SOV_COVENANT', 'Covenant Meadows Links', 15.1, 71, 2, datetime('now')),
  ('VAN_DYKE_ENT', 'Covenant Meadows Links', 13.8, 63, 2, datetime('now')),
  ('D_VANDER84', 'Pine Rest Muni', 11.4, 44, 1, datetime('now')),
  ('KOOP_DOG', 'Pine Rest Muni', 9.2, 39, 1, datetime('now'));
