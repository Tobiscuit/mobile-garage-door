import { test, expect } from '@playwright/test';

test.describe('Authentication Routing E2E', () => {
  test('Unauthenticated user is redirected to login when visiting /app', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveURL(/.*\?login=true/);

    const headerLoginBtn = page.locator('header').getByText('PORTAL LOGIN');
    await expect(headerLoginBtn).toBeVisible();
  });

  test('Logged in Customer sees the Portal and NOT the Command Center', async ({ page, request, context }) => {
    // 1. Natively sign up with Better Auth to generate a real session cookie!
    const res = await request.post('http://localhost:3000/api/auth/sign-up/email', {
      data: {
        email: 'playwright-customer@test.com',
        password: 'password123',
        name: 'E2E Customer',
      },
    });

    if (!res.ok()) {
      console.log('Signup Failed:', await res.text());
    }
    expect(res.ok()).toBeTruthy();

    // Extract the securely hashed BetterAuth session cookie returned by the server
    const state = await request.storageState();
    await context.addCookies(state.cookies);

    // 2. Visit the Next.js app 
    await page.goto('/portal');

    // It should route a customer directly to /portal
    await expect(page).toHaveURL(/.*\/portal/);

    await page.screenshot({ path: 'customer-portal-debug.png' });

    await expect(page.getByText('E2E Customer').first()).toBeVisible();
    await expect(page.getByText('Admin View')).not.toBeVisible();
  });

  test('Logged in Admin sees the Portal AND the Admin View toggle button', async ({ page, request, context }) => {
    // 1. Natively sign up with Better Auth to generate a real session cookie!
    const res = await request.post('http://localhost:3000/api/auth/sign-up/email', {
      data: {
        email: 'playwright-admin@test.com',
        password: 'password123',
        name: 'E2E Admin',
      },
    });

    if (!res.ok()) {
      console.log('Admin Signup Failed:', await res.text());
    }
    expect(res.ok()).toBeTruthy();

    // Extract the securely hashed BetterAuth session cookie returned by the server
    const state = await request.storageState();
    await context.addCookies(state.cookies);

    // 2. Visit the Next.js app 
    await page.goto('/portal');

    // An admin should also be routed to the portal by default
    await expect(page).toHaveURL(/.*\/portal/);
    await expect(page.getByText('E2E Admin').first()).toBeVisible();

    // Verify they see the "Admin View" button allowing perspective switching
    const adminToggle = page.getByText('Admin View');
    await expect(adminToggle).toBeVisible();

    await adminToggle.click();
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.getByText('MOBILGARAGE')).toBeVisible();
  });
});

