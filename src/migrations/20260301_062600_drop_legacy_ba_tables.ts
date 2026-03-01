import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Drop the legacy Better Auth tables (singular, camelCase, varchar IDs) and
 * create the payload-auth managed tables (pluralized, snake_case, serial IDs).
 *
 * Old tables dropped: user, session, account, verification, passkey
 * New tables created: sessions, accounts, verifications, passkeys, admin_invitations
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  // 1. Drop old singular Better Auth tables
  await db.execute(sql`
    DROP TABLE IF EXISTS "passkey" CASCADE;
    DROP TABLE IF EXISTS "verification" CASCADE;
    DROP TABLE IF EXISTS "account" CASCADE;
    DROP TABLE IF EXISTS "session" CASCADE;
    DROP TABLE IF EXISTS "user" CASCADE;
  `)

  // 2. Create sessions
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "sessions" (
      "id" serial PRIMARY KEY NOT NULL,
      "expires_at" timestamp(3) with time zone NOT NULL,
      "token" varchar NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "ip_address" varchar,
      "user_agent" varchar,
      "user_id" integer NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "sessions_token_idx" ON "sessions" USING btree ("token");
    CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "sessions" USING btree ("user_id");
    CREATE INDEX IF NOT EXISTS "sessions_updated_at_idx" ON "sessions" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "sessions_created_at_idx" ON "sessions" USING btree ("created_at");

    ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // 3. Create accounts
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "accounts" (
      "id" serial PRIMARY KEY NOT NULL,
      "account_id" varchar NOT NULL,
      "provider_id" varchar NOT NULL,
      "user_id" integer NOT NULL,
      "access_token" varchar,
      "refresh_token" varchar,
      "id_token" varchar,
      "access_token_expires_at" timestamp(3) with time zone,
      "refresh_token_expires_at" timestamp(3) with time zone,
      "scope" varchar,
      "password" varchar,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "accounts_account_id_idx" ON "accounts" USING btree ("account_id");
    CREATE INDEX IF NOT EXISTS "accounts_provider_id_idx" ON "accounts" USING btree ("provider_id");
    CREATE INDEX IF NOT EXISTS "accounts_user_idx" ON "accounts" USING btree ("user_id");
    CREATE INDEX IF NOT EXISTS "accounts_updated_at_idx" ON "accounts" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "accounts_created_at_idx" ON "accounts" USING btree ("created_at");

    ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // 4. Create verifications
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "verifications" (
      "id" serial PRIMARY KEY NOT NULL,
      "identifier" varchar NOT NULL,
      "value" varchar NOT NULL,
      "expires_at" timestamp(3) with time zone NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "verifications_identifier_idx" ON "verifications" USING btree ("identifier");
    CREATE INDEX IF NOT EXISTS "verifications_updated_at_idx" ON "verifications" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "verifications_created_at_idx" ON "verifications" USING btree ("created_at");
  `)

  // 5. Create passkeys
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "passkeys" (
      "id" serial PRIMARY KEY NOT NULL,
      "name" varchar,
      "public_key" text NOT NULL,
      "user_id" integer NOT NULL,
      "credential_id" varchar NOT NULL,
      "counter" integer NOT NULL,
      "device_type" varchar NOT NULL,
      "backed_up" boolean NOT NULL,
      "transports" varchar,
      "aaguid" varchar,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS "passkeys_credential_id_idx" ON "passkeys" USING btree ("credential_id");
    CREATE INDEX IF NOT EXISTS "passkeys_user_idx" ON "passkeys" USING btree ("user_id");
    CREATE INDEX IF NOT EXISTS "passkeys_updated_at_idx" ON "passkeys" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "passkeys_created_at_idx" ON "passkeys" USING btree ("created_at");

    ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_user_id_users_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  `)

  // 6. Create admin_invitations (payload-auth collection)
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "admin_invitations" (
      "id" serial PRIMARY KEY NOT NULL,
      "role" varchar NOT NULL,
      "token" varchar NOT NULL,
      "url" varchar,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );

    CREATE INDEX IF NOT EXISTS "admin_invitations_updated_at_idx" ON "admin_invitations" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "admin_invitations_created_at_idx" ON "admin_invitations" USING btree ("created_at");
  `)

  // 7. Ensure users table has Better Auth columns (payload-auth adds these)
  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified" boolean DEFAULT false NOT NULL;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "image" varchar;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "admin_invitations" CASCADE;
    DROP TABLE IF EXISTS "passkeys" CASCADE;
    DROP TABLE IF EXISTS "verifications" CASCADE;
    DROP TABLE IF EXISTS "accounts" CASCADE;
    DROP TABLE IF EXISTS "sessions" CASCADE;
    ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "image";
  `)
}
