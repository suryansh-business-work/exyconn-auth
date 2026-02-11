import { Response } from "express";

// Column metadata for array responses
interface ColumnMetadata {
  name: string;
  datatype: string;
  required: boolean;
}

const extractColumns = (data: unknown[]): ColumnMetadata[] => {
  if (!Array.isArray(data) || data.length === 0) return [];
  const sample = data[0] as Record<string, unknown>;
  return Object.entries(sample).map(([key, value]) => {
    let datatype: string = typeof value;
    if (value === null) datatype = "null";
    else if (Array.isArray(value)) datatype = "array";
    else if (value instanceof Date) datatype = "date";
    else if (typeof value === "object") datatype = "object";
    return {
      name: key,
      datatype,
      required: value !== null && value !== undefined,
    };
  });
};

export const successResponse = (
  res: Response,
  data: unknown,
  message = "Operation successful",
) =>
  res.status(200).json({ message, data, status: "success", statusCode: 200 });

export const successResponseArr = (
  res: Response,
  data: unknown[],
  paginationData: Record<string, unknown> = {},
  message = "Operation successful",
) =>
  res.status(200).json({
    message,
    data,
    columns: extractColumns(data),
    paginationData,
    status: "success",
    statusCode: 200,
  });

export const createdResponse = (
  res: Response,
  data: unknown,
  message = "Resource created successfully",
) =>
  res.status(201).json({ message, data, status: "created", statusCode: 201 });

export const noContentResponse = (
  res: Response,
  data: unknown = null,
  message = "No data found",
) =>
  res
    .status(200)
    .json({ message, data, status: "no-data-found", statusCode: 204 });

export const badRequestResponse = (
  res: Response,
  message = "Bad request",
  errors: unknown = null,
) =>
  res
    .status(400)
    .json({ message, data: errors, status: "bad-request", statusCode: 400 });

export const unauthorizedResponse = (
  res: Response,
  message = "Unauthorized access",
) =>
  res
    .status(401)
    .json({ message, data: null, status: "unauthorized", statusCode: 401 });

export const forbiddenResponse = (
  res: Response,
  message = "Access forbidden",
) =>
  res
    .status(403)
    .json({ message, data: null, status: "forbidden", statusCode: 403 });

export const notFoundResponse = (
  res: Response,
  message = "Resource not found",
) =>
  res
    .status(404)
    .json({ message, data: null, status: "not-found", statusCode: 404 });

export const conflictResponse = (
  res: Response,
  message = "Resource conflict",
) =>
  res
    .status(409)
    .json({ message, data: null, status: "conflict", statusCode: 409 });

export const validationErrorResponse = (
  res: Response,
  errors: unknown,
  message = "Validation failed",
) =>
  res.status(422).json({
    message,
    data: errors,
    status: "validation-error",
    statusCode: 422,
  });

export const errorResponse = (
  res: Response,
  error: unknown = null,
  message = "Something went wrong",
) =>
  res
    .status(500)
    .json({ message, data: error, status: "error", statusCode: 500 });

export const rateLimitResponse = (
  res: Response,
  message = "Too many requests, please try again later",
) =>
  res.status(429).json({
    message,
    data: null,
    status: "rate-limit-exceeded",
    statusCode: 429,
  });
