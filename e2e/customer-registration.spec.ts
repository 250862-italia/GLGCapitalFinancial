import { test, expect } from '@playwright/test';

test('Customer Registration E2E', async ({ page }) => {
  await page.goto('https://www.glgcapitalgroup.com/iscriviti');

  // Fill registration form
  await page.fill('input[name="firstName"]', 'John');
  await page.fill('input[name="lastName"]', 'Doe');
  await page.fill('input[name="email"]', 'johndoe@example.com');
  await page.fill('input[name="phone"]', '+1234567890');
  await page.fill('input[name="password"]', 'Test1234!');
  await page.fill('input[name="confirmPassword"]', 'Test1234!');

  // Submit the form
  await page.click('button[type="submit"]');

  // Wait for success message or redirect
  await expect(page.locator('text=Registration completed')).toBeVisible({ timeout: 10000 });
}); 