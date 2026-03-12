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
    'https://mobilgaragedoor.com'
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
              html: `
                <div style="max-width:480px;margin:0 auto;font-family:'Work Sans',Helvetica,Arial,sans-serif;background:#f7f9fb;padding:40px 24px;">
                  <div style="background:#2c3e50;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(44,62,80,0.15);">
                    <div style="padding:32px 32px 24px;text-align:center;">
                      <h1 style="color:#ffffff;font-size:22px;font-weight:900;margin:0 0 4px;">Mobil Garage Door</h1>
                      <p style="color:#7f8c8d;font-size:13px;margin:0;">Secure sign-in link</p>
                    </div>
                    <div style="background:#ffffff;padding:32px;border-radius:0 0 16px 16px;">
                      <p style="color:#2c3e50;font-size:16px;margin:0 0 24px;line-height:1.5;">Click the button below to sign in. No password needed — this link expires in 10 minutes.</p>
                      <a href="${url}" style="display:block;background:#f1c40f;color:#2c3e50;text-decoration:none;font-weight:700;font-size:16px;padding:14px 32px;border-radius:12px;text-align:center;">
                        Sign In →
                      </a>
                      <p style="color:#7f8c8d;font-size:12px;margin:24px 0 0;text-align:center;">If you didn't request this, you can safely ignore this email.</p>
                    </div>
                  </div>
                </div>
              `.trim(),
              text: `Sign in to Mobil Garage Door\n\nClick the link below to sign in. No password needed — this link expires in 10 minutes.\n\n${url}\n\nIf you didn't request this, you can safely ignore this email.`
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
    emailAndPassword: {
      // Enabled in dev/test for Playwright E2E tests; disabled in production (Google OAuth + magic link only)
      enabled: process.env.NODE_ENV !== 'production',
    },
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: ['google'],
      },
    },
    rateLimit: {
      // Disabled in dev for Playwright E2E tests
      enabled: process.env.NODE_ENV === 'production',
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

            // 1. Hardcoded owner fallback
            if (data.email === 'tobiasramzy@gmail.com') {
              data.role = 'admin';
            }

            // 2. Look up pending, non-expired staff invite
            try {
              const now = new Date().toISOString();
              const invite = await (env.DB as any)
                .prepare(
                  `SELECT role FROM staff_invites
                   WHERE email = ? AND status = 'pending'
                   AND (expires_at IS NULL OR expires_at > ?)
                   LIMIT 1`
                )
                .bind(data.email, now)
                .first();

              if (invite?.role) {
                data.role = invite.role;
              }
            } catch (err) {
              console.error('[Auth] Failed to check staff invite:', err);
            }

            // 3. D1 date serialization
            if (data.createdAt instanceof Date) data.createdAt = data.createdAt.toISOString();
            if (data.updatedAt instanceof Date) data.updatedAt = data.updatedAt.toISOString();
            return { data };
          },
          after: async (user) => {
            // Mark the invite as accepted
            try {
              const now = new Date().toISOString();
              await (env.DB as any)
                .prepare(
                  `UPDATE staff_invites
                   SET status = 'accepted', accepted_at = ?, updated_at = ?
                   WHERE email = ? AND status = 'pending'`
                )
                .bind(now, now, user.email)
                .run();
            } catch (err) {
              console.error('[Auth] Failed to mark invite accepted:', err);
            }
          },
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
