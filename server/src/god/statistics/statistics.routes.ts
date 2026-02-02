import express from "express";
import {
  getDashboardStats,
  getSystemStats,
  getGlobalStatistics,
  getOrganizationStatistics,
} from "./statistics.controller";
import { authenticateGod } from "../../middlewares/god.middleware";

const router = express.Router();

// Apply god authentication to all routes
router.use(authenticateGod);

/**
 * @route   GET /v1/api/god/statistics/global
 * @desc    Get global statistics (all organizations)
 * @access  God only
 */
router.get("/global", getGlobalStatistics);

/**
 * @route   GET /v1/api/god/statistics/organization/:organizationId
 * @desc    Get comprehensive statistics for a specific organization
 * @access  God only
 * @param   organizationId
 */
router.get("/organization/:organizationId", getOrganizationStatistics);

// Legacy dashboard routes
router.get("/dashboard", getDashboardStats);
router.get("/system", getSystemStats);

export default router;
