import { config } from 'dotenv';
config();

import { Pool } from 'pg';

async function run() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URI });
  const email = 'jramirez203@outlook.com';

  console.log(`--- Locating user ${email} ---`);
  
  const userQuery = await pool.query("SELECT id FROM \"users\" WHERE email = $1", [email]);
  if (userQuery.rows.length === 0) {
     console.log('User not found in Payload users table.');
  } else {
     const userId = userQuery.rows[0].id;
     console.log(`Found Payload User ID: ${userId}`);
     
     // Delete associated foreign key rows (service requests, invoices, etc)
     console.log('Cleaning up related data...');
     await pool.query("DELETE FROM \"service_requests\" WHERE customer_id = $1", [userId]).catch(() => console.log('No service requests found or delete skipped'));
     await pool.query("DELETE FROM \"invoices\" WHERE customer_id = $1", [userId]).catch(() => console.log('No invoices found or delete skipped'));
     await pool.query("DELETE FROM \"payments\" WHERE customer_id = $1", [userId]).catch(() => console.log('No payments found or delete skipped'));
     
     await pool.query("DELETE FROM \"users\" WHERE id = $1", [userId]);
     console.log(`✅ Deleted ${email} from Payload CMS`);
  }

  // BetterAuth
  const authQuery = await pool.query("SELECT id FROM \"user\" WHERE email = $1", [email]);
  if (authQuery.rows.length === 0) {
      console.log('User not found in Better Auth table.');
  } else {
      const authId = authQuery.rows[0].id;
      console.log(`Found Better Auth User ID: ${authId}`);
      
      // Clean up sessions and accounts
      await pool.query("DELETE FROM \"session\" WHERE \"userId\" = $1", [authId]).catch(() => {});
      await pool.query("DELETE FROM \"account\" WHERE \"userId\" = $1", [authId]).catch(() => {});
      
      await pool.query("DELETE FROM \"user\" WHERE id = $1", [authId]);
      console.log(`✅ Deleted ${email} from Better Auth`);
  }

  process.exit(0);
}
run();
