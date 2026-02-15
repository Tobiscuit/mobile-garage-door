import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { passkey } from '@better-auth/passkey';

const dbUri = process.env.DATABASE_URI;

if (!dbUri) {
  throw new Error('DATABASE_URI is required for BetterAuth setup');
}

const pool = new Pool({ connectionString: dbUri });
export const db = drizzle(pool);
const baseURL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
const rpID = new URL(baseURL).hostname;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    passkey({
      rpName: 'Mobil Garage Door',
      rpID,
      origin: baseURL,
    }),
  ],
});
