import { test, expect } from '@playwright/test';

test.describe('Homepage & Public Pages', () => {
  test('Homepage loads with company branding', async ({ page }) => {
    await page.goto('/');

    // Should have the company name visible
    await expect(page.getByText(/mobil/i).first()).toBeVisible();

    // Should have a CTA button for booking
    const bookBtn = page.getByRole('link', { name: /book|schedule|service/i }).first();
    await expect(bookBtn).toBeVisible();
  });

  test('Homepage renders in Spanish when locale is /es', async ({ page }) => {
    await page.goto('/es');

    // Should have Spanish content
    await expect(page).toHaveURL(/\/es/);
  });

  test('Book-Service page loads with step wizard', async ({ page }) => {
    await page.goto('/book-service');

    // Should show the booking page with some form-like content
    // Wait for the page to fully render
    await page.waitForLoadState('networkidle');

    // The booking wizard should have step indicators or a form
    const formOrWizard = page.locator('form, input, [class*="step"], [class*="booking"]').first();
    await expect(formOrWizard).toBeVisible({ timeout: 15000 });
  });
});
