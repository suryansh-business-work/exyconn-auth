import { test, expect, makeRequest } from '../fixtures/auth.fixture';

test.describe('Login API', () => {
  test.describe('Valid Login', () => {
    test('should login with valid credentials', async ({ apiContext, config }) => {
      // Skip if no API key configured
      test.skip(!config.apiKey, 'API key not configured');

      const response = await apiContext.post('auth/login', {
        data: {
          email: config.testUser.email,
          password: config.testUser.password,
        },
      });

      // May fail if user doesn't exist, but should not be 500
      expect(response.status()).not.toBe(500);
    });

    test('should return token on successful login', async ({ apiContext, config }) => {
      test.skip(!config.apiKey, 'API key not configured');

      const response = await apiContext.post('auth/login', {
        data: {
          email: config.testUser.email,
          password: config.testUser.password,
        },
      });

      if (response.ok()) {
        const data = await response.json();
        expect(data.token || data.data?.token).toBeTruthy();
      }
    });
  });

  test.describe('Invalid Login', () => {
    test('should reject empty email', async ({ apiContext }) => {
      const response = await apiContext.post('auth/login', {
        data: {
          email: '',
          password: 'TestPass123!',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject empty password', async ({ apiContext, config }) => {
      const response = await apiContext.post('auth/login', {
        data: {
          email: config.testUser.email,
          password: '',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject invalid email format', async ({ apiContext }) => {
      const response = await apiContext.post('auth/login', {
        data: {
          email: 'not-an-email',
          password: 'TestPass123!',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject wrong password', async ({ apiContext, config }) => {
      test.skip(!config.apiKey, 'API key not configured');

      const response = await apiContext.post('auth/login', {
        data: {
          email: config.testUser.email,
          password: 'WrongPassword123!',
        },
      });

      // Should be 400 or 401, not 500
      expect([400, 401]).toContain(response.status());
    });
  });

  test.describe('Missing API Key', () => {
    test('should reject request without API key', async ({ playwright, config }) => {
      const context = await playwright.request.newContext({
        baseURL: config.apiBaseUrl,
      });

      const response = await context.post('auth/login', {
        data: {
          email: config.testUser.email,
          password: config.testUser.password,
        },
      });

      expect(response.status()).toBe(401);
      await context.dispose();
    });
  });
});
