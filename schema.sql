CREATE TABLE IF NOT EXISTS leaderboard (
  handle TEXT PRIMARY KEY,
  club TEXT NOT NULL DEFAULT 'PINE MUNI COURSE',
  share_pct REAL NOT NULL DEFAULT 0.0,
  rounds INTEGER NOT NULL DEFAULT 0,
  tier INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO leaderboard (handle, club, share_pct, rounds, tier, updated_at) VALUES
  ('VEX_STORN88', 'REGENTS SANCTUARY', 19.2, 134, 5, datetime('now')),
  ('BRAM_GALT14', 'BLUFF RESERVE', 18.4, 112, 4, datetime('now')),
  ('TOV_TRASK49', 'BLACK DIRT CLUB', 16.8, 91, 3, datetime('now')),
  ('KIP_KOVEL77', 'STEWARDSHIP LINKS', 15.5, 78, 2, datetime('now')),
  ('ZAN_PELL21', 'STEWARDSHIP LINKS', 14.1, 64, 2, datetime('now')),
  ('HAL_MORNS33', 'PINE MUNI COURSE', 11.6, 42, 1, datetime('now')),
  ('DEX_BREN19', 'PINE MUNI COURSE', 9.4, 31, 1, datetime('now'));
