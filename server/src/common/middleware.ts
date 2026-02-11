/**
 * Middleware - Local implementation replacing @exyconn/common/server/middleware
 */

import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      parsedQuery?: ParsedQuery;
      deleteAll?: boolean;
      deleteIds?: string[];
    }
  }
}

export interface ParsedQuery {
  page: number;
  limit: number;
  skip: number;
  sort: Record<string, 1 | -1>;
  search: string;
  filter: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Query parser middleware - parses pagination, sorting, search, and filter params
 */
export const queryParser = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const query = req.query;

  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(
    100,
    Math.max(1, parseInt(query.limit as string) || 10),
  );
  const skip = (page - 1) * limit;

  // Sort parsing
  const sort: Record<string, 1 | -1> = {};
  const sortField = (query.sort || query.sortBy) as string;
  const sortOrder = (query.sortOrder || query.order) as string;

  if (sortField) {
    sort[sortField] = sortOrder === "asc" ? 1 : -1;
  } else {
    sort.createdAt = -1; // Default sort by newest first
  }

  // Search
  const search = ((query.search || query.q) as string) || "";

  // Filter - parse JSON filter if provided
  let filter: Record<string, unknown> = {};
  if (query.filter) {
    try {
      filter =
        typeof query.filter === "string"
          ? JSON.parse(query.filter)
          : (query.filter as Record<string, unknown>);
    } catch {
      filter = {};
    }
  }

  req.parsedQuery = {
    page,
    limit,
    skip,
    sort,
    search,
    filter,
  };

  // Copy over any additional query parameters
  for (const [key, value] of Object.entries(query)) {
    if (
      ![
        "page",
        "limit",
        "sort",
        "sortBy",
        "sortOrder",
        "order",
        "search",
        "q",
        "filter",
      ].includes(key)
    ) {
      req.parsedQuery[key] = value;
    }
  }

  next();
};

/**
 * Parse bulk delete middleware - parses request body for array of IDs
 * Supports ["*"] for delete-all
 */
export const parseBulkDelete = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids)) {
    res.status(400).json({
      message: "ids must be an array",
      data: null,
      status: "bad-request",
      statusCode: 400,
    });
    return;
  }

  if (ids.length === 0) {
    res.status(400).json({
      message: "ids array must not be empty",
      data: null,
      status: "bad-request",
      statusCode: 400,
    });
    return;
  }

  // Check for delete all
  if (ids.length === 1 && ids[0] === "*") {
    req.deleteAll = true;
    req.deleteIds = [];
    return next();
  }

  // Validate ObjectIds
  const invalidIds = ids.filter(
    (id: string) => !mongoose.Types.ObjectId.isValid(id),
  );
  if (invalidIds.length > 0) {
    res.status(400).json({
      message: `Invalid IDs: ${invalidIds.join(", ")}`,
      data: null,
      status: "bad-request",
      statusCode: 400,
    });
    return;
  }

  req.deleteAll = false;
  req.deleteIds = ids;
  next();
};
