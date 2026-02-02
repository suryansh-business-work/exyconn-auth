import { test, expect } from '../fixtures/auth.fixture';

test.describe('Organization Resolution API @api', () => {
  const TEST_DOMAIN = 'auth.exyconn.com';

  test('should resolve API key by domain', async ({ apiContext }) => {
    const response = await apiContext.get(`auth/apikey-by-domain`, {
      params: { domain: TEST_DOMAIN }
    });

    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.status).toBe('success');

    if (body.data && body.data.matched) {
      expect(body.data.apiKey).toBeDefined();
      expect(typeof body.data.apiKey).toBe('string');
    }
  });

  test('should fetch organization details by API key', async ({ apiContext, config }) => {
    const response = await apiContext.get(`auth/apikey-to-organization`);

    const body = await response.json();

    expect(response.status()).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data.orgName).toBeDefined();
    expect(body.data._id).toBeDefined();
  });

  test('should return 401 for invalid API key on apikey-to-organization', async ({ playwright, config }) => {
    const context = await playwright.request.newContext({
      baseURL: config.apiBaseUrl,
      extraHTTPHeaders: {
        'x-api-key': 'invalid-key-123',
        'Content-Type': 'application/json',
      },
    });

    const response = await context.get(`auth/apikey-to-organization`);
    expect(response.status()).toBe(401);
  });
});
