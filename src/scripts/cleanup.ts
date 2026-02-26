import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { sql } from '@payloadcms/db-postgres';

async function cleanup() {
  console.log("Connecting to Payload...");
  const payload = await getPayload({ config: configPromise });
  
  console.log("Executing cleanup queries...");
  try {
    await payload.db.execute(sql`
      DROP TABLE IF EXISTS "settings" CASCADE;
      DROP TYPE IF EXISTS "public"."enum_settings_theme_preference" CASCADE;
      DROP TABLE IF EXISTS "settings_values" CASCADE;
      DROP TABLE IF EXISTS "settings_stats" CASCADE;
    `);
    console.log("Cleanup successful.");
  } catch (e) {
    console.error("Cleanup error:", e);
  }
  process.exit(0);
}

cleanup();
