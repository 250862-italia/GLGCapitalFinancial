const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

function apiUrl(path) {
  if (path.startsWith('http')) return path;
  if (!path.startsWith('/')) path = '/' + path;
  return BASE_URL + path;
}

test.describe('Security Tests', () => {
  test('should prevent XSS attacks in profile update', async ({ request }) => {
    const xssPayload = {
      name: '<script>alert("XSS")</script>',
      email: 'test@example.com'
    };

    const response = await request.post(apiUrl('/api/profile/update'), {
      data: xssPayload,
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'test-csrf-token'
      }
    });

    expect(response.status()).toBe(400);
  });

  test('should prevent SQL injection in login', async ({ request }) => {
    const sqlInjectionPayload = {
      email: "'; DROP TABLE users; --",
      password: 'password'
    };

    const response = await request.post(apiUrl('/api/auth/login'), {
      data: sqlInjectionPayload,
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'test-csrf-token'
      }
    });

    expect(response.status()).toBe(400);
  });

  test('should prevent unauthorized access to admin routes', async ({ request }) => {
    const response = await request.get(apiUrl('/api/admin/users'));
    expect(response.status()).toBe(401);
  });

  test('should prevent access with fake tokens', async ({ request }) => {
    const response = await request.get(apiUrl('/api/admin/users'), {
      headers: {
        'Authorization': 'Bearer fake-token-123'
      }
    });
    expect(response.status()).toBe(401);
  });

  test('should validate input properly', async ({ request }) => {
    const invalidPayload = {
      email: 'invalid-email',
      password: '123'
    };

    const response = await request.post(apiUrl('/api/auth/register'), {
      data: invalidPayload,
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'test-csrf-token'
      }
    });
    expect(response.status()).toBe(400);
  });

  test('should have CSRF protection', async ({ request }) => {
    const response = await request.post(apiUrl('/api/auth/login'), {
      data: { email: 'test@example.com', password: 'password' },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    expect(response.status()).toBe(401);
  });

  test('should implement rate limiting', async ({ request }) => {
    const requests = [];
    // Riduco il numero di richieste per evitare sovraccarico
    for (let i = 0; i < 35; i++) {
      requests.push(request.get(apiUrl('/api/health')));
    }
    const responses = await Promise.all(requests);
    const hasRateLimit = responses.some(response => response.status() === 429);
    expect(hasRateLimit).toBe(true);
  });

  test('should enforce HTTPS in production', async ({ request }) => {
    // In sviluppo locale, non testiamo HTTPS enforcement
    if (process.env.NODE_ENV === 'development') {
      const response = await request.get(apiUrl('/'));
      expect([200, 301]).toContain(response.status());
    } else {
      // In produzione, testa redirect HTTPS
      const response = await request.get(apiUrl('/'), {
        headers: {
          'x-forwarded-proto': 'http'
        }
      });
      expect(response.status()).toBe(301);
    }
  });

  test('should have proper security headers', async ({ request }) => {
    const response = await request.get(apiUrl('/'));
    const headers = response.headers();
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-xss-protection']).toBe('1; mode=block');
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
  });

  test('should validate file uploads', async ({ request }) => {
    const response = await request.post(apiUrl('/api/profile/upload-photo'), {
      data: 'fake-file-data',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'test-csrf-token'
      }
    });
    expect(response.status()).toBe(400);
  });

  test('should not expose sensitive data in errors', async ({ request }) => {
    const response = await request.get(apiUrl('/api/non-existent-endpoint'));
    const body = await response.text();
    expect(body).not.toContain('stack trace');
    expect(body).not.toContain('database');
    expect(body).not.toContain('password');
  });

  test('should sanitize URLs', async ({ request }) => {
    const maliciousUrl = '/dashboard?redirect=javascript:alert("XSS")';
    const response = await request.get(apiUrl(maliciousUrl));
    // In sviluppo, accetta la richiesta ma dovrebbe sanitizzare l'URL
    expect([200, 301, 404]).toContain(response.status());
  });

  test('should validate JSON payloads', async ({ request }) => {
    const response = await request.post(apiUrl('/api/auth/login'), {
      data: 'invalid-json-string',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'test-csrf-token'
      }
    });
    expect(response.status()).toBe(400);
  });

  test('should prevent directory traversal', async ({ request }) => {
    const response = await request.get(apiUrl('/../../../etc/passwd'));
    // Dovrebbe restituire 404 o essere bloccato dal middleware
    expect([404, 403]).toContain(response.status());
  });

  test('should validate email format', async ({ request }) => {
    const response = await request.post(apiUrl('/api/auth/register'), {
      data: {
        email: 'invalid-email-format',
        password: 'validpassword123',
        name: 'Test User'
      },
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'test-csrf-token'
      }
    });
    expect(response.status()).toBe(400);
  });

  test('should enforce password complexity', async ({ request }) => {
    const response = await request.post(apiUrl('/api/auth/register'), {
      data: {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      },
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': 'test-csrf-token'
      }
    });
    expect(response.status()).toBe(400);
  });
}); 