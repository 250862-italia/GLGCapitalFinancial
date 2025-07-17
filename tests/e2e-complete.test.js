const { test, expect } = require('@playwright/test');

// Test E2E completi per GLG Capital Financial
test.describe('End-to-End Tests', () => {
  const baseUrl = process.env.SITE_URL || 'https://www.glgcapitalgroup.com';
  
  // Test registrazione utente completo
  test('complete user registration flow', async ({ page }) => {
    await page.goto(`${baseUrl}/register`);
    
    // Compila form di registrazione
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="country"]', 'Italy');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verifica redirect a login o dashboard
    await expect(page).toHaveURL(/\/login|\/dashboard/);
    
    // Verifica messaggio di successo
    await expect(page.locator('text=successfully registered')).toBeVisible();
  });

  // Test login utente
  test('user login flow', async ({ page }) => {
    await page.goto(`${baseUrl}/login`);
    
    // Compila form di login
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verifica redirect a dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    
    // Verifica che l'utente sia loggato
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  // Test dashboard utente
  test('user dashboard functionality', async ({ page }) => {
    // Login first
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Verifica elementi dashboard
    await expect(page.locator('text=My Investments')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Request Documentation')).toBeVisible();
    
    // Test navigazione
    await page.click('text=Profile');
    await expect(page).toHaveURL(/\/profile/);
    
    await page.goBack();
    await page.click('text=My Investments');
    await expect(page).toHaveURL(/\/dashboard\/investments/);
  });

  // Test profilo utente
  test('user profile management', async ({ page }) => {
    // Login first
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Vai al profilo
    await page.goto(`${baseUrl}/profile`);
    
    // Verifica che il profilo si carichi
    await expect(page.locator('text=User Profile')).toBeVisible();
    
    // Test modifica profilo
    await page.click('text=Edit');
    
    // Modifica campi
    await page.fill('input[name="firstName"]', 'Updated');
    await page.fill('input[name="lastName"]', 'Name');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.fill('input[name="address"]', '123 Test Street');
    await page.fill('input[name="city"]', 'Test City');
    await page.fill('input[name="country"]', 'Test Country');
    
    // Salva modifiche
    await page.click('text=Save');
    
    // Verifica che le modifiche siano salvate
    await expect(page.locator('text=Updated Name')).toBeVisible();
  });

  // Test investimenti
  test('investment flow', async ({ page }) => {
    // Login first
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Vai agli investimenti
    await page.goto(`${baseUrl}/dashboard/investments`);
    
    // Verifica che gli investimenti si carichino
    await expect(page.locator('text=Investment Packages')).toBeVisible();
    
    // Test selezione pacchetto
    const packageCard = page.locator('[data-testid="package-card"]').first();
    await packageCard.click();
    
    // Verifica dettagli pacchetto
    await expect(page.locator('text=Package Details')).toBeVisible();
  });

  // Test admin dashboard
  test('admin dashboard access', async ({ page }) => {
    // Login come admin
    await page.goto(`${baseUrl}/admin/login`);
    await page.fill('input[name="email"]', 'admin@glgcapital.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Verifica accesso admin
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    
    // Test navigazione admin
    await page.click('text=Clients');
    await expect(page).toHaveURL(/\/admin\/clients/);
    
    await page.click('text=Investments');
    await expect(page).toHaveURL(/\/admin\/investments/);
    
    await page.click('text=Analytics');
    await expect(page).toHaveURL(/\/admin\/analytics/);
  });

  // Test gestione clienti (admin)
  test('admin client management', async ({ page }) => {
    // Login come admin
    await page.goto(`${baseUrl}/admin/login`);
    await page.fill('input[name="email"]', 'admin@glgcapital.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Vai alla gestione clienti
    await page.goto(`${baseUrl}/admin/clients`);
    
    // Verifica lista clienti
    await expect(page.locator('text=Client Management')).toBeVisible();
    
    // Test ricerca cliente
    await page.fill('input[placeholder*="search"]', 'test');
    await page.keyboard.press('Enter');
    
    // Verifica risultati ricerca
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });

  // Test gestione investimenti (admin)
  test('admin investment management', async ({ page }) => {
    // Login come admin
    await page.goto(`${baseUrl}/admin/login`);
    await page.fill('input[name="email"]', 'admin@glgcapital.com');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Vai alla gestione investimenti
    await page.goto(`${baseUrl}/admin/investments`);
    
    // Verifica lista investimenti
    await expect(page.locator('text=Investment Management')).toBeVisible();
    
    // Test filtri
    await page.selectOption('select[name="status"]', 'active');
    await expect(page.locator('text=Active Investments')).toBeVisible();
  });

  // Test responsive design
  test('responsive design on mobile', async ({ page }) => {
    // Imposta viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto(`${baseUrl}`);
    
    // Verifica che il menu mobile sia presente
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Test navigazione mobile
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Profile')).toBeVisible();
  });

  // Test error handling
  test('error handling and user feedback', async ({ page }) => {
    // Test login con credenziali errate
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Verifica messaggio di errore
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    
    // Test pagina 404
    await page.goto(`${baseUrl}/nonexistent-page`);
    await expect(page.locator('text=Page not found')).toBeVisible();
  });

  // Test performance
  test('page load performance', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(`${baseUrl}`);
    
    const loadTime = Date.now() - startTime;
    
    // Verifica che il caricamento sia sotto i 3 secondi
    expect(loadTime).toBeLessThan(3000);
    
    // Verifica che non ci siano errori di console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    expect(consoleErrors.length).toBe(0);
  });

  // Test accessibilità
  test('accessibility compliance', async ({ page }) => {
    await page.goto(`${baseUrl}`);
    
    // Verifica che tutti i link abbiano alt text
    const links = await page.locator('a').all();
    for (const link of links) {
      const ariaLabel = await link.getAttribute('aria-label');
      const text = await link.textContent();
      expect(ariaLabel || text).toBeTruthy();
    }
    
    // Verifica che tutti i form abbiano labels
    const inputs = await page.locator('input').all();
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const label = await page.locator(`label[for="${id}"]`).count();
      expect(label).toBeGreaterThan(0);
    }
  });

  // Test logout
  test('logout functionality', async ({ page }) => {
    // Login first
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Verifica che l'utente sia loggato
    await expect(page.locator('text=Welcome back')).toBeVisible();
    
    // Logout
    await page.click('text=Logout');
    
    // Verifica redirect alla home
    await expect(page).toHaveURL(`${baseUrl}/`);
    
    // Verifica che l'utente non sia più loggato
    await expect(page.locator('text=Login')).toBeVisible();
  });
}); 