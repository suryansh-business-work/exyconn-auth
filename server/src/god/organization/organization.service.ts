import crypto from "crypto";
import Organization, { IOrganization } from "./organization.model";
import { logger } from "@exyconn/common/server";

export class OrganizationService {
  /**
   * Generate secure token sign key for JWT
   */
  static generateTokenSignKey(): string {
    return crypto.randomBytes(64).toString("hex");
  }

  /**
   * Generate slug from organization name
   */
  static generateSlug(orgName: string): string {
    return orgName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters except spaces and hyphens
      .replace(/[\s_-]+/g, "-") // Replace spaces, underscores, multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
  }

  /**
   * Generate unique slug (handles duplicates by adding numbers)
   */
  static async generateUniqueSlug(orgName: string): Promise<string> {
    let baseSlug = this.generateSlug(orgName);
    let slug = baseSlug;
    let counter = 1;

    while (await Organization.findOne({ orgSlug: slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Get all organizations with pagination
   */
  static async getAllOrganizations(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
  ): Promise<{
    organizations: IOrganization[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const query: Record<string, unknown> = {};

      // Search filter
      if (search) {
        query.$or = [
          { orgName: { $regex: search, $options: "i" } },
          { orgEmail: { $regex: search, $options: "i" } },
          { orgSlug: { $regex: search, $options: "i" } },
        ];
      }

      // Active status filter
      if (isActive !== undefined) {
        query.orgActiveStatus = isActive;
      }

      const total = await Organization.countDocuments(query);
      const organizations = await Organization.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<IOrganization[]>();

      return {
        organizations,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error instanceof Error
            ? error.message
            : String(error)
          : "Unknown error";
      logger.error("Error fetching organizations", { error: errorMessage });
      throw error;
    }
  }

  /**
   * Get organization by ID (MongoDB _id)
   */
  static async getOrganizationById(id: string): Promise<IOrganization | null> {
    try {
      return await Organization.findById(id);
    } catch (error) {
      logger.error("Error fetching organization by ID", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get organization by email
   */
  static async getOrganizationByEmail(
    email: string,
  ): Promise<IOrganization | null> {
    try {
      return await Organization.findOne({ orgEmail: email.toLowerCase() });
    } catch (error) {
      logger.error("Error fetching organization by email", {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get organization by email domain
   */
  static async getOrganizationByEmailDomain(
    domain: string,
  ): Promise<IOrganization | null> {
    try {
      // Find organizations where the domain part of orgEmail matches
      return await Organization.findOne({
        $expr: {
          $eq: [
            { $toLower: { $arrayElemAt: [{ $split: ["$orgEmail", "@"] }, 1] } },
            domain.toLowerCase(),
          ],
        },
      });
    } catch (error) {
      logger.error("Error fetching organization by email domain", {
        domain,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get organization by website
   */
  static async getOrganizationByWebsite(
    website: string,
  ): Promise<IOrganization | null> {
    try {
      return await Organization.findOne({ orgWebsite: website.toLowerCase() });
    } catch (error) {
      logger.error("Error fetching organization by website", {
        website,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Create new organization
   */
  static async createOrganization(
    data: Partial<IOrganization>,
    createdBy?: string,
  ): Promise<IOrganization> {
    try {
      // Generate tokenSignKey if not provided
      if (!data.tokenSignKey) {
        data.tokenSignKey = this.generateTokenSignKey();
      }

      // Generate API key for the organization
      if (!data.apiKey) {
        data.apiKey = this.generateApiKey();
        data.apiKeyCreatedAt = new Date();
      }

      // Set default values
      data.orgActiveStatus =
        data.orgActiveStatus !== undefined ? data.orgActiveStatus : true;
      if (createdBy !== undefined) {
        data.createdBy = createdBy;
      }

      const organization = new Organization(data);
      await organization.save();

      logger.info("Organization created successfully", {
        _id: organization._id,
        orgName: organization.orgName,
        apiKey: organization.apiKey
          ? "***" + organization.apiKey.slice(-4)
          : "N/A",
      });

      return organization;
    } catch (error) {
      logger.error("Error creating organization", {
        error: error instanceof Error ? error.message : String(error),
        data,
      });
      throw error;
    }
  }

  /**
   * Generate API key for organization
   */
  static generateApiKey(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const prefix = "exy_";
    let key = prefix;
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  /**
   * Regenerate API key for organization
   */
  static async regenerateApiKey(
    orgId: string,
  ): Promise<{ apiKey: string; apiKeyCreatedAt: Date } | null> {
    try {
      const newApiKey = this.generateApiKey();
      const apiKeyCreatedAt = new Date();
      const organization = await Organization.findByIdAndUpdate(
        orgId,
        { apiKey: newApiKey, apiKeyCreatedAt },
        { new: true },
      );
      if (organization) {
        logger.info("API key regenerated", { orgId });
        return { apiKey: newApiKey, apiKeyCreatedAt };
      }
      return null;
    } catch (error) {
      logger.error("Error regenerating API key", { orgId, error });
      throw error;
    }
  }

  /**
   * Update organization
   */
  static async updateOrganization(
    id: string,
    data: Partial<IOrganization>,
    updatedBy?: string,
  ): Promise<IOrganization | null> {
    try {
      if (updatedBy !== undefined) {
        data.updatedBy = updatedBy;
      }

      // Check if the id looks like a MongoDB ObjectId (24 hex characters)
      const isMongoId = /^[a-f\d]{24}$/i.test(id);

      if (!isMongoId) {
        logger.warn("Invalid MongoDB ID format for update", { id });
        return null;
      }

      const organization = await Organization.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true },
      );

      if (organization) {
        logger.info("Organization updated successfully", {
          id,
          updatedFields: Object.keys(data),
        });
      }

      return organization;
    } catch (error) {
      logger.error("Error updating organization", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Delete organization (hard delete)
   */
  static async deleteOrganization(
    id: string,
    deletedBy?: string,
  ): Promise<IOrganization | null> {
    try {
      const organization = await Organization.findByIdAndDelete(id);

      if (organization) {
        logger.info("Organization hard deleted", { id });
      }

      return organization;
    } catch (error) {
      logger.error("Error deleting organization", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Check if organization exists by email
   */
  static async organizationExistsByEmail(email: string): Promise<boolean> {
    try {
      const count = await Organization.countDocuments({
        orgEmail: email.toLowerCase(),
      });
      return count > 0;
    } catch (error) {
      logger.error("Error checking organization existence", {
        email,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Regenerate JWT Secret for organization
   */
  static async regenerateJwtSecret(
    id: string,
    updatedBy?: string,
  ): Promise<IOrganization | null> {
    try {
      const { randomUUID } = require("crypto");
      const newSecret = randomUUID();

      const organization = await Organization.findByIdAndUpdate(
        id,
        {
          $set: {
            "jwtSettings.tokenSignKey": newSecret,
            updatedBy,
          },
        },
        { new: true, runValidators: true },
      );

      if (organization) {
        logger.info("JWT secret regenerated successfully", { id });
      }

      return organization;
    } catch (error) {
      logger.error("Error regenerating JWT secret", {
        id,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get organization statistics
   */
  static async getOrganizationStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byBusinessType: Array<{ _id: string | null; count: number }>;
    byScaleType: Array<{ _id: string | null; count: number }>;
    byOwnershipType: Array<{ _id: string | null; count: number }>;
  }> {
    try {
      const total = await Organization.countDocuments();
      const active = await Organization.countDocuments({
        orgActiveStatus: true,
      });
      const inactive = await Organization.countDocuments({
        orgActiveStatus: false,
      });

      const byBusinessType = await Organization.aggregate([
        { $group: { _id: "$orgBusinessType", count: { $sum: 1 } } },
      ]);

      const byScaleType = await Organization.aggregate([
        { $group: { _id: "$orgScaleType", count: { $sum: 1 } } },
      ]);

      const byOwnershipType = await Organization.aggregate([
        { $group: { _id: "$ownershipType", count: { $sum: 1 } } },
      ]);

      return {
        total,
        active,
        inactive,
        byBusinessType,
        byScaleType,
        byOwnershipType,
      };
    } catch (error) {
      logger.error("Error getting organization stats", {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
