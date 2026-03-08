import webpush from 'web-push';

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    ticketId?: string;
    milestone?: string;
  };
}

/**
 * Send a Web Push notification to a user's stored subscription.
 * Uses the web-push library with VAPID authentication.
 * 
 * @param subscription - JSON string of PushSubscription from users.pushSubscription
 * @param payload - Notification content
 * @param env - Worker env for VAPID keys
 * @returns true if sent successfully, false if subscription is invalid/expired
 */
export async function sendPushNotification(
  subscription: string,
  payload: PushPayload,
  env: { VAPID_PRIVATE_KEY: string }
): Promise<boolean> {
  try {
    const pushSubscription = JSON.parse(subscription);

    if (!pushSubscription?.endpoint || !pushSubscription?.keys) {
      console.error('Invalid push subscription format');
      return false;
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = env.VAPID_PRIVATE_KEY || process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.error('VAPID keys not configured');
      return false;
    }

    webpush.setVapidDetails(
      'mailto:service@mobilgaragedoor.com',
      publicKey,
      privateKey
    );

    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge.png',
      tag: payload.tag || 'tech-tracking',
      data: payload.data || {},
    });

    await webpush.sendNotification(pushSubscription, notificationPayload, {
      TTL: 3600, // 1 hour
      urgency: 'high',
      topic: payload.tag || 'tech-tracking',
    });

    console.log(`Push sent: ${payload.title}`);
    return true;
  } catch (error: any) {
    // 410 Gone or 404 = subscription expired/invalid
    if (error?.statusCode === 410 || error?.statusCode === 404) {
      console.log('Push subscription expired, should be cleaned up');
      return false;
    }
    console.error('Push send error:', error?.message || error);
    return false;
  }
}

/**
 * Milestone notification templates.
 * Returns localized notification content for a given milestone + locale.
 */
export function getMilestoneNotification(
  milestone: 'eta_15' | 'eta_3',
  techName: string,
  locale: string = 'en'
): PushPayload {
  const templates: Record<string, Record<string, { title: string; body: string }>> = {
    eta_15: {
      en: {
        title: '🚐 Your technician is on the way!',
        body: `${techName} is about 15 minutes away`,
      },
      es: {
        title: '🚐 ¡Tu técnico está en camino!',
        body: `${techName} está a unos 15 minutos`,
      },
      vi: {
        title: '🚐 Kỹ thuật viên đang trên đường đến!',
        body: `${techName} còn khoảng 15 phút nữa`,
      },
    },
    eta_3: {
      en: {
        title: '📍 Almost there!',
        body: `${techName} is just around the corner — about 3 minutes away`,
      },
      es: {
        title: '📍 ¡Casi llega!',
        body: `${techName} está a la vuelta de la esquina — unos 3 minutos`,
      },
      vi: {
        title: '📍 Sắp đến rồi!',
        body: `${techName} sắp đến nơi — khoảng 3 phút nữa`,
      },
    },
  };

  const t = templates[milestone]?.[locale] || templates[milestone]?.en;

  return {
    title: t.title,
    body: t.body,
    tag: `milestone-${milestone}`,
    data: {
      milestone,
    },
  };
}
