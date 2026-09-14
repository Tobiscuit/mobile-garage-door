-- Synthetic public-site content shaped like production's, so the smoke suite
-- renders the data-driven branches of the public pages instead of their empty
-- states: three services (one in the 'Critical Response' category, and the
-- 'contractor-portal' and 'installations' slugs the landing page branches on)
-- with features, two featured testimonials, and one portfolio project with a
-- gallery image and tags. Every value is an obvious sample. No real customer,
-- review, project or business content lives in this public repository.
INSERT OR REPLACE INTO services (id, title, slug, category, price, description, icon, highlight, "order", created_at, updated_at)
VALUES
  (9101, 'Sample Repair Service', 'sample-repair-service', 'Critical Response', NULL,
   'Sample description of a repair service, used by the smoke suite.', 'lightning', 0, 1,
   '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  (9102, 'Sample Contractor Service', 'contractor-portal', 'Commercial', NULL,
   'Sample description of a contractor service, used by the smoke suite.', 'building', 1, 2,
   '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  (9103, 'Sample Installation Service', 'installations', 'Design', NULL,
   'Sample description of an installation service, used by the smoke suite.', 'clipboard', 0, 3,
   '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');

INSERT OR REPLACE INTO service_features (id, service_id, feature, "order")
VALUES
  (9111, 9101, 'Sample repair feature one', 1),
  (9112, 9101, 'Sample repair feature two', 2),
  (9113, 9101, 'Sample repair feature three', 3),
  (9121, 9102, 'Sample contractor feature one', 1),
  (9122, 9102, 'Sample contractor feature two', 2),
  (9131, 9103, 'Sample installation feature one', 1),
  (9132, 9103, 'Sample installation feature two', 2);

INSERT OR REPLACE INTO testimonials (id, quote, author, location, rating, featured, created_at, updated_at)
VALUES
  (9201, 'Sample testimonial text used by the smoke suite.', 'Sample Customer', 'Sample Location', 5, 1,
   '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'),
  (9202, 'Second sample testimonial text used by the smoke suite.', 'Sample Builder', 'Sample Location', 5, 1,
   '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');

INSERT OR REPLACE INTO media (id, filename, mime_type, filesize, width, height, alt, url, created_at, updated_at)
VALUES (9301, 'smoke-fixture-project.webp', 'image/webp', 1024, 1200, 900,
        'Synthetic smoke-test project image', '/api/media/blog/smoke-fixture-project.webp',
        '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');

INSERT OR REPLACE INTO projects (id, title, slug, client, location, completion_date, description, html_description,
                                 html_challenge, html_solution, created_at, updated_at)
VALUES (9401, 'Sample Project', 'sample-project', 'Sample Client', 'Sample Location', '2026-01-01',
        NULL, '<p>Sample project description used by the smoke suite.</p>',
        '<p>Sample challenge text.</p>', '<p>Sample solution text.</p>',
        '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z');

INSERT OR REPLACE INTO project_gallery (id, project_id, media_id, caption, "order")
VALUES (9411, 9401, 9301, NULL, 0);

INSERT OR REPLACE INTO project_tags (id, project_id, tag)
VALUES (9421, 9401, 'Sample tag');

-- The dashboard's licence, insurance and BBB settings, filled with sentinels.
-- Tobias confirmed those claims aren't real (2026-09-14), but the dashboard can
-- still store any value in these fields, so the suite checks that no public page
-- renders them, whatever they hold.
UPDATE settings
SET license_number = 'SMOKE-SENTINEL-LICENSE-NUMBER',
    insurance_amount = 'SMOKE-SENTINEL-INSURANCE-AMOUNT',
    bbb_rating = 'SMOKE-SENTINEL-BBB-RATING'
WHERE id = 1;
