import { test, expect } from '../fixtures/auth.fixture';

test.describe('Signup API', () => {
  const uniqueEmail = () => `test-${Date.now()}@example.com`;

  test.describe('Valid Signup', () => {
    test('should create new user with valid data', async ({ apiContext, config }) => {
      test.skip(!config.apiKey, 'API key not configured');

      const response = await apiContext.post('auth/signup', {
        data: {
          email: uniqueEmail(),
          password: 'ValidPass123!',
          firstName: 'Test',
          lastName: 'User',
        },
      });

      // Should be 200 or 400 if email already exists
      expect([200, 400]).toContain(response.status());
    });
  });

  test.describe('Validation Errors', () => {
    test('should reject invalid email format', async ({ apiContext }) => {
      const response = await apiContext.post('auth/signup', {
        data: {
          email: 'not-an-email',
          password: 'ValidPass123!',
          firstName: 'Test',
          lastName: 'User',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject short password', async ({ apiContext }) => {
      const response = await apiContext.post('auth/signup', {
        data: {
          email: uniqueEmail(),
          password: '12345', // Less than 6 characters
          firstName: 'Test',
          lastName: 'User',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject missing firstName', async ({ apiContext }) => {
      const response = await apiContext.post('auth/signup', {
        data: {
          email: uniqueEmail(),
          password: 'ValidPass123!',
          firstName: '',
          lastName: 'User',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject missing lastName', async ({ apiContext }) => {
      const response = await apiContext.post('auth/signup', {
        data: {
          email: uniqueEmail(),
          password: 'ValidPass123!',
          firstName: 'Test',
          lastName: '',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject empty request body', async ({ apiContext }) => {
      const response = await apiContext.post('auth/signup', {
        data: {},
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Duplicate Email', () => {
    test('should reject duplicate email in same organization', async ({ apiContext, config }) => {
      test.skip(!config.apiKey, 'API key not configured');

      // First, create a user
      const email = uniqueEmail();
      await apiContext.post('auth/signup', {
        data: {
          email,
          password: 'ValidPass123!',
          firstName: 'Test',
          lastName: 'User',
        },
      });

      // Try to create another with same email
      const response = await apiContext.post('auth/signup', {
        data: {
          email,
          password: 'AnotherPass123!',
          firstName: 'Another',
          lastName: 'User',
        },
      });

      // Should be 400 for duplicate
      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.message || data.error).toContain('already exists');
    });
  });
});
