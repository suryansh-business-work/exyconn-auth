import { Router } from "express";
import { authenticateOrgUser } from "../middlewares/user.middleware";
import { queryParser, parseBulkDelete } from "../common/middleware";
import * as AdminController from "./admin.controller";

const router = Router();

// All routes require authentication (organization users only, not god users)
router.use(authenticateOrgUser);
router.use(AdminController.requireAdmin);

// Dashboard
router.get("/dashboard", AdminController.getDashboardStats);

// Organization details
router.get("/organization", AdminController.getOrganizationDetails);

// Organization roles
router.get("/organization/roles", AdminController.getOrganizationRoles);

// User management
router.get("/users", queryParser, AdminController.getOrganizationUsers);
router.get("/users/:userId", AdminController.getUserById);
router.post("/users", AdminController.createUser);
router.put("/users/:userId", AdminController.updateUser);
router.delete("/users", parseBulkDelete, AdminController.bulkDeleteUsers);
router.delete("/users/:userId", AdminController.deleteUser);
router.post("/users/:userId/reset-password", AdminController.resetUserPassword);
router.post(
  "/users/:userId/toggle-verification",
  AdminController.toggleUserVerification,
);

export default router;
