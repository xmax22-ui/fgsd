/* ============================================================
   «Поехали» — схема базы данных (SQLite)
   База создаётся автоматически при первом запуске server.cjs.
   ============================================================ */

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA busy_timeout = 5000;

CREATE TABLE IF NOT EXISTS destinations (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  country       TEXT NOT NULL DEFAULT '',
  region        TEXT NOT NULL DEFAULT '',
  tagline       TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  gradient      TEXT NOT NULL DEFAULT '[]',
  tags          TEXT NOT NULL DEFAULT '[]',
  stats         TEXT NOT NULL DEFAULT '{}',
  lat           REAL,
  lon           REAL,
  iata          TEXT,
  hotel_query   TEXT NOT NULL DEFAULT '',
  wiki          TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS routes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  icon           TEXT NOT NULL DEFAULT '',
  title          TEXT NOT NULL DEFAULT '',
  from_city      TEXT NOT NULL DEFAULT '',
  duration       TEXT NOT NULL DEFAULT '',
  distance       TEXT NOT NULL DEFAULT '',
  price          TEXT NOT NULL DEFAULT '',
  note           TEXT NOT NULL DEFAULT '',
  recommended    INTEGER NOT NULL DEFAULT 0,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS hotels (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  stars          INTEGER NOT NULL DEFAULT 0,
  rating         REAL NOT NULL DEFAULT 0,
  price          INTEGER NOT NULL DEFAULT 0,
  district       TEXT NOT NULL DEFAULT '',
  features       TEXT NOT NULL DEFAULT '[]',
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS agencies (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  rating         REAL NOT NULL DEFAULT 0,
  tours_from     INTEGER NOT NULL DEFAULT 0,
  phone          TEXT NOT NULL DEFAULT '',
  spec           TEXT NOT NULL DEFAULT '',
  site           TEXT NOT NULL DEFAULT '',
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS flights (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  from_city      TEXT NOT NULL DEFAULT '',
  airline        TEXT NOT NULL DEFAULT '',
  number         TEXT NOT NULL DEFAULT '',
  dep            TEXT NOT NULL DEFAULT '',
  arr            TEXT NOT NULL DEFAULT '',
  econ           INTEGER NOT NULL DEFAULT 0,
  biz            INTEGER,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS trains (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  number         TEXT NOT NULL DEFAULT '',
  from_city      TEXT NOT NULL DEFAULT '',
  dep            TEXT NOT NULL DEFAULT '',
  arr            TEXT NOT NULL DEFAULT '',
  classes        TEXT NOT NULL DEFAULT '{}',
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS attractions (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tips (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  text           TEXT NOT NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS clients (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_seen  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS favorites (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id      TEXT NOT NULL,
  destination_id TEXT NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  hotel_name     TEXT NOT NULL,
  hotel_price    INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (client_id, destination_id, hotel_name)
);

CREATE TABLE IF NOT EXISTS requests (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id  TEXT NOT NULL,
  service    TEXT NOT NULL,
  route_text TEXT NOT NULL,
  user_name  TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  token      TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_favorites_client ON favorites(client_id);
CREATE INDEX IF NOT EXISTS idx_favorites_destination ON favorites(destination_id);
CREATE INDEX IF NOT EXISTS idx_requests_client ON requests(client_id);
CREATE INDEX IF NOT EXISTS idx_requests_created ON requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_routes_destination ON routes(destination_id);
CREATE INDEX IF NOT EXISTS idx_hotels_destination ON hotels(destination_id);
CREATE INDEX IF NOT EXISTS idx_agencies_destination ON agencies(destination_id);
CREATE INDEX IF NOT EXISTS idx_flights_destination ON flights(destination_id);
CREATE INDEX IF NOT EXISTS idx_trains_destination ON trains(destination_id);
CREATE INDEX IF NOT EXISTS idx_attractions_destination ON attractions(destination_id);
CREATE INDEX IF NOT EXISTS idx_tips_destination ON tips(destination_id);

INSERT OR IGNORE INTO settings (key, value) VALUES ('price_k', '1');
INSERT OR IGNORE INTO settings (key, value) VALUES ('schema_version', '1');
