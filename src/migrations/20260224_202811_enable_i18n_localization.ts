import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Step 1: Create the _locales enum if it doesn't exist
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."_locales" AS ENUM('en', 'es');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // Step 2: Create locale tables if they don't exist

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "services_locales" (
      "title" varchar NOT NULL,
      "category" varchar NOT NULL,
      "description" varchar NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "projects_locales" (
      "title" varchar NOT NULL,
      "client" varchar NOT NULL,
      "description" jsonb NOT NULL,
      "challenge" jsonb NOT NULL,
      "solution" jsonb NOT NULL,
      "html_description" varchar,
      "html_challenge" varchar,
      "html_solution" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "testimonials_locales" (
      "quote" varchar NOT NULL,
      "location" varchar NOT NULL,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts_locales" (
      "title" varchar NOT NULL,
      "excerpt" varchar,
      "content" jsonb,
      "html_content" varchar,
      "id" serial PRIMARY KEY NOT NULL,
      "_locale" "_locales" NOT NULL,
      "_parent_id" integer NOT NULL
    );
  `)

  // Step 3: Add _locale column to array tables if it doesn't exist
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "services_features" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "projects_stats" ADD COLUMN "_locale" "_locales" NOT NULL DEFAULT 'en';
    EXCEPTION
      WHEN duplicate_column THEN null;
    END $$;
  `)

  // Step 4: Add foreign keys and indexes (idempotent with IF NOT EXISTS)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "services_locales" ADD CONSTRAINT "services_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "projects_locales" ADD CONSTRAINT "projects_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "testimonials_locales" ADD CONSTRAINT "testimonials_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."testimonials"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "posts_locales" ADD CONSTRAINT "posts_locales_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "services_locales_locale_parent_id_unique" ON "services_locales" USING btree ("_locale","_parent_id");`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "projects_locales_locale_parent_id_unique" ON "projects_locales" USING btree ("_locale","_parent_id");`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "testimonials_locales_locale_parent_id_unique" ON "testimonials_locales" USING btree ("_locale","_parent_id");`)
  await db.execute(sql`CREATE UNIQUE INDEX IF NOT EXISTS "posts_locales_locale_parent_id_unique" ON "posts_locales" USING btree ("_locale","_parent_id");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "services_features_locale_idx" ON "services_features" USING btree ("_locale");`)
  await db.execute(sql`CREATE INDEX IF NOT EXISTS "projects_stats_locale_idx" ON "projects_stats" USING btree ("_locale");`)

  // Step 5: SAFELY COPY existing data from main tables into _locales tables (as 'en' locale)
  // Only insert if the _locales table is empty (idempotent)

  await db.execute(sql`
    INSERT INTO "services_locales" ("title", "category", "description", "_locale", "_parent_id")
    SELECT s."title", s."category", s."description", 'en', s."id"
    FROM "services" s
    WHERE s."title" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "services_locales" sl WHERE sl."_parent_id" = s."id" AND sl."_locale" = 'en');
  `)

  await db.execute(sql`
    INSERT INTO "projects_locales" ("title", "client", "description", "challenge", "solution", "html_description", "html_challenge", "html_solution", "_locale", "_parent_id")
    SELECT p."title", p."client", p."description", p."challenge", p."solution", p."html_description", p."html_challenge", p."html_solution", 'en', p."id"
    FROM "projects" p
    WHERE p."title" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "projects_locales" pl WHERE pl."_parent_id" = p."id" AND pl."_locale" = 'en');
  `)

  await db.execute(sql`
    INSERT INTO "testimonials_locales" ("quote", "location", "_locale", "_parent_id")
    SELECT t."quote", t."location", 'en', t."id"
    FROM "testimonials" t
    WHERE t."quote" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "testimonials_locales" tl WHERE tl."_parent_id" = t."id" AND tl."_locale" = 'en');
  `)

  await db.execute(sql`
    INSERT INTO "posts_locales" ("title", "excerpt", "content", "html_content", "_locale", "_parent_id")
    SELECT p."title", p."excerpt", p."content", p."html_content", 'en', p."id"
    FROM "posts" p
    WHERE p."title" IS NOT NULL
      AND NOT EXISTS (SELECT 1 FROM "posts_locales" pl WHERE pl."_parent_id" = p."id" AND pl."_locale" = 'en');
  `)

  // Step 6: NOW safe to drop old columns (data has been copied)
  await db.execute(sql`
    ALTER TABLE "services" DROP COLUMN IF EXISTS "title";
    ALTER TABLE "services" DROP COLUMN IF EXISTS "category";
    ALTER TABLE "services" DROP COLUMN IF EXISTS "description";

    ALTER TABLE "projects" DROP COLUMN IF EXISTS "title";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "client";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "description";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "challenge";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "solution";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "html_description";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "html_challenge";
    ALTER TABLE "projects" DROP COLUMN IF EXISTS "html_solution";

    ALTER TABLE "testimonials" DROP COLUMN IF EXISTS "quote";
    ALTER TABLE "testimonials" DROP COLUMN IF EXISTS "location";

    ALTER TABLE "posts" DROP COLUMN IF EXISTS "title";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "excerpt";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "content";
    ALTER TABLE "posts" DROP COLUMN IF EXISTS "html_content";
  `)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Reverse: add columns back, copy data from locales, drop locale tables
  await db.execute(sql`
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "title" varchar;
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "category" varchar;
    ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "description" varchar;

    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "title" varchar;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "client" varchar;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "description" jsonb;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "challenge" jsonb;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "solution" jsonb;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "html_description" varchar;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "html_challenge" varchar;
    ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "html_solution" varchar;

    ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "quote" varchar;
    ALTER TABLE "testimonials" ADD COLUMN IF NOT EXISTS "location" varchar;

    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "title" varchar;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "excerpt" varchar;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "content" jsonb;
    ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "html_content" varchar;
  `)

  // Copy English data back to main tables
  await db.execute(sql`
    UPDATE "services" s SET
      "title" = sl."title", "category" = sl."category", "description" = sl."description"
    FROM "services_locales" sl WHERE sl."_parent_id" = s."id" AND sl."_locale" = 'en';

    UPDATE "projects" p SET
      "title" = pl."title", "client" = pl."client", "description" = pl."description",
      "challenge" = pl."challenge", "solution" = pl."solution",
      "html_description" = pl."html_description", "html_challenge" = pl."html_challenge", "html_solution" = pl."html_solution"
    FROM "projects_locales" pl WHERE pl."_parent_id" = p."id" AND pl."_locale" = 'en';

    UPDATE "testimonials" t SET "quote" = tl."quote", "location" = tl."location"
    FROM "testimonials_locales" tl WHERE tl."_parent_id" = t."id" AND tl."_locale" = 'en';

    UPDATE "posts" p SET "title" = pl."title", "excerpt" = pl."excerpt", "content" = pl."content", "html_content" = pl."html_content"
    FROM "posts_locales" pl WHERE pl."_parent_id" = p."id" AND pl."_locale" = 'en';
  `)

  await db.execute(sql`
    ALTER TABLE "services_locales" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "projects_locales" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "testimonials_locales" DISABLE ROW LEVEL SECURITY;
    ALTER TABLE "posts_locales" DISABLE ROW LEVEL SECURITY;
    DROP TABLE "services_locales" CASCADE;
    DROP TABLE "projects_locales" CASCADE;
    DROP TABLE "testimonials_locales" CASCADE;
    DROP TABLE "posts_locales" CASCADE;
    DROP INDEX IF EXISTS "services_features_locale_idx";
    DROP INDEX IF EXISTS "projects_stats_locale_idx";
    ALTER TABLE "services_features" DROP COLUMN IF EXISTS "_locale";
    ALTER TABLE "projects_stats" DROP COLUMN IF EXISTS "_locale";
    DROP TYPE IF EXISTS "public"."_locales";
  `)
}
