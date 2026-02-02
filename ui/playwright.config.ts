import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables BEFORE config is parsed
// Use absolute path and quiet mode to suppress repeated logs
const envResult = dotenv.config({
  path: path.resolve(__dirname, '.env.test'),
  override: true // Ensure these values override any existing env vars
});

if (envResult.error) {
  console.error('Failed to load .env.test:', envResult.error);
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],

  use: {
    baseURL: process.env.UI_BASE_URL || 'http://localhost:4001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // API Tests - run serially to avoid rate limiting
    {
      name: 'api',
      testMatch: '**/api/**/*.spec.ts',
      use: {},
      fullyParallel: false, // Prevent rate limiting by running tests serially
    },
    // UI E2E Tests - Chromium
    {
      name: 'chromium',
      testMatch: '**/e2e/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // UI E2E Tests - Firefox (with extended timeout)
    {
      name: 'firefox',
      testMatch: '**/e2e/**/*.spec.ts',
      use: {
        ...devices['Desktop Firefox'],
      },
      timeout: 60000, // Firefox is slower, increase timeout
    },
    // Security Tests - run serially to avoid rate limiting
    {
      name: 'security',
      testMatch: '**/security/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: false,
    },
  ],

  // Web server configuration - only in CI
  // For local development, start the servers manually
  ...(process.env.CI ? {
    webServer: [
      {
        command: 'npm run dev',
        url: 'http://localhost:4001',
        reuseExistingServer: false,
        timeout: 60 * 1000,
      },
    ],
  } : {}),
});
