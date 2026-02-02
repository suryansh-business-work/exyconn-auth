/**
 * useLocalStorage - Re-exports from @exyconn/common
 */

export {
  useLocalStorage,
  useSessionStorage,
} from "@exyconn/common/client/hooks";

// Constants for localStorage keys - Keep these as they are app-specific
export const STORAGE_KEYS = {
  GOD_TOKEN: "godToken",
  GOD_USER_DATA: "godUserData",
  AUTH_TOKEN: "authToken",
  USER_DATA: "userData",
  USER_TOKEN: "userToken",
  ORG_ID: "orgId",
  API_KEY: "apiKey",
} as const;

/**
 * Simple localStorage utilities for non-hook usage
 * These are kept as thin wrappers for backward compatibility
 */
export const localStorageUtils = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : (defaultValue ?? null);
    } catch {
      return defaultValue ?? null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore errors
    }
  },

  remove: (key: string): void => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  },

  clear: (): void => {
    try {
      window.localStorage.clear();
    } catch {
      // Ignore errors
    }
  },

  getString: (key: string): string | null => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },

  setString: (key: string, value: string): void => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore errors
    }
  },
};
