import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { magicLink } from "better-auth/plugins/magic-link";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDB } from "../db";
import * as schema from "../db/schema";
import { sendEmail } from "./email";

export function createAuth(d1: D1Database) {
  const db = getDB(d1);
  const baseURL =
    process.env.BETTER_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    'http://localhost:3000';
  const rpID = new URL(baseURL).hostname;
  const authSecret = process.env.BETTER_AUTH_SECRET || process.env.PAYLOAD_SECRET;

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.users,
      }
    }),
    baseURL,
    secret: authSecret,
    plugins: [
      passkey({
        rpName: 'Mobil Garage Door',
        rpID,
        origin: baseURL,
      }),
      magicLink({
        sendMagicLink: async ({ email, url }) => {
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
    ],
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "customer" },
        customerType: { type: "string", defaultValue: "residential" },
        companyName: { type: "string" },
        phone: { type: "string" },
        address: { type: "string" },
        lastLogin: { type: "string" },
        pushSubscription: { type: "string" },
        squareCustomerId: { type: "string" },
      },
    },
  });
}
