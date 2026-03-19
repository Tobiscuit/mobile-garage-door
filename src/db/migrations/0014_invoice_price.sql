-- Add quoted_price to service_requests for admin to set the repair cost
ALTER TABLE service_requests ADD COLUMN quoted_price INTEGER;
-- Amount in cents, e.g. 35000 = $350.00
