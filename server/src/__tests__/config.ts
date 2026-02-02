/**
 * Test Configuration - NO Jest globals here
 */

// Default test configuration
export const TEST_CONFIG = {
  API_BASE_URL: process.env.TEST_API_URL || "http://localhost:4002/v1/api",
  TEST_API_KEY: process.env.TEST_API_KEY || "test-api-key",
  TIMEOUT: 10000,
};
