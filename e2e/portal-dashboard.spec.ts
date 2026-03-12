import { test, expect, type APIRequestContext, type BrowserContext } from '@playwright/test';

/**
 * Helper: Sign up a user via Better Auth API and inject session cookies.
 * Global setup cleans test users so sign-up always works on fresh runs.
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

// Use UNIQUE emails to avoid conflicts with auth.spec.ts
test.describe.configure({ mode: 'serial' });

test.describe('Customer Portal E2E', () => {
  test('Unauthenticated user cannot access portal', async ({ page }) => {
    await page.goto('/portal');
    await expect(page).toHaveURL(/.*(login|auth|\?login=true).*/);
  });

  test('Customer signs up and sees their portal', async ({ page, request, context }) => {
    await signUpAndAuthenticate(request, context, 'e2e-portal-customer@test.com', 'Portal Customer');

    await page.goto('/portal');
    await expect(page).toHaveURL(/.*\/portal/);
    await expect(page.getByText('Portal Customer').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Admin View')).not.toBeVisible();
  });
});

test.describe('Admin Dashboard E2E', () => {
  test('Admin signs up, sees portal, and can toggle to admin view', async ({ page, request, context }) => {
    // Use unique email — playwright-admin@test.com is used in auth.spec.ts
    await signUpAndAuthenticate(request, context, 'e2e-dashboard-admin@test.com', 'Dashboard Admin');

    await page.goto('/portal');
    await expect(page).toHaveURL(/.*\/portal/);

    const adminToggle = page.getByText('Admin View');
    await expect(adminToggle).toBeVisible({ timeout: 15000 });

    await adminToggle.click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Technician Dashboard E2E', () => {
  test('Technician signs up and can access the app', async ({ page, request, context }) => {
    await signUpAndAuthenticate(request, context, 'e2e-dashboard-tech@test.com', 'E2E Technician');

    await page.goto('/portal');
    await expect(page).toHaveURL(/.*\/portal/);
    await expect(page.getByText('E2E Technician').first()).toBeVisible({ timeout: 15000 });
  });
});
