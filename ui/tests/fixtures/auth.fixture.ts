import { test as base, expect, APIRequestContext } from '@playwright/test';

// Test configuration interface
interface TestConfig {
  apiBaseUrl: string;
  uiBaseUrl: string;
  apiKey: string;
  testUser: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  };
}

// Auth fixtures for API and E2E tests
interface AuthFixtures {
  config: TestConfig;
  apiContext: APIRequestContext;
  authToken: string;
}

// Create custom test with fixtures
export const test = base.extend<AuthFixtures>({
  config: async ({ }, use) => {
    const config: TestConfig = {
      apiBaseUrl: (process.env.API_BASE_URL || 'http://localhost:4002/v1/api').replace(/\/?$/, '/'),
      uiBaseUrl: (process.env.UI_BASE_URL || 'http://localhost:4001').replace(/\/?$/, '/'),
      apiKey: process.env.TEST_ORG_API_KEY || '',
      testUser: {
        email: process.env.TEST_USER_EMAIL || `test-${Date.now()}@example.com`,
        password: process.env.TEST_USER_PASSWORD || 'TestPass123!',
        firstName: process.env.TEST_USER_FIRST_NAME || 'Test',
        lastName: process.env.TEST_USER_LAST_NAME || 'User',
      },
    };
    await use(config);
  },

  apiContext: async ({ playwright, config }, use) => {
    const context = await playwright.request.newContext({
      baseURL: config.apiBaseUrl,
      extraHTTPHeaders: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
      },
    });
    await use(context);
    await context.dispose();
  },

  authToken: async ({ apiContext, config }, use) => {
    // Try to login, if fails, signup first
    let token = '';
    const loginResponse = await apiContext.post('auth/login', {
      data: {
        email: config.testUser.email,
        password: config.testUser.password,
      },
    });

    if (loginResponse.ok()) {
      const data = await loginResponse.json();
      token = data.token || data.data?.token || '';
    }

    await use(token);
  },
});

export { expect };

// Helper function for API requests
export const makeRequest = async (
  context: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: object,
  token?: string,
) => {
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  switch (method) {
    case 'GET':
      return context.get(endpoint, { headers });
    case 'POST':
      return context.post(endpoint, { data, headers });
    case 'PUT':
      return context.put(endpoint, { data, headers });
    case 'DELETE':
      return context.delete(endpoint, { headers });
  }
};
