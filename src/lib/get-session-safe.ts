import { cookies, headers } from 'next/headers';
import { getCloudflareContext } from './cloudflare';
import { createAuth } from './auth';

export async function getSessionSafe(requestHeaders: Headers) {
  try {
    const { env } = await getCloudflareContext();
    // Return null if we don't have D1 bindings available
    if (!env || !env.DB) return null;

    const auth = createAuth(env);
    return await auth.api.getSession({ headers: requestHeaders });
  } catch (error) {
    console.error('[auth] getSession failed:', error);
    return null;
  }
}
