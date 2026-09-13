-- Synthetic blog fixture shaped like production's published posts: every one
-- has a featured image served from /api/media/blog/, alt text, html_content
-- (content is NULL), a category, and an ISO-8601 published_at. The featured
-- image is what matters - it is the branch that renders next/image. No real post
-- content lives in this public repository.
INSERT OR REPLACE INTO media (id, filename, mime_type, filesize, width, height, alt, url, created_at, updated_at)
VALUES (9001, 'smoke-fixture-cover.webp', 'image/webp', 1024, 1200, 630,
        'Synthetic smoke-test cover image', '/api/media/blog/smoke-fixture-cover.webp',
        '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');
INSERT OR REPLACE INTO posts (id, title, slug, excerpt, content, html_content, featured_image_id, category,
                              published_at, status, created_at, updated_at, ai_generated, ai_topic_source)
VALUES (9001, 'Smoke Fixture Post With A Featured Image', 'smoke-fixture-post-with-featured-image',
        'Synthetic excerpt used by the smoke suite.', NULL, '<p>Synthetic body used by the smoke suite.</p>',
        9001, 'smoke-fixture', '2026-01-01T00:00:00.000Z', 'published',
        '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z', 0, NULL);
