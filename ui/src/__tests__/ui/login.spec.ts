/**
 * Login Page UI Tests
 * Browser-based tests using Playwright
 */
import { test, expect } from "@playwright/test";
import { UI_CONFIG, LOGIN_SELECTORS, LOGIN_TEST_DATA } from "./login.config";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${UI_CONFIG.BASE_URL}/login`);
  });

  test.describe("Page Load", () => {
    test("should display login form", async ({ page }) => {
      // Check for email input
      const emailInput = await page.locator(LOGIN_SELECTORS.emailInput);
      await expect(emailInput).toBeVisible();

      // Check for password input
      const passwordInput = await page.locator(LOGIN_SELECTORS.passwordInput);
      await expect(passwordInput).toBeVisible();

      // Check for submit button
      const submitButton = await page.locator(LOGIN_SELECTORS.submitButton);
      await expect(submitButton).toBeVisible();
    });

    test("should have forgot password link", async ({ page }) => {
      const forgotLink = await page.locator(LOGIN_SELECTORS.forgotPasswordLink);
      await expect(forgotLink).toBeVisible();
    });

    test("should have signup link", async ({ page }) => {
      const signupLink = await page.locator(LOGIN_SELECTORS.signupLink);
      await expect(signupLink).toBeVisible();
    });
  });

  test.describe("Form Validation", () => {
    test("should show error for empty form submission", async ({ page }) => {
      // Click submit without filling form
      await page.click(LOGIN_SELECTORS.submitButton);

      // Wait for validation error
      await page.waitForTimeout(500);

      // Check for HTML5 validation or error message
      const emailInput = await page.locator(LOGIN_SELECTORS.emailInput);
      const isInvalid = await emailInput.evaluate(
        (el: HTMLInputElement) => !el.validity.valid,
      );
      expect(isInvalid).toBe(true);
    });

    test("should show error for invalid email format", async ({ page }) => {
      await page.fill(LOGIN_SELECTORS.emailInput, LOGIN_TEST_DATA.invalidEmail);
      await page.fill(
        LOGIN_SELECTORS.passwordInput,
        LOGIN_TEST_DATA.validUser.password,
      );
      await page.click(LOGIN_SELECTORS.submitButton);

      await page.waitForTimeout(500);

      const emailInput = await page.locator(LOGIN_SELECTORS.emailInput);
      const isInvalid = await emailInput.evaluate(
        (el: HTMLInputElement) => !el.validity.valid,
      );
      expect(isInvalid).toBe(true);
    });
  });

  test.describe("Login Functionality", () => {
    test("should show error for invalid credentials", async ({ page }) => {
      await page.fill(
        LOGIN_SELECTORS.emailInput,
        LOGIN_TEST_DATA.invalidUser.email,
      );
      await page.fill(
        LOGIN_SELECTORS.passwordInput,
        LOGIN_TEST_DATA.invalidUser.password,
      );
      await page.click(LOGIN_SELECTORS.submitButton);

      // Wait for API response
      await page.waitForTimeout(2000);

      // Check for error message
      const errorMessage = await page.locator(LOGIN_SELECTORS.errorMessage);
      await expect(errorMessage).toBeVisible({ timeout: 5000 });
    });

    test("should navigate to forgot password page", async ({ page }) => {
      await page.click(LOGIN_SELECTORS.forgotPasswordLink);
      await expect(page).toHaveURL(/forgot-password/);
    });

    test("should navigate to signup page", async ({ page }) => {
      await page.click(LOGIN_SELECTORS.signupLink);
      await expect(page).toHaveURL(/signup/);
    });
  });

  test.describe("OAuth", () => {
    test("should have Google login option if configured", async ({ page }) => {
      // Google button may or may not be present based on org config
      const googleButton = await page
        .locator(LOGIN_SELECTORS.googleButton)
        .or(page.locator(LOGIN_SELECTORS.googleLoginButton));

      // Check if visible (org may not have OAuth configured)
      const isVisible = await googleButton.isVisible().catch(() => false);

      if (isVisible) {
        await expect(googleButton).toBeEnabled();
      }
    });
  });
});
