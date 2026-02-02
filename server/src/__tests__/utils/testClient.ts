/**
 * Test HTTP Client - Utilities for making API requests in tests
 */
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { TEST_CONFIG } from "../config";

// Create axios instance for tests
const testClient: AxiosInstance = axios.create({
  baseURL: TEST_CONFIG.API_BASE_URL,
  timeout: TEST_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Set API key header for authenticated requests
 */
export const setApiKey = (apiKey: string): void => {
  testClient.defaults.headers.common["x-api-key"] = apiKey;
};

/**
 * Set auth token header for authenticated requests
 */
export const setAuthToken = (token: string): void => {
  testClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

/**
 * Clear all auth headers
 */
export const clearAuth = (): void => {
  delete testClient.defaults.headers.common["x-api-key"];
  delete testClient.defaults.headers.common["Authorization"];
};

/**
 * GET request
 */
export const get = async <T = any>(
  url: string,
  params?: Record<string, any>,
): Promise<AxiosResponse<T>> => {
  return testClient.get<T>(url, { params });
};

/**
 * POST request
 */
export const post = async <T = any>(
  url: string,
  data?: any,
): Promise<AxiosResponse<T>> => {
  return testClient.post<T>(url, data);
};

/**
 * PUT request
 */
export const put = async <T = any>(
  url: string,
  data?: any,
): Promise<AxiosResponse<T>> => {
  return testClient.put<T>(url, data);
};

/**
 * DELETE request
 */
export const del = async <T = any>(
  url: string,
  params?: Record<string, any>,
): Promise<AxiosResponse<T>> => {
  return testClient.delete<T>(url, { params });
};

export default {
  get,
  post,
  put,
  delete: del,
  setApiKey,
  setAuthToken,
  clearAuth,
};
