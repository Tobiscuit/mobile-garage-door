import { getPayload } from '@/lib/payload';

export async function getSessionSafe(requestHeaders: Headers) {
  try {
    const payload = await getPayload();
    return await payload.betterAuth.api.getSession({ headers: requestHeaders });
  } catch (error) {
    console.error('[auth] getSession failed:', error);
    return null;
  }
}
