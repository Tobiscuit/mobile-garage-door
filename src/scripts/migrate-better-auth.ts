import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { getMigrations } from 'better-auth/db/migration';
import { auth } from '../lib/auth'; // Adjust path as needed

async function runBetterAuthMigrations() {
  const dbUri = process.env.DATABASE_URI;
  if (!dbUri) {
    throw new Error('DATABASE_URI is required');
  }

  const pool = new Pool({ connectionString: dbUri });
  const db = drizzle(pool);

  const { toBeCreated, toBeAdded, runMigrations, compileMigrations } = await getMigrations({
    database: db, // Your Drizzle instance
    adapter: 'pgDrizzle', // Specify the adapter
  });

  console.log('Tables to create:', toBeCreated);
  console.log('Fields to add:', toBeAdded);

  // Run the migrations
  await runMigrations();

  console.log('Migrations completed successfully');
}

runBetterAuthMigrations().catch(console.error);
