import { test, expect } from '@playwright/test';

test('Investment E2E: user can invest in a package', async ({ page }) => {
  // Step 1: Login as test user
  await page.goto('https://www.glgcapitalgroup.com/login');
  await page.fill('input[name="email"]', 'johndoe@example.com');
  await page.fill('input[name="password"]', 'Test1234!');
  await page.click('button[type="submit"]');
  await expect(page.locator('text=Dashboard')).toBeVisible({ timeout: 10000 });

  // Step 2: Go to investment packages (adjust selector as needed)
  await page.goto('https://www.glgcapitalgroup.com/dashboard');
  await expect(page.locator('text=Investment Packages')).toBeVisible({ timeout: 10000 });

  // Step 3: Click Invest on the first available package (adjust selector as needed)
  const investButtons = await page.locator('button:has-text("Invest")').all();
  if (investButtons.length === 0) throw new Error('No Invest buttons found');
  await investButtons[0].click();

  // Step 4: Confirm investment (adjust selectors as needed)
  // If a modal or form appears, fill in amount if required
  const amountInput = page.locator('input[name="amount"]');
  if (await amountInput.count()) {
    await amountInput.fill('1000');
  }
  // Click confirm or submit
  const confirmButton = page.locator('button:has-text("Confirm")');
  if (await confirmButton.count()) {
    await confirmButton.click();
  } else {
    // Fallback: try a generic submit
    await page.keyboard.press('Enter');
  }

  // Step 5: Check for success message or investment in dashboard
  await expect(page.locator('text=Investment request submitted')).toBeVisible({ timeout: 10000 });
}); 