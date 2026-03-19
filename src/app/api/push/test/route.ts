import { getCloudflareContext } from '@/lib/cloudflare';
import { getDB } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { sendWebPush } from '@/lib/web-push';

/**
 * POST /api/push/test
 * Sends a test push notification to all subscriptions in the push_subscriptions table.
 * Admin-only — protected by SEO_ENGINE_API_KEY for quick testing.
 */
export async function POST(request: Request) {
  const { env } = await getCloudflareContext();
  const apiKey = request.headers.get('x-seo-engine-key');

  if (!apiKey || apiKey !== (env as any).SEO_ENGINE_API_KEY) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDB(env.DB)!;
  const allSubs = await db.select().from(pushSubscriptions);

  if (allSubs.length === 0) {
    return Response.json({ error: 'No push subscriptions found', count: 0 }, { status: 404 });
  }

  const results = [];
  for (const sub of allSubs) {
    try {
      const parsed = JSON.parse(sub.subscription);
      const result = await sendWebPush(
        parsed,
        JSON.stringify({
          title: '🧪 Test Push Notification',
          body: 'If you see this, push notifications are working!',
          url: '/dashboard',
        }),
        {
          vapidPublicKey: (env as any).VAPID_PUBLIC_KEY,
          vapidPrivateKey: (env as any).VAPID_PRIVATE_KEY,
          vapidSubject: (env as any).VAPID_SUBJECT || 'mailto:service@mobilgaragedoor.com',
        }
      );
      results.push({ subId: sub.id, userId: sub.userId, status: result.status, ok: result.ok });
    } catch (err: any) {
      results.push({ subId: sub.id, userId: sub.userId, error: err.message });
    }
  }

  return Response.json({ sent: results.length, results });
}
