-- Add token and expiry columns to staff_invites for secure invite flow
-- SQLite doesn't support ADD COLUMN with UNIQUE, so we add column then create index
ALTER TABLE staff_invites ADD COLUMN token TEXT;
ALTER TABLE staff_invites ADD COLUMN expires_at TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_invites_token ON staff_invites(token);
