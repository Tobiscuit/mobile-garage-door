-- Tracking events table for tech location audit trail + milestone dedup
CREATE TABLE IF NOT EXISTS tracking_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_request_id INTEGER NOT NULL REFERENCES service_requests(id),
  tech_id TEXT NOT NULL REFERENCES users(id),
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  accuracy REAL,
  fuzzy_radius REAL,
  milestone TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_tracking_events_request
  ON tracking_events(service_request_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tracking_events_milestone
  ON tracking_events(service_request_id, milestone);
