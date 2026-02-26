import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { memoryAdapter } from 'better-auth/adapters/memory';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { passkey } from '@better-auth/passkey';
import { magicLink } from 'better-auth/plugins/magic-link';
import { nextCookies } from 'better-auth/next-js';
import { authSchema } from './auth-schema';
import { sendEmail } from './email';

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
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  plugins: [
    nextCookies(),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        // Always log the magic link URL for local development
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`🔑 MAGIC LINK for ${email}:`);
        console.log(url);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
        try {
          await sendEmail({
             to: email,
             subject: 'Sign in to Mobile Garage Door',
             html: `<p>Click the link below to sign in:</p><a href="${url}">${url}</a><p>If you didn't request this, you can ignore this email.</p>`,
             text: `Click the link below to sign in:\n\n${url}\n\nIf you didn't request this, you can ignore this email.`
          });
        } catch (error) {
          console.error('Failed to send magic link email:', error);
        }
      },
    }),
    passkey({
      rpName: 'Mobil Garage Door',
      rpID,
      origin: baseURL,
    }),
  ],
});
