/**
 * HTTP Client - Local implementation replacing @exyconn/common/client/http
 */

import axiosLib, { AxiosInstance, AxiosResponse } from "axios";

// ===================== Types =====================

export interface ApiResponse<T = any> {
  message: string;
  data: T;
  status: string;
  statusCode: number;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  columns?: { name: string; datatype: string; required: boolean }[];
  paginationData?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
    [key: string]: unknown;
  };
}

// ===================== Axios Instance =====================

export const axios: AxiosInstance = axiosLib.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ===================== Request Methods =====================

export const getRequest = async <T = any>(
  url: string,
  config?: any,
): Promise<AxiosResponse<ApiResponse<T>>> => {
  return axios.get<ApiResponse<T>>(url, config);
};

export const postRequest = async <T = any>(
  url: string,
  data?: any,
  config?: any,
): Promise<AxiosResponse<ApiResponse<T>>> => {
  return axios.post<ApiResponse<T>>(url, data, config);
};

export const putRequest = async <T = any>(
  url: string,
  data?: any,
  config?: any,
): Promise<AxiosResponse<ApiResponse<T>>> => {
  return axios.put<ApiResponse<T>>(url, data, config);
};

export const patchRequest = async <T = any>(
  url: string,
  data?: any,
  config?: any,
): Promise<AxiosResponse<ApiResponse<T>>> => {
  return axios.patch<ApiResponse<T>>(url, data, config);
};

export const deleteRequest = async <T = any>(
  url: string,
  data?: any,
  config?: any,
): Promise<AxiosResponse<ApiResponse<T>>> => {
  return axios.delete<ApiResponse<T>>(url, { ...config, data });
};

export const uploadFile = async <T = any>(
  url: string,
  formData: FormData,
  config?: any,
): Promise<AxiosResponse<ApiResponse<T>>> => {
  return axios.post<ApiResponse<T>>(url, formData, {
    ...config,
    headers: {
      ...config?.headers,
      "Content-Type": "multipart/form-data",
    },
  });
};

// ===================== Response Parsers =====================

export const extractData = <T = any>(
  response: AxiosResponse<ApiResponse<T>>,
): T => {
  return response?.data?.data;
};

export const extractMessage = (
  response: AxiosResponse<ApiResponse>,
): string => {
  return response?.data?.message || "";
};

export const isSuccess = (response: AxiosResponse<ApiResponse>): boolean => {
  const code = response?.data?.statusCode || response?.status;
  return code >= 200 && code < 300;
};

export const extractPaginatedData = <T = any>(
  response: AxiosResponse<PaginatedResponse<T>>,
): {
  data: T[];
  pagination: PaginatedResponse<T>["paginationData"];
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
} => {
  const pagination = response?.data?.paginationData;
  const data = response?.data?.data || [];
  return {
    data,
    items: data,
    pagination,
    page: pagination?.page || 1,
    limit: pagination?.limit || 10,
    total: pagination?.total || 0,
    totalPages: pagination?.totalPages || 0,
  };
};

export const parseResponseData = <T = any>(
  response: AxiosResponse<ApiResponse<T>>,
): T | null => {
  return response?.data?.data ?? null;
};

export const parseResponseMessage = (
  response: AxiosResponse<ApiResponse>,
): string => {
  return response?.data?.message || "";
};

export const parseResponseStatus = (
  response: AxiosResponse<ApiResponse>,
): string => {
  return response?.data?.status || "";
};

export const isSuccessResponse = (
  response: AxiosResponse<ApiResponse>,
): boolean => {
  const status = response?.data?.status;
  return status === "success" || status === "created";
};

export const isErrorResponse = (
  response: AxiosResponse<ApiResponse>,
): boolean => {
  return !isSuccessResponse(response);
};

export const parsePaginatedResponse = <T = unknown>(
  response: AxiosResponse<PaginatedResponse<T>>,
): PaginatedResponse<T> => {
  return response?.data;
};

export const extractNestedData = <T = any>(
  response: AxiosResponse<ApiResponse<T>>,
  path: string,
): unknown => {
  const data = response?.data?.data as Record<string, unknown>;
  if (!data) return null;
  return path.split(".").reduce((acc: unknown, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, data);
};

export const safeJsonParse = <T = any>(jsonString: string, fallback: T): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback;
  }
};

export const parseError = (
  error: unknown,
): { message: string; statusCode?: number } => {
  if (typeof error === "string") return { message: error };
  if (error && typeof error === "object") {
    if ("response" in error) {
      const axiosError = error as {
        response?: {
          data?: { message?: string; statusCode?: number };
          status?: number;
        };
      };
      return {
        message: axiosError.response?.data?.message || "An error occurred",
        statusCode:
          axiosError.response?.data?.statusCode || axiosError.response?.status,
      };
    }
    if ("message" in error) {
      return { message: (error as { message: string }).message };
    }
  }
  return { message: "An unexpected error occurred" };
};

export const parseAxiosErrorMessage = (
  error: unknown,
): { message: string; statusCode?: number } => {
  if (typeof error === "string") return { message: error };

  const axiosError = error as {
    response?: {
      data?: { message?: string; statusCode?: number };
      status?: number;
    };
    message?: string;
  };

  if (axiosError.response?.data?.message) {
    return {
      message: axiosError.response.data.message,
      statusCode:
        axiosError.response.data.statusCode || axiosError.response.status,
    };
  }

  if (axiosError.message) {
    return { message: axiosError.message };
  }

  return { message: "An unexpected error occurred" };
};
