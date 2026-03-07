-- Seed settings with About page content
-- Mission statement, brand voice, and other fields that are currently empty
UPDATE settings SET
  mission_statement = 'To provide fast, honest, and expert garage door service to every homeowner and contractor in our community—ensuring no one is ever left stranded with a broken door.',
  brand_voice = 'Professional yet approachable. We speak like experienced technicians who genuinely care about homeowners. Direct, no-nonsense language with warmth. Use "we" and "our team" to convey reliability. Avoid corporate jargon—sound like a trusted neighbor who happens to be an expert.',
  brand_tone = 'Confident and reassuring. Customers are often stressed (broken door, security concern). Our tone should make them feel safe and in good hands. Authoritative on technical matters, empathetic on service.',
  brand_avoid = 'Cheap, discount, budget, low-cost, no-frills, DIY. Avoid fear-mongering language. Never say "just a garage door" — we treat every job as important. Avoid overly salesy phrases like "act now" or "limited time".',
  updated_at = datetime('now')
WHERE id = 1;

-- Seed company stats (About page stats bar)
INSERT INTO setting_stats (setting_id, label, value) VALUES
  (1, 'Years in Business', '10+'),
  (1, 'Doors Installed', '5,000+'),
  (1, 'Happy Customers', '3,500+'),
  (1, 'Service Areas', '12');

-- Seed core values (About page values section)
INSERT INTO setting_values (setting_id, title, description) VALUES
  (1, 'Honesty First', 'We diagnose the real problem—not the most expensive one. If a spring adjustment fixes it, we won''t sell you a new door.'),
  (1, 'Speed Without Shortcuts', 'Same-day service is our standard, not our exception. But fast never means sloppy—we obsess over the install details you''ll never see.'),
  (1, 'Built to Last', 'We use commercial-grade hardware on residential jobs because your family''s safety isn''t where we cut costs. Every install comes with our ironclad warranty.'),
  (1, 'Community Roots', 'We live in the neighborhoods we serve. Our reputation isn''t built on ads—it''s built on the referrals of families who trust us with their homes.');
