/**
 * Login Page E2E Tests
 * Browser-based tests using Playwright
 */
import { test, expect } from '@playwright/test';

// Test Configuration
const UI_URL = process.env.UI_BASE_URL || 'http://localhost:4001';

// Login Page Selectors
const SELECTORS = {
  emailInput: 'input[name="email"], input[type="email"], #email',
  passwordInput: 'input[name="password"], input[type="password"], #password',
  submitButton: 'button[type="submit"]',
  errorMessage: '.MuiAlert-root',
  forgotPasswordLink: 'a[href*="forgot-password"]',
  signupLink: 'a[href*="signup"]',
  googleButton: 'button:has-text("Google")',
};

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${UI_URL}/login`);
  });

  test('should display login form', async ({ page }) => {
    // Check for email input
    await expect(page.locator(SELECTORS.emailInput).first()).toBeVisible();

    // Check for password input
    await expect(page.locator(SELECTORS.passwordInput).first()).toBeVisible();

    // Check for submit button
    await expect(page.locator(SELECTORS.submitButton).first()).toBeVisible();
  });

  test('should show error for empty form submission', async ({ page }) => {
    // Click submit without filling form
    await page.locator(SELECTORS.submitButton).first().click();

    // Wait for validation
    await page.waitForTimeout(500);

    // Check for HTML5 validation on email input
    const emailInput = page.locator(SELECTORS.emailInput).first();
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should show error for invalid email format', async ({ page }) => {
    await page.locator(SELECTORS.emailInput).first().fill('invalid-email');
    await page.locator(SELECTORS.passwordInput).first().fill('Test@123456');
    await page.locator(SELECTORS.submitButton).first().click();

    await page.waitForTimeout(500);

    const emailInput = page.locator(SELECTORS.emailInput).first();
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBe(true);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.locator(SELECTORS.emailInput).first().fill('invalid@example.com');
    await page.locator(SELECTORS.passwordInput).first().fill('WrongPassword123');
    await page.locator(SELECTORS.submitButton).first().click();

    // Wait for API response
    await page.waitForTimeout(3000);

    // Check for error message
    const errorMessage = page.locator(SELECTORS.errorMessage);
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    const forgotLink = page.locator(SELECTORS.forgotPasswordLink).first();

    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await expect(page).toHaveURL(/forgot-password/);
    }
  });

  test('should navigate to signup page', async ({ page }) => {
    const signupLink = page.locator(SELECTORS.signupLink).first();

    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/signup/);
    }
  });
});
