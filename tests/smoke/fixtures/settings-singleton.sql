-- Production always has the singleton settings row (id = 1) before migration
-- 0005_seed_settings.sql runs: that migration inserts setting_stats and
-- setting_values rows referencing settings(id = 1). On an empty local database
-- the row is missing, the foreign key fails, and every later migration -
-- including 0011_blog_pipeline - is silently skipped. Recreating the
-- precondition here, rather than editing 0005, keeps migration history identical
-- to what production applied.
INSERT OR IGNORE INTO settings (id, updated_at) VALUES (1, '2026-01-01T00:00:00.000Z');
