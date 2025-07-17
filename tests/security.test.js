const { test, expect } = require('@playwright/test');

// Test di sicurezza per GLG Capital Financial
test.describe('Security Tests', () => {
  const baseUrl = process.env.SITE_URL || 'https://www.glgcapitalgroup.com';
  
  // Test XSS
  test('should prevent XSS attacks in profile update', async ({ request }) => {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      '&#60;script&#62;alert("XSS")&#60;/script&#62;'
    ];

    for (const payload of xssPayloads) {
      const response = await request.put(`${baseUrl}/api/profile/update`, {
        data: {
          userId: 'test-user',
          updates: {
            firstName: payload,
            lastName: payload
          }
        }
      });

      // Verifica che il payload non venga riflesso nella risposta
      const responseText = await response.text();
      expect(responseText).not.toContain(payload);
      
      // Verifica che non ci siano script nella risposta
      expect(responseText).not.toMatch(/<script[^>]*>/i);
    }
  });

  // Test SQL Injection
  test('should prevent SQL injection in login', async ({ request }) => {
    const sqlInjectionPayloads = [
      "' OR 1=1 --",
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "admin'--",
      "admin'/*",
      "' OR 1=1#",
      "' OR 1=1/*"
    ];

    for (const payload of sqlInjectionPayloads) {
      const response = await request.post(`${baseUrl}/api/auth/login`, {
        data: {
          email: payload,
          password: 'test123'
        }
      });

      // Verifica che non ci siano errori di database esposti
      const responseText = await response.text();
      expect(responseText).not.toContain('SQL');
      expect(responseText).not.toContain('syntax error');
      expect(responseText).not.toContain('ORA-');
      expect(responseText).not.toContain('MySQL');
    }
  });

  // Test accesso non autorizzato
  test('should prevent unauthorized access to admin routes', async ({ request }) => {
    const adminRoutes = [
      '/api/admin/clients',
      '/api/admin/investments',
      '/api/admin/analytics',
      '/api/admin/team',
      '/api/admin/settings'
    ];

    for (const route of adminRoutes) {
      const response = await request.get(`${baseUrl}${route}`);
      
      // Verifica che l'accesso sia negato senza autenticazione
      expect(response.status()).toBe(401);
    }
  });

  // Test accesso non autorizzato con token falso
  test('should prevent access with fake tokens', async ({ request }) => {
    const fakeTokens = [
      'fake-token',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake',
      'Bearer fake-token',
      'null',
      'undefined'
    ];

    for (const token of fakeTokens) {
      const response = await request.get(`${baseUrl}/api/admin/clients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      expect(response.status()).toBe(401);
    }
  });

  // Test input validation
  test('should validate input properly', async ({ request }) => {
    const invalidInputs = [
      { email: 'invalid-email', password: 'short' },
      { email: '', password: '' },
      { email: 'test@test.com', password: 'a'.repeat(1000) },
      { email: 'a'.repeat(1000) + '@test.com', password: 'test123' },
      { email: 'test@test.com', password: 'test123', firstName: 'a'.repeat(1000) }
    ];

    for (const input of invalidInputs) {
      const response = await request.post(`${baseUrl}/api/auth/register`, {
        data: input
      });
      
      // Verifica che ci sia una validazione appropriata
      expect(response.status()).toBe(400);
    }
  });

  // Test CSRF protection
  test('should have CSRF protection', async ({ request }) => {
    const response = await request.post(`${baseUrl}/api/profile/update`, {
      data: { userId: 'test', updates: {} }
    });
    
    // Verifica che ci sia protezione CSRF
    expect(response.status()).toBe(401);
  });

  // Test rate limiting
  test('should implement rate limiting', async ({ request }) => {
    const requests = [];
    
    // Invia 10 richieste rapidamente
    for (let i = 0; i < 10; i++) {
      requests.push(
        request.post(`${baseUrl}/api/auth/login`, {
          data: { email: 'test@test.com', password: 'test123' }
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // Verifica che almeno una richiesta sia stata limitata
    const hasRateLimit = responses.some(response => response.status() === 429);
    expect(hasRateLimit).toBe(true);
  });

  // Test HTTPS enforcement
  test('should enforce HTTPS', async ({ request }) => {
    const response = await request.get('http://www.glgcapitalgroup.com');
    
    // Verifica redirect a HTTPS
    expect(response.status()).toBe(301);
  });

  // Test security headers
  test('should have proper security headers', async ({ request }) => {
    const response = await request.get(`${baseUrl}`);
    const headers = response.headers();
    
    // Verifica header di sicurezza
    expect(headers['x-frame-options']).toBeDefined();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBeDefined();
    expect(headers['strict-transport-security']).toBeDefined();
  });

  // Test file upload security
  test('should validate file uploads', async ({ request }) => {
    const maliciousFiles = [
      { name: 'test.php', type: 'application/x-php' },
      { name: 'test.exe', type: 'application/x-executable' },
      { name: 'test.js', type: 'application/javascript' },
      { name: 'test.html', type: 'text/html' }
    ];

    for (const file of maliciousFiles) {
      const formData = new FormData();
      formData.append('photo', new Blob(['test'], { type: file.type }), file.name);
      formData.append('user_id', 'test-user');

      const response = await request.post(`${baseUrl}/api/profile/upload-photo`, {
        data: formData
      });
      
      // Verifica che i file malevoli siano rifiutati
      expect(response.status()).toBe(400);
    }
  });

  // Test data exposure
  test('should not expose sensitive data in errors', async ({ request }) => {
    const response = await request.get(`${baseUrl}/api/nonexistent`);
    
    const responseText = await response.text();
    
    // Verifica che non ci siano informazioni sensibili esposte
    expect(responseText).not.toContain('password');
    expect(responseText).not.toContain('token');
    expect(responseText).not.toContain('secret');
    expect(responseText).not.toContain('key');
    expect(responseText).not.toContain('stack trace');
  });
}); 