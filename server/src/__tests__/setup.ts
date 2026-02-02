/**
 * Test Setup - Jest lifecycle hooks only
 */
import { beforeAll, afterAll } from "@jest/globals";

// Global test setup
beforeAll(() => {
  console.log("🧪 Starting API Tests...");
});

afterAll(() => {
  console.log("✅ API Tests Complete");
});

// Re-export config for backward compatibility
export { TEST_CONFIG } from "./config";
