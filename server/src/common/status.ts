/**
 * Status Enums - Local implementation replacing @exyconn/common
 */

export const statusCode = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

export const statusMessage = {
  SUCCESS: "success",
  CREATED: "created",
  NO_CONTENT: "no-data-found",
  BAD_REQUEST: "bad-request",
  UNAUTHORIZED: "unauthorized",
  FORBIDDEN: "forbidden",
  NOT_FOUND: "not-found",
  CONFLICT: "conflict",
  VALIDATION_ERROR: "validation-error",
  RATE_LIMIT_EXCEEDED: "rate-limit-exceeded",
  ERROR: "error",
  BAD_GATEWAY: "bad-gateway",
  SERVICE_UNAVAILABLE: "service-unavailable",
} as const;

export type StatusCode = (typeof statusCode)[keyof typeof statusCode];
export type StatusMessage = (typeof statusMessage)[keyof typeof statusMessage];
