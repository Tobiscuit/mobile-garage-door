import { createAuth } from 'better-auth';
import { pgAdapter } from 'better-auth/adapters/pg';
import { passkey } from 'better-auth/plugins/passkey';
import { twoFactor } from 'better-auth/plugins/two-factor';
import { saml } from 'better-auth/plugins/saml'; // For SSO

const dbUri = process.env.DATABASE_URI;

if (!dbUri) {
  throw new Error('DATABASE_URI is required for BetterAuth setup');
}

export const auth = createAuth({
  database: pgAdapter(dbUri, {
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
    passkey(), // Enables Passkey (WebAuthn) for passwordless auth
    twoFactor({
      // MFA config: e.g., via email or TOTP
      method: 'totp', // Or 'email' for codes
    }),
    saml({
      // SSO config: Provide your SAML provider details here
      // e.g., idp: { entityId: '...', cert: '...' }
    }),
  ],
});
