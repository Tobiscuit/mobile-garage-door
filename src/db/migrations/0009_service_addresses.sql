-- Create service_addresses table for storing customer/builder job site history
-- Used by the hybrid address combobox (recent D1 sites + Google Places)
CREATE TABLE service_addresses (
  "id" TEXT PRIMARY KEY NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "users"("id"),
  "address" TEXT NOT NULL,
  "label" TEXT,
  "lastUsedAt" INTEGER,
  "useCount" INTEGER DEFAULT 1
);

CREATE INDEX "service_addresses_userId_idx" ON "service_addresses"("userId");
