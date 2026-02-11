import { Request, Response } from "express";
import { successResponse } from "../../common";

/**
 * Logout endpoint - client clears localStorage tokens
 * Server just confirms logout success
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  // Logout is now client-side only (clear localStorage)
  // Server just confirms success
  successResponse(res, null, "Logged out successfully");
};
