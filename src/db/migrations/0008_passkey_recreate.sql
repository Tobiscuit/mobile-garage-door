-- Recreate passkey table with the correct Better Auth 1.5 schema.
-- The previous schema had a legacy 'webauthnUserID' column from Supabase
-- that Better Auth doesn't use, causing NOT NULL constraint failures.
-- Table is confirmed empty, so safe to drop and recreate.

DROP TABLE IF EXISTS passkey;

CREATE TABLE passkey (
  "id" TEXT PRIMARY KEY NOT NULL,
  "name" TEXT,
  "publicKey" TEXT NOT NULL,
  "userId" TEXT NOT NULL REFERENCES "users"("id"),
  "credentialID" TEXT NOT NULL,
  "counter" INTEGER NOT NULL,
  "deviceType" TEXT NOT NULL,
  "backedUp" INTEGER NOT NULL,
  "transports" TEXT,
  "createdAt" INTEGER,
  "aaguid" TEXT
);

CREATE INDEX "passkey_userId_idx" ON "passkey"("userId");
CREATE INDEX "passkey_credentialID_idx" ON "passkey"("credentialID");
