-- In-app notification feed for admin dashboard
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,          -- 'blog_draft' | 'tech_dispatched' | 'job_accepted' | 'tracking_update'
    title TEXT NOT NULL,
    body TEXT,
    action_url TEXT,             -- deep link e.g. /dashboard/posts/42
    read INTEGER DEFAULT 0,     -- boolean: 0 = unread, 1 = read
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
