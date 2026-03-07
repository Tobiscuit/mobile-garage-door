-- Better Auth 1.5 passkey plugin also needs an aaguid column
-- (Authenticator Attestation GUID - identifies the authenticator model)
ALTER TABLE passkey ADD COLUMN "aaguid" TEXT;
