import { test, expect } from '@playwright/test';
import path from 'path';

test('Customer Registration, Profile Photo & KYC E2E', async ({ page }) => {
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

  // Login (if non automatic)
  // await page.goto('https://www.glgcapitalgroup.com/login');
  // await page.fill('input[name="email"]', 'johndoe@example.com');
  // await page.fill('input[name="password"]', 'Test1234!');
  // await page.click('button[type="submit"]');

  // Vai al profilo
  await page.goto('https://www.glgcapitalgroup.com/profile');

  // Upload foto profilo
  const filePath = path.resolve(__dirname, 'fixtures/profile.jpg');
  const [fileChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.click('label input[type="file"]')
  ]);
  await fileChooser.setFiles(filePath);

  // Attendi che la foto sia visibile (img src aggiornata)
  await expect(page.locator('img[alt="Profile"]')).toBeVisible({ timeout: 10000 });

  // Vai alla pagina KYC
  await page.goto('https://www.glgcapitalgroup.com/kyc');

  // Upload documento KYC (simulato, aggiorna selector se necessario)
  const kycFilePath = path.resolve(__dirname, 'fixtures/kyc-doc.pdf');
  await page.setInputFiles('input[type="file"]', kycFilePath);

  // Attendi che il documento sia visibile o che compaia uno stato di successo
  await expect(page.locator('text=Uploaded')).toBeVisible({ timeout: 10000 });
}); 