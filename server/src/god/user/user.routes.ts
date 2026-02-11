import { Router } from "express";
import * as UserController from "./user.controller";
import { authenticateGod } from "../../middlewares/god.middleware";
import { queryParser, parseBulkDelete } from "../../common/middleware";

const router = Router();

// All routes require God authentication
router.use(authenticateGod);

/**
 * @route   GET /v1/api/god/users
 * @desc    Get all users with pagination and filters
 * @access  God only
 * @query   page, limit, search, organizationId, role, isVerified
 */
router.get("/", queryParser, UserController.getAllUsers);

/**
 * @route   GET /v1/api/god/users/statistics
 * @desc    Get user statistics
 * @access  God only
 * @query   organizationId (optional)
 */
router.get("/statistics", UserController.getUserStatistics);

/**
 * @route   GET /v1/api/god/users/organization/:organizationId
 * @desc    Get users by organization ID
 * @access  God only
 * @param   organizationId
 */
router.get(
  "/organization/:organizationId",
  queryParser,
  UserController.getUsersByOrganization,
);

/**
 * @route   GET /v1/api/god/users/:userId
 * @desc    Get user by ID
 * @access  God only
 * @param   userId
 */
router.get("/:userId", UserController.getUserById);

/**
 * @route   PUT /v1/api/god/users/:userId
 * @desc    Update user
 * @access  God only
 * @param   userId
 */
router.put("/:userId", UserController.updateUser);

/**
 * @route   DELETE /v1/api/god/users
 * @desc    Bulk delete users
 * @access  God only
 * @body    { ids: string[] }
 */
router.delete("/", parseBulkDelete, UserController.bulkDeleteUsers);

/**
 * @route   DELETE /v1/api/god/users/:userId
 * @desc    Delete user
 * @access  God only
 * @param   userId
 */
router.delete("/:userId", UserController.deleteUser);

export default router;
