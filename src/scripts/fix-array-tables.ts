import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { sql } from '@payloadcms/db-postgres';

async function run() {
  console.log("Connecting to Payload...");
  const payload = await getPayload({ config: configPromise });
  
  console.log("Injecting missing array tables...");
  try {
    await payload.db.execute(sql`
      CREATE TABLE IF NOT EXISTS "settings_values" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "title" varchar NOT NULL,
        "description" varchar NOT NULL
      );`);
    await payload.db.execute(sql`
      CREATE TABLE IF NOT EXISTS "settings_stats" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL,
        "id" varchar PRIMARY KEY NOT NULL,
        "value" varchar NOT NULL,
        "label" varchar NOT NULL
      );`);
    await payload.db.execute(sql`ALTER TABLE "settings_values" DROP CONSTRAINT IF EXISTS "settings_values_parent_id_fk";`);
    await payload.db.execute(sql`ALTER TABLE "settings_stats" DROP CONSTRAINT IF EXISTS "settings_stats_parent_id_fk";`);
    await payload.db.execute(sql`ALTER TABLE "settings_values" ADD CONSTRAINT "settings_values_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;`);
    await payload.db.execute(sql`ALTER TABLE "settings_stats" ADD CONSTRAINT "settings_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;`);
    console.log("Tables injected and linked to 'settings' successfully!");
  } catch (e) {
    console.error("Injection error:", e);
  }
  process.exit(0);
}

run();
