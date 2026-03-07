'use client';

import { createAuthClient } from 'better-auth/react';
import { passkeyClient } from '@better-auth/passkey/client';
import { magicLinkClient } from 'better-auth/client/plugins';

const isDev = process.env.NODE_ENV === 'development';

export const authClient = createAuthClient({
  baseURL: isDev ? 'http://localhost:3000' : process.env.NEXT_PUBLIC_SERVER_URL || 'https://mobilgaragedoor.com',
  plugins: [magicLinkClient(), passkeyClient()],
});
