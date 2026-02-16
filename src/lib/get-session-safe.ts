import { auth } from '@/lib/auth';
import { ensureAuthTablesReady } from '@/lib/ensure-auth-tables';

export async function getSessionSafe(requestHeaders: Headers) {
  try {
    await ensureAuthTablesReady;
    return await auth.api.getSession({ headers: requestHeaders });
  } catch (error) {
    console.error('[auth] getSession failed:', error);
    return null;
  }
}
