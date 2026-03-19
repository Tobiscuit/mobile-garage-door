-- Add AI pipeline columns to posts table
-- status already exists as TEXT, D1/SQLite doesn't enforce enum values
-- so 'pending_review' will work alongside 'draft' and 'published'
ALTER TABLE posts ADD COLUMN ai_generated INTEGER DEFAULT 0;
ALTER TABLE posts ADD COLUMN ai_topic_source TEXT; -- 'ai_ideation' | 'admin_queue' | null (manual)

-- Self-managing topic queue table
-- Cron pops oldest unused topic; used topics stay as a log
CREATE TABLE IF NOT EXISTS topic_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic TEXT NOT NULL,
    used_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
