import { Response } from "express";
import { validate } from "class-validator";
import { plainToClass } from "class-transformer";
import { OrganizationService } from "./organization.service";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "./organization.types";
import {
  successResponse,
  successResponseArr,
  errorResponse,
  badRequestResponse,
  notFoundResponse,
  conflictResponse,
  createdResponse,
  noContentResponse,
  logger,
} from "../../common";
import { GodAuthRequest } from "../../middlewares/god.middleware";
import Organization from "./organization.model";

// =============== GOD LEVEL FUNCTIONS ===============

/**
 * Get all organizations with pagination and filters (God level)
 */
export const getAllOrganizations = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      filter,
    } = (req as any).parsedQuery || {};
    const isActive =
      filter?.isActive === "true"
        ? true
        : filter?.isActive === "false"
          ? false
          : undefined;

    const result = await OrganizationService.getAllOrganizations(
      page,
      limit,
      search,
      isActive,
    );

    return successResponseArr(
      res,
      result.organizations,
      {
        total: result.total,
        page: result.page,
        limit,
        totalPages: result.totalPages,
      },
      "Organizations fetched successfully",
    );
  } catch (error) {
    logger.error("Error fetching organizations", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to fetch organizations");
  }
};

/**
 * Get organization by ID (God level)
 */
export const getOrganizationById = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const id = req.params.id as string;

    const organization = await OrganizationService.getOrganizationById(id);

    if (!organization) {
      return notFoundResponse(res, "Organization not found");
    }

    return successResponse(
      res,
      organization,
      "Organization fetched successfully",
    );
  } catch (error) {
    logger.error("Error fetching organization", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to fetch organization");
  }
};

/**
 * Create new organization (God level)
 */
export const createOrganization = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    // Validate request body
    const dto = plainToClass(CreateOrganizationDto, req.body, {
      enableImplicitConversion: true,
      excludeExtraneousValues: false,
    });
    const errors = await validate(dto);

    if (errors.length > 0) {
      return badRequestResponse(
        res,
        "Validation failed",
        errors.map((e) => ({
          property: e.property,
          constraints: e.constraints,
        })),
      );
    }

    // Check if organization with same email domain already exists
    const emailDomain = dto.orgEmail.split("@")[1];
    const existingOrgByDomain =
      await OrganizationService.getOrganizationByEmailDomain(emailDomain);
    if (existingOrgByDomain) {
      return conflictResponse(
        res,
        "Organization with this email domain already exists",
      );
    }

    // Check if organization with same website already exists
    if (dto.orgWebsite) {
      const existingOrgByWebsite =
        await OrganizationService.getOrganizationByWebsite(dto.orgWebsite);
      if (existingOrgByWebsite) {
        return conflictResponse(
          res,
          "Organization with this website already exists",
        );
      }
    }

    // Create organization
    const organization = await OrganizationService.createOrganization(
      dto as any, // Cast to bypass strict type checking for DTO
      req.godUser?.userId || req.godUser?._id,
    );

    return createdResponse(
      res,
      organization,
      "Organization created successfully",
    );
  } catch (error) {
    logger.error("Error creating organization", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(
      res,
      error,
      error instanceof Error ? error.message : String(error),
    );
  }
};

/**
 * Update organization (God level)
 */
export const updateOrganizationGod = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const id = req.params.id as string;

    // Validate request body
    const dto = plainToClass(UpdateOrganizationDto, req.body, {
      enableImplicitConversion: true,
      excludeExtraneousValues: false,
    });
    const errors = await validate(dto, {
      whitelist: false,
      forbidNonWhitelisted: false,
      skipMissingProperties: true,
    });

    if (errors.length > 0) {
      // Flatten nested errors for better debugging
      const flattenErrors = (errs: any[], prefix = ""): any[] => {
        return errs.flatMap((e) => {
          const path = prefix ? `${prefix}.${e.property}` : e.property;
          const result: any[] = [];
          if (e.constraints) {
            result.push({
              property: path,
              constraints: e.constraints,
            });
          }
          if (e.children && e.children.length > 0) {
            result.push(...flattenErrors(e.children, path));
          }
          return result;
        });
      };

      const flatErrors = flattenErrors(errors);
      console.log("Validation errors:", JSON.stringify(flatErrors, null, 2));

      return badRequestResponse(
        res,
        "Validation failed",
        flatErrors.length > 0
          ? flatErrors
          : errors.map((e) => ({
              property: e.property,
              constraints: e.constraints,
              children: e.children?.length,
            })),
      );
    }

    // Check if organization exists
    const existingOrg = await OrganizationService.getOrganizationById(id);
    if (!existingOrg) {
      return notFoundResponse(res, "Organization not found");
    }

    // If email is being updated, check for domain conflicts
    if (dto.orgEmail && dto.orgEmail !== existingOrg.orgEmail) {
      const emailDomain = dto.orgEmail.split("@")[1];
      const existingOrgByDomain =
        await OrganizationService.getOrganizationByEmailDomain(emailDomain);
      if (existingOrgByDomain && existingOrgByDomain._id.toString() !== id) {
        return conflictResponse(
          res,
          "Organization with this email domain already exists",
        );
      }
    }

    // If website is being updated, check for conflicts
    if (dto.orgWebsite && dto.orgWebsite !== existingOrg.orgWebsite) {
      const existingOrgByWebsite =
        await OrganizationService.getOrganizationByWebsite(dto.orgWebsite);
      if (existingOrgByWebsite && existingOrgByWebsite._id.toString() !== id) {
        return conflictResponse(
          res,
          "Organization with this website already exists",
        );
      }
    }

    // Update organization
    const updatedOrganization = await OrganizationService.updateOrganization(
      id,
      dto as any, // Cast to bypass strict type checking for DTO
      req.godUser?.userId || req.godUser?._id,
    );

    return successResponse(
      res,
      updatedOrganization,
      "Organization updated successfully",
    );
  } catch (error) {
    logger.error("Error updating organization", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to update organization");
  }
};

/**
 * Delete organization (God level - hard delete)
 */
export const deleteOrganization = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const id = req.params.id as string;

    // Soft delete organization
    await OrganizationService.deleteOrganization(id);

    return noContentResponse(res);
  } catch (error) {
    logger.error("Error deleting organization", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to delete organization");
  }
};

/**
 * Regenerate JWT Secret (God level)
 */
export const regenerateJwtSecret = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const id = req.params.id as string;

    if (!id) {
      return badRequestResponse(res, "Organization ID is required");
    }

    const organization = await OrganizationService.regenerateJwtSecret(
      id,
      req.godUser?.userId || req.godUser?._id,
    );

    if (!organization) {
      return notFoundResponse(res, "Organization not found");
    }

    logger.info("JWT secret regenerated", { id });
    return successResponse(
      res,
      organization,
      "JWT secret regenerated successfully",
    );
  } catch (error) {
    logger.error("Error regenerating JWT secret", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to regenerate JWT secret");
  }
};

/**
 * Get organization statistics (God level)
 */
export const getOrganizationStats = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const stats = await OrganizationService.getOrganizationStats();

    return successResponse(
      res,
      stats,
      "Organization statistics fetched successfully",
    );
  } catch (error) {
    logger.error("Error fetching organization stats", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to fetch organization statistics");
  }
};

/**
 * Bulk delete organizations (God level)
 */
export const bulkDeleteOrganizations = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const ids = (req as any).ids || [];
    const deleteAll = (req as any).deleteAll || false;

    if (deleteAll) {
      await Organization.deleteMany({});
      logger.info("All organizations deleted by God", {
        deletedBy: req.godUser?._id || req.godUser?.userId,
      });
    } else {
      await Organization.deleteMany({ _id: { $in: ids } });
      logger.info("Organizations bulk deleted by God", {
        ids,
        deletedBy: req.godUser?._id || req.godUser?.userId,
      });
    }

    return noContentResponse(res);
  } catch (error) {
    logger.error("Error bulk deleting organizations", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to bulk delete organizations");
  }
};

/**
 * Regenerate API key for organization (God level)
 */
export const regenerateApiKey = async (req: GodAuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const result = await OrganizationService.regenerateApiKey(id);

    if (!result) {
      return notFoundResponse(res, "Organization not found");
    }

    logger.info("API key regenerated", {
      orgId: id,
      regeneratedBy: req.godUser?._id || req.godUser?.userId,
    });

    return successResponse(
      res,
      { apiKey: result.apiKey, apiKeyCreatedAt: result.apiKeyCreatedAt },
      "API key regenerated successfully",
    );
  } catch (error) {
    logger.error("Error regenerating API key", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to regenerate API key");
  }
};
