import { betterAuth } from 'better-auth';
import { passkey } from '@better-auth/passkey';
import { magicLink } from 'better-auth/plugins/magic-link';
import { nextCookies } from 'better-auth/next-js';
import { sendEmail } from '../email';

const baseURL =
  process.env.BETTER_AUTH_BASE_URL ||
  process.env.NEXT_PUBLIC_SERVER_URL ||
  'http://localhost:3000';
const rpID = new URL(baseURL).hostname;
const authSecret = process.env.BETTER_AUTH_SECRET || process.env.PAYLOAD_SECRET;

export const betterAuthOptions = {
  baseURL,
  secret: authSecret,
  emailAndPassword: {
    enabled: true,
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
};
