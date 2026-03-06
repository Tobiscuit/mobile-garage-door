import type { D1Database, R2Bucket, KVNamespace } from "@cloudflare/workers-types";
import { betterAuth } from "better-auth";
import { passkey } from "@better-auth/passkey";
import { magicLink } from "better-auth/plugins";
import { sendEmail } from "./email";

interface CloudflareEnv {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  VINEXT_CACHE: KVNamespace;
}

export function createAuth(env: CloudflareEnv) {
  const isDev = process.env.NODE_ENV === 'development';
  const baseURL = isDev ? 'http://localhost:3000' : (
    process.env.BETTER_AUTH_BASE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    'https://mobile-garage-door.tobiasramzy.workers.dev'
  );
  const rpID = new URL(baseURL).hostname;
  const authSecret = process.env.BETTER_AUTH_SECRET;

  return betterAuth({
    // Better Auth 1.5: native D1 support — pass binding directly
    database: env.DB as any,
    baseURL,
    secret: authSecret,
    plugins: [
      passkey({
        rpName: 'Mobil Garage Door',
        rpID,
        origin: baseURL,
      }),
      magicLink({
        sendMagicLink: async ({ email, token, url }) => {
          console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
          console.log(`🔑 MAGIC LINK for ${email}:`);
          console.log(url);
          console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
          try {
            await sendEmail({
              to: email,
              subject: 'Sign in to Mobil Garage Door',
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
    rateLimit: {
      enabled: true,
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 100 },
        "/sign-in/social": { window: 60, max: 100 },
      },
    },
    user: {
      modelName: "users",
      fields: {
        emailVerified: "email_verified",
        createdAt: "created_at",
        updatedAt: "updated_at",
      },
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
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const data: any = { ...user };
            if (data.email === 'tobiasramzy@gmail.com') {
              data.role = 'admin';
            }
            if (data.createdAt instanceof Date) data.createdAt = data.createdAt.toISOString();
            if (data.updatedAt instanceof Date) data.updatedAt = data.updatedAt.toISOString();
            return { data };
          }
        },
        update: {
          before: async (user) => {
            const data: any = { ...user };
            if (data.updatedAt instanceof Date) data.updatedAt = data.updatedAt.toISOString();
            if (data.createdAt instanceof Date) data.createdAt = data.createdAt.toISOString();
            return { data };
          }
        }
      }
    },
  });
}
