/**
 * Test Setup - Jest lifecycle hooks only
 */
import { beforeAll, afterAll } from "@jest/globals";
import axios from "axios";
import { TEST_CONFIG } from "./config";

// Global test setup
beforeAll(async () => {
  console.log("🧪 Starting API Tests...");

  // Check if server is running
  try {
    await axios.get(`${TEST_CONFIG.API_BASE_URL}/health`, {
      timeout: 2000,
    });
    console.log("✅ Server is running");
  } catch (error) {
    console.warn(
      "⚠️  Warning: Server may not be running at",
      TEST_CONFIG.API_BASE_URL,
    );
    console.warn(
      "   Tests may fail. Start the server with: npm run dev:server",
    );
  }
});

afterAll(() => {
  console.log("✅ API Tests Complete");
});

// Re-export config for backward compatibility
export { TEST_CONFIG } from "./config";
