-- Add customer coordinates for tracking ETA calculations
ALTER TABLE service_requests ADD COLUMN customer_lat REAL;
ALTER TABLE service_requests ADD COLUMN customer_lng REAL;
