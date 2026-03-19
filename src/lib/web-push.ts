/**
 * Web Push wrapper using PushForge — a proven, zero-dependency library
 * built on Web Crypto API. Works on Cloudflare Workers, Node.js, etc.
 *
 * Replaces our old buggy custom RFC 8291 implementation.
 */
import { buildPushHTTPRequest } from '@pushforge/builder';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface WebPushOptions {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;
}

/**
 * Convert raw base64url VAPID keys to JWK format for PushForge.
 */
function vapidKeysToJWK(publicKeyB64url: string, privateKeyB64url: string): JsonWebKey {
  // Decode public key: 65 bytes = 0x04 || x(32) || y(32)
  const pubBytes = base64UrlDecode(publicKeyB64url);
  const x = base64UrlEncode(pubBytes.slice(1, 33));
  const y = base64UrlEncode(pubBytes.slice(33, 65));

  return {
    kty: 'EC',
    crv: 'P-256',
    x,
    y,
    d: privateKeyB64url,
  };
}

function base64UrlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(base64 + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Send a Web Push notification using PushForge.
 * Drop-in replacement for the old sendWebPush function.
 */
export async function sendWebPush(
  subscription: PushSubscription,
  payload: string,
  options: WebPushOptions
): Promise<{ ok: boolean; status: number }> {
  const privateJWK = vapidKeysToJWK(options.vapidPublicKey, options.vapidPrivateKey);

  const { endpoint, headers, body } = await buildPushHTTPRequest({
    privateJWK,
    subscription: {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    },
    message: {
      payload: JSON.parse(payload),
      adminContact: options.vapidSubject,
    },
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body,
  });

  return { ok: response.ok, status: response.status };
}
