// @ts-nocheck — Web Crypto API types are strict about Uint8Array vs BufferSource
// This file works correctly at runtime on Workers, Deno, Bun, and browsers.
/**
 * Zero-dependency Web Push — edge-native, uses only Web Crypto API.
 * No `web-push` npm package needed. Works on Workers, Deno, Bun, browsers.
 *
 * Implements:
 * - VAPID JWT signing (ES256 / P-256) per RFC 8292
 * - Payload encryption (AES-128-GCM) per RFC 8291
 * - HTTP POST to push service endpoint per RFC 8030
 */

// ─── Helpers ──────────────────────────────────────────────────

/** URL-safe base64 encoding (no padding) */
function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** URL-safe base64 decoding */
function base64UrlDecode(str: string): Uint8Array {
  // Restore padding
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Concatenate Uint8Arrays */
function concat(...arrays: Uint8Array[]): Uint8Array {
  const totalLength = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

/** Encode a string to UTF-8 bytes */
function utf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/** Create HKDF info for Web Push (RFC 8291 Section 3.4) */
function createInfo(
  type: string,
  clientPublicKey: Uint8Array,
  serverPublicKey: Uint8Array
): Uint8Array {
  const typeBytes = utf8(type);
  const header = utf8('Content-Encoding: ');
  const nul = new Uint8Array([0]);
  const clientLen = new Uint8Array([0, clientPublicKey.length]);
  const serverLen = new Uint8Array([0, serverPublicKey.length]);

  return concat(
    header, typeBytes, nul,
    utf8('P-256'), nul,
    clientLen, clientPublicKey,
    serverLen, serverPublicKey
  );
}


/**
 * Import raw 32-byte EC private key by constructing PKCS8 DER encoding.
 */
async function importPrivateKeyFromRaw(rawKey: Uint8Array): Promise<CryptoKey> {
  // PKCS8 DER wrapper for EC P-256 private key
  // Sequence { Version 0, Algorithm (EC + P-256 OID), OctetString { ECPrivateKey { version, privateKey } } }
  const ecOid = new Uint8Array([0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x04, 0x03, 0x02]); // ignored, we use namedCurve
  const p256Oid = new Uint8Array([0x06, 0x08, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07]);
  const ecOidAlg = new Uint8Array([0x06, 0x07, 0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01]);

  // ECPrivateKey ::= SEQUENCE { version INTEGER (1), privateKey OCTET STRING }
  const ecPrivateKeyInner = concat(
    new Uint8Array([0x30, rawKey.length + 7]), // SEQUENCE
    new Uint8Array([0x02, 0x01, 0x01]),        // version = 1
    new Uint8Array([0x04, rawKey.length]),       // OCTET STRING
    rawKey
  );

  // AlgorithmIdentifier ::= SEQUENCE { algorithm OID, parameters OID }
  const algId = concat(
    new Uint8Array([0x30, ecOidAlg.length + p256Oid.length]),
    ecOidAlg,
    p256Oid
  );

  // PrivateKeyInfo ::= SEQUENCE { version, algorithm, privateKey }
  const versionBytes = new Uint8Array([0x02, 0x01, 0x00]); // version = 0
  const octetStringWrapper = concat(
    new Uint8Array([0x04, ecPrivateKeyInner.length]),
    ecPrivateKeyInner
  );

  const innerLen = versionBytes.length + algId.length + octetStringWrapper.length;
  const pkcs8 = concat(
    new Uint8Array([0x30, 0x82, (innerLen >> 8) & 0xff, innerLen & 0xff]),
    versionBytes,
    algId,
    octetStringWrapper
  );

  return crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

/**
 * Create a signed VAPID JWT for Web Push authentication.
 * Per RFC 8292: JWT with ES256 signature, audience = push service origin.
 */
async function createVapidJwt(
  audience: string,
  subject: string,
  privateKeyBase64url: string,
  expSeconds: number = 12 * 60 * 60 // 12 hours
): Promise<string> {
  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + expSeconds,
    sub: subject,
  };

  const headerB64 = base64UrlEncode(utf8(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(utf8(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key
  const rawKey = base64UrlDecode(privateKeyBase64url);
  const privateKey = await importPrivateKeyFromRaw(rawKey);

  // Sign with ES256 (ECDSA P-256 + SHA-256)
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    utf8(unsignedToken)
  );

  // Web Crypto returns DER-encoded signature, JWT needs raw r||s (64 bytes)
  const sigBytes = new Uint8Array(signature);
  const rawSig = derToRaw(sigBytes);

  return `${unsignedToken}.${base64UrlEncode(rawSig)}`;
}

/**
 * Convert DER-encoded ECDSA signature to raw r||s format (64 bytes).
 * DER: 0x30 [len] 0x02 [rLen] [r] 0x02 [sLen] [s]
 */
function derToRaw(der: Uint8Array): Uint8Array {
  // Check for SEQUENCE tag
  if (der[0] !== 0x30) {
    // Already raw format (64 bytes)
    if (der.length === 64) return der;
    throw new Error('Invalid ECDSA signature format');
  }

  let offset = 2; // skip SEQUENCE tag + length

  // Read r
  if (der[offset] !== 0x02) throw new Error('Expected INTEGER tag for r');
  const rLen = der[offset + 1];
  offset += 2;
  let r = der.slice(offset, offset + rLen);
  offset += rLen;

  // Read s
  if (der[offset] !== 0x02) throw new Error('Expected INTEGER tag for s');
  const sLen = der[offset + 1];
  offset += 2;
  let s = der.slice(offset, offset + sLen);

  // Pad/trim r and s to exactly 32 bytes
  r = padTo32(r);
  s = padTo32(s);

  return concat(r, s);
}

/** Pad or trim integer bytes to exactly 32 bytes */
function padTo32(bytes: Uint8Array): Uint8Array {
  if (bytes.length === 32) return bytes;
  if (bytes.length > 32) {
    // Leading zeros (DER pads positive numbers with 0x00)
    return bytes.slice(bytes.length - 32);
  }
  // Pad with leading zeros
  const padded = new Uint8Array(32);
  padded.set(bytes, 32 - bytes.length);
  return padded;
}

// ─── Payload Encryption (AES-128-GCM / RFC 8291) ────────────

/**
 * Encrypt a push notification payload per RFC 8291.
 * Uses ECDH key exchange + HKDF + AES-128-GCM.
 */
async function encryptPayload(
  clientPublicKeyBase64url: string,
  authSecretBase64url: string,
  payload: string
): Promise<{ encrypted: Uint8Array; serverPublicKey: Uint8Array; salt: Uint8Array }> {
  const clientPublicKeyBytes = base64UrlDecode(clientPublicKeyBase64url);
  const authSecret = base64UrlDecode(authSecretBase64url);
  const payloadBytes = utf8(payload);

  // Generate ephemeral server key pair for ECDH
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );

  // Export server public key as raw (65 bytes: 0x04 + x + y)
  const serverPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', serverKeyPair.publicKey)
  );

  // Import client public key
  const clientPublicKey = await crypto.subtle.importKey(
    'raw',
    clientPublicKeyBytes,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );

  // ECDH shared secret
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: clientPublicKey },
      serverKeyPair.privateKey,
      256
    )
  );

  // Generate 16-byte salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // ── HKDF key derivation (RFC 8291 Section 3.4) ──

  // Step 1: IKM = HKDF(auth_secret, shared_secret, "WebPush: info\0" || client_pub || server_pub, 32)
  const authInfo = concat(
    utf8('WebPush: info\0'),
    clientPublicKeyBytes,
    serverPublicKeyRaw
  );
  const prk_key = await crypto.subtle.importKey(
    'raw', authSecret, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const prk = new Uint8Array(
    await crypto.subtle.sign('HMAC', prk_key, sharedSecret)
  );

  // IKM extraction
  const ikm = await hkdfExpand(prk, authInfo, 32);

  // Step 2: Derive key and nonce from ikm
  const salt_key = await crypto.subtle.importKey(
    'raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const prk2 = new Uint8Array(
    await crypto.subtle.sign('HMAC', salt_key, ikm)
  );

  const cekInfo = createInfo('aes128gcm', clientPublicKeyBytes, serverPublicKeyRaw);
  const nonceInfo = createInfo('nonce', clientPublicKeyBytes, serverPublicKeyRaw);

  const contentEncryptionKey = await hkdfExpand(prk2, cekInfo, 16);
  const nonce = await hkdfExpand(prk2, nonceInfo, 12);

  // ── AES-128-GCM encrypt ──
  // Add padding delimiter (0x02 = final record)
  const paddedPayload = concat(payloadBytes, new Uint8Array([2]));

  const aesKey = await crypto.subtle.importKey(
    'raw', contentEncryptionKey, { name: 'AES-GCM' }, false, ['encrypt']
  );

  const encrypted = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce },
      aesKey,
      paddedPayload
    )
  );

  // Build aes128gcm header: salt(16) || rs(4) || idlen(1) || keyid(65) || ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096); // record size

  const header = concat(
    salt,
    rs,
    new Uint8Array([serverPublicKeyRaw.length]),
    serverPublicKeyRaw
  );

  return {
    encrypted: concat(header, encrypted),
    serverPublicKey: serverPublicKeyRaw,
    salt,
  };
}

/** HKDF-Expand (single step, since output ≤ hash length) */
async function hkdfExpand(
  prk: Uint8Array,
  info: Uint8Array,
  length: number
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const input = concat(info, new Uint8Array([1]));
  const output = new Uint8Array(
    await crypto.subtle.sign('HMAC', key, input)
  );
  return output.slice(0, length);
}

// ─── Public API ─────────────────────────────────────────────

export interface WebPushOptions {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;  // "mailto:..." or URL
  ttl?: number;
  urgency?: 'very-low' | 'low' | 'normal' | 'high';
  topic?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Send a Web Push notification using only Web Crypto API.
 * Zero dependencies. Works on Workers, Deno, Bun, browsers.
 *
 * @returns HTTP status code from the push service
 * @throws Error on network or encryption failure
 */
export async function sendWebPush(
  subscription: PushSubscription,
  payload: string,
  options: WebPushOptions
): Promise<{ ok: boolean; status: number }> {
  // 1. Encrypt the payload
  const { encrypted } = await encryptPayload(
    subscription.keys.p256dh,
    subscription.keys.auth,
    payload
  );

  // 2. Create VAPID JWT
  const endpoint = new URL(subscription.endpoint);
  const audience = `${endpoint.protocol}//${endpoint.host}`;
  const jwt = await createVapidJwt(
    audience,
    options.vapidSubject,
    options.vapidPrivateKey
  );

  // 3. Build Authorization header (vapid scheme)
  const vapidPublicKeyBytes = base64UrlDecode(options.vapidPublicKey);
  const authorization = `vapid t=${jwt}, k=${base64UrlEncode(vapidPublicKeyBytes)}`;

  // 4. POST encrypted payload to push service
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': authorization,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      'TTL': String(options.ttl ?? 3600),
      ...(options.urgency && { Urgency: options.urgency }),
      ...(options.topic && { Topic: options.topic }),
    },
    body: encrypted,
  });

  return { ok: response.ok, status: response.status };
}
