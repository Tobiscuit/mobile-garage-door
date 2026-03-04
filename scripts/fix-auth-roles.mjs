import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function fix() {
  await pool.query("UPDATE \"user\" SET role='admin' WHERE email='mobilgaragedoor@gmail.com'");
  console.log("Updated BetterAuth role to Admin.");
  process.exit(0);
}

fix();
