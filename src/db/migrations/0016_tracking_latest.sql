-- Latest tracking state (replaces KV for tracking payload)
-- Uses INSERT OR REPLACE for upsert semantics (one row per service request)
CREATE TABLE IF NOT EXISTS tracking_latest (
  service_request_id INTEGER PRIMARY KEY REFERENCES service_requests(id),
  center_lat REAL NOT NULL,
  center_lng REAL NOT NULL,
  radius REAL NOT NULL,
  status TEXT NOT NULL,
  eta_minutes REAL,
  tech_name TEXT,
  customer_lat REAL,
  customer_lng REAL,
  customer_id TEXT,
  last_update TEXT NOT NULL DEFAULT (datetime('now'))
);
