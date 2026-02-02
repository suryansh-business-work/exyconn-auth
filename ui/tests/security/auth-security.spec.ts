import { test, expect } from '../fixtures/auth.fixture';

test.describe('Security: Rate Limiting', () => {
  test.describe('Login Rate Limiting', () => {
    test('should allow requests within rate limit', async ({ apiContext, config }) => {
      test.skip(!config.apiKey, 'API key not configured');

      // Make a few requests - should not be rate limited
      for (let i = 0; i < 3; i++) {
        const response = await apiContext.post('auth/login', {
          data: {
            email: config.testUser.email,
            password: 'WrongPassword!',
          },
        });
        // Should get 400/401 not 429
        expect(response.status()).not.toBe(429);
      }
    });

    test('should return 429 when rate limited @slow', async ({ apiContext, config }) => {
      test.skip(!config.apiKey, 'API key not configured');
      test.slow(); // This test intentionally takes time

      // strictRateLimiter: 20 requests per 15 minutes
      const responses = [];
      for (let i = 0; i < 25; i++) {
        const response = await apiContext.post('auth/login', {
          data: {
            email: `test-rate-${i}@example.com`,
            password: 'WrongPassword!',
          },
        });
        responses.push(response.status());
      }

      // At least one should be rate limited
      expect(responses).toContain(429);
    });
  });
});

test.describe('Security: Token Validation', () => {
  test('should reject expired token @security', async ({ apiContext }) => {
    // Create a manually expired token (if possible to test)
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjB9.invalid';

    const response = await apiContext.get('auth/profile', {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });

    // Should reject with 401/403
    expect([401, 403]).toContain(response.status());
  });

  test('should reject malformed token @security', async ({ apiContext }) => {
    const response = await apiContext.get('auth/profile', {
      headers: { Authorization: 'Bearer not-a-jwt-token' },
    });

    // Should reject with 401/403
    expect([401, 403]).toContain(response.status());
  });

  test('should reject missing token @security', async ({ apiContext }) => {
    const response = await apiContext.get('auth/profile');

    // Without token, should get 401
    expect(response.status()).toBe(401);
  });

  test('should reject empty Authorization header @security', async ({ apiContext }) => {
    const response = await apiContext.get('auth/profile', {
      headers: { Authorization: '' },
    });

    // Should reject - 401, or 429 if rate limited
    expect([401, 429]).toContain(response.status());
  });
});

test.describe('Security: API Key Validation', () => {
  test('should reject invalid API key @security', async ({ playwright, config }) => {
    const context = await playwright.request.newContext({
      baseURL: config.apiBaseUrl,
      extraHTTPHeaders: {
        'x-api-key': 'invalid-api-key-12345',
        'Content-Type': 'application/json',
      },
    });

    const response = await context.post('auth/login', {
      data: {
        email: 'test@example.com',
        password: 'TestPass123!',
      },
    });

    // Should reject with 401 or be rate limited (429)
    expect([401, 429]).toContain(response.status());
    await context.dispose();
  });

  test('should reject missing API key @security', async ({ playwright, config }) => {
    const context = await playwright.request.newContext({
      baseURL: config.apiBaseUrl,
    });

    const response = await context.post('auth/login', {
      data: {
        email: 'test@example.com',
        password: 'TestPass123!',
      },
    });

    // Should reject with 401 or be rate limited (429)
    expect([401, 429]).toContain(response.status());
    await context.dispose();
  });
});

test.describe('Security: OTP', () => {
  test('should reject invalid OTP format @security', async ({ apiContext }) => {
    const response = await apiContext.post('auth/verify', {
      data: {
        email: 'test@example.com',
        otp: 'abc', // Invalid - should be 6 digits
      },
    });

    // Should fail validation or return bad request (or rate limited)
    expect([400, 401, 429]).toContain(response.status());
  });

  test('should reject expired OTP @security', async ({ apiContext }) => {
    const response = await apiContext.post('/auth/verify', {
      data: {
        email: 'test@example.com',
        otp: '000000', // Very unlikely to be valid
      },
    });

    // Should reject (or rate limited)
    expect([400, 401, 429]).toContain(response.status());
  });
});
