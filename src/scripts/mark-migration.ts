import { getPayload } from 'payload';
import configPromise from '@payload-config';
import { sql } from '@payloadcms/db-postgres';

async function mark() {
  console.log("Connecting to Payload...");
  const payload = await getPayload({ config: configPromise });
  
  console.log("Marking migration...");
  try {
    const check = await payload.db.execute(sql`SELECT * FROM payload_migrations WHERE name = '20260224_030517_update_global_settings'`);
    if (check.rows.length === 0) {
      await payload.db.execute(sql`
        INSERT INTO payload_migrations (name, batch, updated_at, created_at)
        VALUES ('20260224_030517_update_global_settings', 1, NOW(), NOW())
      `);
      console.log("Migration successfully marked as complete!");
    } else {
      console.log("Migration already exists in db.");
    }
  } catch (e) {
    console.error("Error marking migration:", e);
  }
  process.exit(0);
}

mark();
