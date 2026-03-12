import { test, expect } from '@playwright/test';

test.describe('Authentication Routing E2E', () => {
  test('Unauthenticated user is redirected to login when visiting /app', async ({ page }) => {
    await page.goto('/app');
    // Auth middleware now redirects to /login
    await expect(page).toHaveURL(/.*(login|auth|\?login)/);
  });

  test('Logged in Customer sees the Portal and NOT the Command Center', async ({ page, request, context }) => {
    // Sign up with Better Auth to generate a real session cookie
    const res = await request.post('http://localhost:3000/api/auth/sign-up/email', {
      data: {
        email: 'playwright-customer@test.com',
        password: 'password123',
        name: 'E2E Customer',
      },
      headers: { 'Origin': 'http://localhost:3000' },
    });

    if (!res.ok()) {
      const text = await res.text();
      throw new Error(`Signup failed: ${text}`);
    }

    // Extract BetterAuth session cookie
    const state = await request.storageState();
    await context.addCookies(state.cookies);

    await page.goto('/portal');
    await expect(page).toHaveURL(/.*\/portal/);
    await expect(page.getByText('E2E Customer').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Admin View')).not.toBeVisible();
  });

  test('Logged in Admin sees the Portal AND the Admin View toggle button', async ({ page, request, context }) => {
    const res = await request.post('http://localhost:3000/api/auth/sign-up/email', {
      data: {
        email: 'playwright-admin@test.com',
        password: 'password123',
        name: 'E2E Admin',
      },
      headers: { 'Origin': 'http://localhost:3000' },
    });

    if (!res.ok()) {
      const text = await res.text();
      throw new Error(`Admin signup failed: ${text}`);
    }

    const state = await request.storageState();
    await context.addCookies(state.cookies);

    await page.goto('/portal');
    await expect(page).toHaveURL(/.*\/portal/);
    await expect(page.getByText('E2E Admin').first()).toBeVisible({ timeout: 15000 });

    const adminToggle = page.getByText('Admin View');
    await expect(adminToggle).toBeVisible();

    await adminToggle.click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    // Dashboard page loaded successfully if URL changed
    await page.waitForLoadState('networkidle');
  });
});
