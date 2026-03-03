import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function globalSetup() {
  console.log('--- Playwright Global Setup: Synchronizing Test Users ---');

  const adminEmail = 'playwright-admin@test.com';
  const customerEmail = 'playwright-customer@test.com';

  // 1. Clean up old test states absolutely completely
  const deleteUsersCmd = `DELETE FROM users WHERE email IN ('${adminEmail}', '${customerEmail}');`;
  const deleteInvitesCmd = `DELETE FROM staff_invites WHERE email = '${adminEmail}';`;

  // 2. We DO NOT manually seed BetterAuth sessions or users! It's too brittle due to hashing.
  // Instead, we seed a Payload staff_invites record so when the Admin signs up natively, 
  // they are automatically upgraded!
  const insertInviteCmd = `INSERT INTO staff_invites (email, role, status, created_at, updated_at) VALUES ('${adminEmail}', 'admin', 'pending', datetime('now'), datetime('now'));`;

  const runSql = (sql: string) => {
    try {
      // Using local wrangler D1 to execute against the local dev database
      execSync(`npx wrangler d1 execute DB --local --yes --command "${sql}"`, { stdio: 'ignore' });
    } catch (e) {
      console.error(`Failed to execute SQL: ${sql}`);
      // Don't crash setup on delete failures, just log
    }
  };

  runSql(deleteUsersCmd);
  runSql(deleteInvitesCmd);
  runSql(insertInviteCmd);

  console.log('✅ Injected pending staff invite for Playwright Admin!');
}

export default globalSetup;
