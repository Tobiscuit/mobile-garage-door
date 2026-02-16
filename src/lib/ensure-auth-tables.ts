import { Pool } from 'pg';

const dbUri = process.env.DATABASE_URI;
const useMemoryAuth = process.env.BETTER_AUTH_USE_MEMORY === 'true';

export const ensureAuthTablesReady: Promise<void> = (async () => {
  if (useMemoryAuth) return;
  if (!dbUri) return;

  const pool = new Pool({ connectionString: dbUri });
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" varchar PRIMARY KEY NOT NULL,
        "name" varchar NOT NULL,
        "email" varchar NOT NULL,
        "emailVerified" boolean DEFAULT false NOT NULL,
        "image" varchar,
        "role" varchar,
        "customerType" varchar,
        "companyName" varchar,
        "createdAt" timestamp(3) with time zone NOT NULL,
        "updatedAt" timestamp(3) with time zone NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "user_email_idx" ON "user" USING btree ("email");

      CREATE TABLE IF NOT EXISTS "session" (
        "id" varchar PRIMARY KEY NOT NULL,
        "userId" varchar NOT NULL,
        "token" varchar NOT NULL,
        "expiresAt" timestamp(3) with time zone NOT NULL,
        "ipAddress" varchar,
        "userAgent" varchar,
        "createdAt" timestamp(3) with time zone NOT NULL,
        "updatedAt" timestamp(3) with time zone NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "session_token_idx" ON "session" USING btree ("token");
      CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" USING btree ("userId");
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'session_user_id_fk') THEN
          ALTER TABLE "session" ADD CONSTRAINT "session_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS "account" (
        "id" varchar PRIMARY KEY NOT NULL,
        "accountId" varchar NOT NULL,
        "providerId" varchar NOT NULL,
        "userId" varchar NOT NULL,
        "accessToken" varchar,
        "refreshToken" varchar,
        "idToken" varchar,
        "accessTokenExpiresAt" timestamp(3) with time zone,
        "refreshTokenExpiresAt" timestamp(3) with time zone,
        "scope" varchar,
        "password" varchar,
        "createdAt" timestamp(3) with time zone NOT NULL,
        "updatedAt" timestamp(3) with time zone NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" USING btree ("userId");
      CREATE INDEX IF NOT EXISTS "account_account_id_idx" ON "account" USING btree ("accountId");
      CREATE INDEX IF NOT EXISTS "account_provider_id_idx" ON "account" USING btree ("providerId");
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'account_user_id_fk') THEN
          ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS "verification" (
        "id" varchar PRIMARY KEY NOT NULL,
        "identifier" varchar NOT NULL,
        "value" varchar NOT NULL,
        "expiresAt" timestamp(3) with time zone NOT NULL,
        "createdAt" timestamp(3) with time zone NOT NULL,
        "updatedAt" timestamp(3) with time zone NOT NULL
      );
      CREATE INDEX IF NOT EXISTS "verification_identifier_idx" ON "verification" USING btree ("identifier");

      CREATE TABLE IF NOT EXISTS "passkey" (
        "id" varchar PRIMARY KEY NOT NULL,
        "name" varchar,
        "publicKey" text NOT NULL,
        "userId" varchar NOT NULL,
        "credentialID" varchar NOT NULL,
        "counter" integer NOT NULL,
        "deviceType" varchar NOT NULL,
        "backedUp" boolean NOT NULL,
        "transports" varchar,
        "aaguid" varchar,
        "createdAt" timestamp(3) with time zone NOT NULL,
        "updatedAt" timestamp(3) with time zone NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS "passkey_credential_id_idx" ON "passkey" USING btree ("credentialID");
      CREATE INDEX IF NOT EXISTS "passkey_user_id_idx" ON "passkey" USING btree ("userId");
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'passkey_user_id_fk') THEN
          ALTER TABLE "passkey" ADD CONSTRAINT "passkey_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `);
  } finally {
    await pool.end();
  }
})();

