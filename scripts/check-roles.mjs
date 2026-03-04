import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URI });

async function check() {
  const users = await pool.query("SELECT email, role FROM users WHERE email='mobilgaragedoor@gmail.com'");
  console.log("Payload DB Users:", users.rows);
  const authUsers = await pool.query("SELECT email, role FROM \"user\" WHERE email='mobilgaragedoor@gmail.com'");
  console.log("BetterAuth Users:", authUsers.rows);
  process.exit(0);
}

check();
