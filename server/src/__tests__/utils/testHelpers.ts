/**
 * Test Helpers - Common utilities for API tests
 */

/**
 * Generate a random string for unique identifiers
 */
const randomId = (): string => Math.random().toString(36).substring(2, 10);

/**
 * Generate a unique test email
 */
export const generateTestEmail = (): string => {
  return `test_${randomId()}@test.com`;
};

/**
 * Generate test user data
 */
export const generateTestUser = (overrides?: Partial<TestUser>): TestUser => {
  return {
    email: generateTestEmail(),
    password: "Test@123456",
    firstName: "Test",
    lastName: "User",
    ...overrides,
  };
};

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Wait for specified milliseconds
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Check if response is successful
 */
export const isSuccess = (status: number): boolean => {
  return status >= 200 && status < 300;
};

/**
 * Extract data from standard API response
 */
export const extractData = <T>(response: any): T | null => {
  return response?.data?.data || response?.data || null;
};

/**
 * Extract message from API response
 */
export const extractMessage = (response: any): string => {
  return response?.data?.message || "";
};
