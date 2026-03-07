-- Better Auth 1.5 passkey plugin requires a credentialID column
-- The passkey table was created without it during the Supabase → D1 migration
ALTER TABLE passkey ADD COLUMN "credentialID" TEXT NOT NULL DEFAULT '';
