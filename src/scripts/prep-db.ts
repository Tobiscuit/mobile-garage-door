import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { sql } from '@payloadcms/db-postgres';

async function setup() {
  const payload = await getPayload({ config: configPromise });
  try {
    await payload.db.execute(sql`
      -- Drop everything
      DROP TABLE IF EXISTS "site_settings_values" CASCADE;
      DROP TABLE IF EXISTS "site_settings" CASCADE;
      DROP TABLE IF EXISTS "site_settings_stats" CASCADE;
      DROP TABLE IF EXISTS "settings" CASCADE;
      DROP TABLE IF EXISTS "settings_values" CASCADE;
      DROP TABLE IF EXISTS "settings_stats" CASCADE;
      DROP TYPE IF EXISTS "public"."enum_settings_theme_preference" CASCADE;
      
      -- Create dummies for migration to operate on
      CREATE TABLE "site_settings_values" (id varchar PRIMARY KEY);
      CREATE TABLE "site_settings" (id serial PRIMARY KEY);
      CREATE TABLE "site_settings_stats" (
          id varchar PRIMARY KEY,
          _order integer,
          _parent_id integer
      );
      CREATE TABLE "settings" (id serial PRIMARY KEY);
      
      -- Add constraints migration expects to drop
      ALTER TABLE "site_settings_stats" ADD CONSTRAINT "site_settings_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "site_settings"("id");
    `);
    console.log("Schema prepped for migration!");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}
setup();
