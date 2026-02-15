import { betterAuth } from 'better-auth';
import { pgDrizzle } from 'better-auth/adapters/drizzle-adapter';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { siwe } from 'better-auth/plugins/siwe';
import { twoFactor } from 'better-auth/plugins/two-factor';

const dbUri = process.env.DATABASE_URI;

if (!dbUri) {
  throw new Error('DATABASE_URI is required for BetterAuth setup');
}

const pool = new Pool({ connectionString: dbUri });
export const db = drizzle(pool);

export const auth = betterAuth({
  database: pgDrizzle(db, {
    models: {
      user: {
        fields: {
          id: { type: 'integer', primaryKey: true },
          email: { type: 'varchar', unique: true },
          password: { type: 'varchar' },
          role: { type: 'enum', enumName: 'enum_users_role' },
          name: { type: 'varchar' },
          phone: { type: 'varchar' },
          address: { type: 'varchar' },
          // Additional fields for MFA/Passkey if needed
        },
      },
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: '30d',
    strategy: 'jwt',
  },
  plugins: [
    siwe(), // Enables Passkey (WebAuthn) for passwordless auth
    twoFactor({
      // MFA config: e.g., via email or TOTP
      method: 'totp', // Or 'email' for codes
    }),
  ],
});
