import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env') });

function runSql(sql: string) {
  try {
    execSync(`npx wrangler d1 execute DB --local --yes --command "${sql}"`, { stdio: 'ignore' });
  } catch (e) {
    // Don't crash setup on delete failures
  }
}

async function globalSetup() {
  console.log('--- Playwright Global Setup: Synchronizing Test Users ---');

  // ── 1. Clean up ALL test data from previous runs ──
  // Delete Better Auth sessions and accounts for test users
  runSql(`DELETE FROM session WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@test.com' OR email LIKE 'e2e-%');`);
  runSql(`DELETE FROM account WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@test.com' OR email LIKE 'e2e-%');`);
  runSql(`DELETE FROM passkey WHERE userId IN (SELECT id FROM users WHERE email LIKE '%@test.com' OR email LIKE 'e2e-%');`);

  // Delete test users themselves
  runSql(`DELETE FROM users WHERE email LIKE '%@test.com' OR email LIKE 'e2e-%';`);

  // Delete test staff invites
  runSql(`DELETE FROM staff_invites WHERE email LIKE '%@test.com';`);

  // Delete test service requests
  runSql(`DELETE FROM service_requests WHERE ticketId LIKE 'E2E-%';`);

  // ── 2. Seed staff invites so signup auto-upgrades roles ──
  const adminEmails = ['playwright-admin@test.com', 'e2e-dashboard-admin@test.com'];
  const techEmails = ['playwright-tech@test.com', 'e2e-dashboard-tech@test.com'];

  for (const email of adminEmails) {
    runSql(`INSERT INTO staff_invites (email, role, status, created_at, updated_at) VALUES ('${email}', 'admin', 'pending', datetime('now'), datetime('now'));`);
  }
  for (const email of techEmails) {
    runSql(`INSERT INTO staff_invites (email, role, status, created_at, updated_at) VALUES ('${email}', 'technician', 'pending', datetime('now'), datetime('now'));`);
  }

  console.log('✅ Cleaned test data and seeded staff invites!');
}

export default globalSetup;
