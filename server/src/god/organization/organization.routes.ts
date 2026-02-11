import express, { RequestHandler } from "express";
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganizationGod,
  deleteOrganization,
  bulkDeleteOrganizations,
  getOrganizationStats,
  regenerateJwtSecret,
  regenerateApiKey,
} from "./organization.controller";
import { authenticateGod } from "../../middlewares/god.middleware";
import { queryParser, parseBulkDelete } from "../../common/middleware";

const router = express.Router();

router.use(authenticateGod);
router.get("/", queryParser, getAllOrganizations as RequestHandler);
router.get("/stats", getOrganizationStats as RequestHandler);
router.get("/:id", getOrganizationById as RequestHandler);
router.post("/", createOrganization as RequestHandler);
router.put("/:id", updateOrganizationGod as RequestHandler);
router.post(
  "/:id/regenerate-jwt-secret",
  regenerateJwtSecret as RequestHandler,
);
router.post("/:id/regenerate-api-key", regenerateApiKey as RequestHandler);
router.delete("/", parseBulkDelete, bulkDeleteOrganizations as RequestHandler);
router.delete("/:id", deleteOrganization as RequestHandler);

export default router;
