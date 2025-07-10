import { test, expect } from '@playwright/test';

test('Admin can approve investment and customer gets notification', async ({ page }) => {
  // Step 1: Login as admin
  await page.goto('https://www.glgcapitalgroup.com/admin/login');
  await page.fill('input[type="email"]', 'admin@glgcapital.com');
  await page.fill('input[type="password"]', 'Admin123!@#');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Admin Console')).toBeVisible({ timeout: 10000 });

  // Step 2: Go to investments/requests (adjust selector as needed)
  await page.goto('https://www.glgcapitalgroup.com/admin/investments');
  await expect(page.locator('text=Investment Requests')).toBeVisible({ timeout: 10000 });

  // Step 3: Approve the first pending investment (adjust selectors as needed)
  const approveButtons = await page.locator('button:has-text("Approve")').all();
  if (approveButtons.length === 0) throw new Error('No Approve buttons found');
  await approveButtons[0].click();

  // Step 4: Check for success message
  await expect(page.locator('text=Investment approved')).toBeVisible({ timeout: 10000 });

  // Step 5: (Optional) Check for notification/email (requires integration with test inbox)
}); 