/**
 * Test Setup - Jest lifecycle hooks only
 */
import { beforeAll, afterAll } from "@jest/globals";
import axios from "axios";
import { TEST_CONFIG } from "./config";

// Track server availability for conditional tests
export let isServerAvailable = false;

// Global test setup
beforeAll(async () => {
  console.log("🧪 Starting API Tests...");

  // Check if server is running
  try {
    await axios.get(`${TEST_CONFIG.API_BASE_URL}/health`, {
      timeout: 2000,
    });
    console.log("✅ Server is running");
    isServerAvailable = true;
  } catch (error) {
    console.warn(
      "⚠️  Warning: Server is not running at",
      TEST_CONFIG.API_BASE_URL,
    );
    console.warn(
      "   Integration tests will be skipped. To run them, start the server with: npm run dev",
    );
    isServerAvailable = false;
  }
});

afterAll(() => {
  console.log("✅ API Tests Complete");
});

// Re-export config for backward compatibility
export { TEST_CONFIG } from "./config";
