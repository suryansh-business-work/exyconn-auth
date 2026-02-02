/**
 * Login Page UI Tests
 * Tests for the login page user interface and functionality
 */

// UI Test Configuration
export const UI_CONFIG = {
  BASE_URL: process.env.TEST_UI_URL || "http://localhost:4001",
  TIMEOUT: 10000,
};

// Login Page Selectors
export const LOGIN_SELECTORS = {
  // Form Elements
  emailInput: 'input[name="email"]',
  passwordInput: 'input[name="password"]',
  submitButton: 'button[type="submit"]',

  // Alternative selectors
  emailInputById: "#email",
  passwordInputById: "#password",
  loginButton: 'button:has-text("Login")',
  signInButton: 'button:has-text("Sign In")',

  // Links
  forgotPasswordLink: 'a[href*="forgot-password"]',
  signupLink: 'a[href*="signup"]',

  // Messages
  errorMessage: ".MuiAlert-root",
  successMessage: ".MuiAlert-standardSuccess",

  // Loading states
  loadingSpinner: ".MuiCircularProgress-root",

  // OAuth
  googleButton: 'button:has-text("Google")',
  googleLoginButton: 'button:has-text("Continue with Google")',
};

// Test Data
export const LOGIN_TEST_DATA = {
  validUser: {
    email: "test@example.com",
    password: "Test@123456",
  },
  invalidUser: {
    email: "invalid@example.com",
    password: "WrongPassword123",
  },
  invalidEmail: "invalid-email",
  weakPassword: "123",
};
