import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function globalSetup() {
  console.log('--- Playwright Global Setup: Synchronizing Test Users ---');
  const pool = new Pool({ connectionString: process.env.DATABASE_URI });

  const adminEmail = 'playwright-admin@test.com';
  const customerEmail = 'playwright-customer@test.com';
  
  // 1. Clean up old test states absolutely completely
  await pool.query('DELETE FROM "user" WHERE email IN ($1, $2)', [adminEmail, customerEmail]);
  await pool.query('DELETE FROM "users" WHERE email IN ($1, $2)', [adminEmail, customerEmail]);
  await pool.query('DELETE FROM "staff_invites" WHERE email = $1', [adminEmail]).catch(() => {});

  const now = new Date();

  // 2. We DO NOT manually seed BetterAuth sessions or users! It's too brittle due to hashing.
  // Instead, we seed a Payload `staff-invites` record so when the Admin signs up natively, 
  // they are automatically upgraded!
  
  // Check if staff_invites table exists (just in case)
  try {
    await pool.query(`
      INSERT INTO "staff_invites" (email, role, status, "created_at", "updated_at") 
      VALUES ($1, $2, $3, $4, $5)
    `, [adminEmail, 'admin', 'pending', now, now]);
    console.log('✅ Injected pending staff invite for Playwright Admin!');
  } catch (e) {
    console.error('Failed to inject invite. ensure the table name is correct (staff_invites vs staff-invites)');
    console.error(e);
  }

  await pool.end();
}

export default globalSetup;
