import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { passkey } from '@better-auth/passkey';
import { magicLink } from 'better-auth/plugins/magic-link';
import { nextCookies } from 'better-auth/next-js';
import { authSchema } from './auth-schema';

const dbUri = process.env.DATABASE_URI;

if (!dbUri) {
  throw new Error('DATABASE_URI is required for BetterAuth setup');
}

const pool = new Pool({ connectionString: dbUri });
export const db = drizzle(pool);
const baseURL =
  process.env.BETTER_AUTH_BASE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  'http://localhost:3000';
const rpID = new URL(baseURL).hostname;
const authSecret = process.env.BETTER_AUTH_SECRET || process.env.PAYLOAD_SECRET;
const useMemoryAuth =
  process.env.BETTER_AUTH_USE_MEMORY === 'true';
const memoryDB: Record<string, any[]> = {
  user: [],
  session: [],
  account: [],
  verification: [],
  passkey: [],
};

if (!authSecret) {
  throw new Error('BETTER_AUTH_SECRET or PAYLOAD_SECRET is required for BetterAuth setup');
}

export const auth = betterAuth({
  baseURL,
  secret: authSecret,
  database: useMemoryAuth
    ? memoryAdapter(memoryDB)
    : drizzleAdapter(db, {
        provider: 'pg',
        schema: authSchema,
      }),
  emailAndPassword: {
    enabled: false,
  },
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Until an SMTP provider is configured, expose the link in server logs.
        console.log(`[magic-link] send to ${email}: ${url}`);
      },
    }),
    passkey({
      rpName: 'Mobil Garage Door',
      rpID,
      origin: baseURL,
    }),
  ],
});
