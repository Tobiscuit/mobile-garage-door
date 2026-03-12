import { test, expect, type APIRequestContext, type BrowserContext } from '@playwright/test';

/**
 * Helper: Sign up a user via Better Auth API and inject session cookies.
 */
async function signUpAndAuthenticate(
  request: APIRequestContext,
  context: BrowserContext,
  email: string,
  name: string,
  password: string = 'password123'
) {
  const res = await request.post('http://localhost:3000/api/auth/sign-up/email', {
    data: { email, password, name },
    headers: { 'Origin': 'http://localhost:3000' },
  });

  if (!res.ok()) {
    const text = await res.text();
    throw new Error(`Signup failed for ${email}: ${text}`);
  }

  const state = await request.storageState();
  await context.addCookies(state.cookies);
}

test.describe.configure({ mode: 'serial' });

test.describe('Tracking API — Unauthenticated Guards', () => {
  test('GET /api/tracking/latest/:id returns 401', async ({ request }) => {
    const res = await request.get('http://localhost:3000/api/tracking/latest/999');
    expect(res.status()).toBe(401);
  });

  test('PATCH /api/tracking/status returns 401', async ({ request }) => {
    const res = await request.patch('http://localhost:3000/api/tracking/status', {
      data: { serviceRequestId: 1, status: 'dispatched' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /api/tracking/update returns 401', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/tracking/update', {
      data: { serviceRequestId: 1, lat: 29.76, lng: -95.36 },
    });
    expect(res.status()).toBe(401);
  });
});

test.describe('Tracking API — Authenticated Validation', () => {
  test('POST /api/tracking/update rejects invalid GPS coordinates', async ({ request, context }) => {
    await signUpAndAuthenticate(request, context, 'e2e-api-tech@test.com', 'API Tech');

    const res = await request.post('http://localhost:3000/api/tracking/update', {
      data: {
        serviceRequestId: 1,
        lat: 9999,
        lng: -95.36,
      },
    });

    expect([400, 422]).toContain(res.status());
  });

  test('POST /api/tracking/update rejects NaN coordinates', async ({ request, context }) => {
    // Sign up a fresh user for this test since context doesn't share across tests
    await signUpAndAuthenticate(request, context, 'e2e-api-tech-nan@test.com', 'API Tech NaN');

    const res = await request.post('http://localhost:3000/api/tracking/update', {
      data: {
        serviceRequestId: 1,
        lat: 'not-a-number',
        lng: -95.36,
      },
    });

    expect([400, 422]).toContain(res.status());
  });

  test('PATCH /api/tracking/status rejects non-existent service request', async ({ request, context }) => {
    await signUpAndAuthenticate(request, context, 'e2e-api-tech-status@test.com', 'API Tech Status');

    const res = await request.patch('http://localhost:3000/api/tracking/status', {
      data: {
        serviceRequestId: 999999,
        status: 'completed',
      },
    });

    expect([400, 401, 403, 404, 422]).toContain(res.status());
  });
});

test.describe('Push Subscription API', () => {
  test('POST /api/push/subscribe returns 401 without auth', async ({ request }) => {
    const res = await request.post('http://localhost:3000/api/push/subscribe', {
      data: {
        subscription: JSON.stringify({
          endpoint: 'https://fcm.googleapis.com/v1/push/test',
          keys: { p256dh: 'test', auth: 'test' },
        }),
      },
    });

    expect(res.status()).toBe(401);
  });
});
