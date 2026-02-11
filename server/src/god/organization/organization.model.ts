import mongoose, { Schema } from "mongoose";
import { randomUUID } from "crypto";
import { logger } from "../../common";
import {
  IOrganization,
  ICustomTextSection,
  ICustomColor,
  IRole,
  IOrgTheme,
} from "./organization-forms/merged-interface-index";
import {
  OrgPhoneSchema,
  OrgLogoSchema,
  LoginBgImageSchema,
  CustomTextSectionSchema,
  customTextSectionsDefault,
  OrgThemeSchema,
  OrgPolicySchema,
  OrgRedirectionSettingSchema,
  OrgAddressSchema,
  OrgRegionSchema,
  OrgOptionsSchema,
  RoleSchema,
  rolesDefault,
  JwtSettingsSchema,
  jwtSettingsDefault,
  OAuthSettingsSchema,
  SmtpSettingsSchema,
  FeatureFlagsSchema,
  MailSettingsSchema,
  emailTemplatesDefault,
} from "./organization-forms/merged-schema-index";

const OrganizationSchema: Schema = new Schema(
  {
    orgName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    orgEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    orgSlug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    orgPhone: OrgPhoneSchema,
    orgLogos: [OrgLogoSchema],
    orgFavIcon: { type: String },
    loginBgImages: [LoginBgImageSchema],
    loginPageDesign: {
      type: String,
      enum: ["classic", "split", "minimal"],
      default: "split",
    },
    customTextSections: {
      type: [CustomTextSectionSchema],
      default: customTextSectionsDefault,
    },
    orgTheme: OrgThemeSchema,
    orgPoliciesLink: [OrgPolicySchema],
    orgRedirectionSettings: [OrgRedirectionSettingSchema],
    orgTaxNumber: { type: String },
    orgRegistrationNumber: { type: String },
    orgAddress: OrgAddressSchema,
    orgBusinessType: {
      type: String,
      enum: ["Product", "Service", "Both"],
    },
    orgTaxType: {
      type: String,
      enum: ["GST", "CIN", "PAN", "VAT", "Other"],
    },
    orgWorkDomain: { type: String },
    orgWebsite: {
      type: String,
      unique: true,
      sparse: true,
    },
    authServerUrl: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    orgScaleType: {
      type: String,
      enum: ["National", "Multinational"],
      default: "National",
    },
    orgRegions: [OrgRegionSchema],
    orgActiveStatus: {
      type: Boolean,
      default: true,
      index: true,
    },
    ownershipType: {
      type: String,
      enum: ["Private", "Government", "LLP", "Partnership", "Other"],
    },
    numberOfEmployees: { type: Number },
    orgOptions: OrgOptionsSchema,
    orgRoleTypes: {
      type: [String],
      default: ["admin", "user"],
    },
    roles: {
      type: [RoleSchema],
      default: rolesDefault,
    },
    tokenSignKey: { type: String },
    jwtSettings: {
      type: JwtSettingsSchema,
      default: jwtSettingsDefault,
    },
    oauthSettings: OAuthSettingsSchema,
    customCss: { type: String },
    smtpSettings: SmtpSettingsSchema,
    featureFlags: FeatureFlagsSchema,
    mailSettings: MailSettingsSchema,
    emailTemplates: {
      type: Map,
      of: String,
      default: emailTemplatesDefault,
    },
    customHtml: { type: String, default: "" },
    customJs: { type: String, default: "" },
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    apiKeyCreatedAt: { type: Date },
    notifyOnUserDeletion: { type: Boolean, default: true },
    createdBy: { type: String },
    updatedBy: { type: String },
  },
  {
    timestamps: true,
    collection: "organizations",
  },
);

// Indexes for performance
OrganizationSchema.index({ orgName: "text" });
OrganizationSchema.index({ createdAt: -1 });

// Pre-save hook to auto-generate slugs for customTextSections and customColors
OrganizationSchema.pre<IOrganization>("save", function (next) {
  const doc = this as IOrganization;

  // Helper function to generate camelCase slug
  const generateSlug = (text: string): string => {
    if (!text) return "";
    return text
      .trim()
      .replace(/[^\w\s]/g, "") // Remove special characters
      .replace(/\s+(.)/g, (_, char: string) => char.toUpperCase()) // Convert to camelCase
      .replace(/\s+/g, "") // Remove remaining spaces
      .replace(/^(.)/, (_, char: string) => char.toLowerCase()); // Ensure first char is lowercase
  };

  // Auto-generate slugs for customTextSections if missing
  if (doc.customTextSections && Array.isArray(doc.customTextSections)) {
    doc.customTextSections.forEach((section: ICustomTextSection) => {
      if (section.name && !section.slug) {
        section.slug = generateSlug(section.name);
      }
    });
  }

  // Auto-generate slugs for customColors if missing
  if (doc.orgTheme?.customColors && Array.isArray(doc.orgTheme.customColors)) {
    doc.orgTheme.customColors.forEach((color: ICustomColor) => {
      if (color.title && !color.slug) {
        color.slug = generateSlug(color.title);
      }
    });
  }

  // Auto-generate slugs for roles if missing
  if (doc.roles && Array.isArray(doc.roles)) {
    doc.roles.forEach((role: IRole) => {
      if (role.name && !role.slug) {
        role.slug = generateSlug(role.name);
      }
    });
  }

  // Generate JWT secret if not provided
  if (!doc.jwtSettings) {
    doc.jwtSettings = {
      algorithm: "HS256",
      payloadFields: ["userId", "userName", "email"],
      tokenSignKey: randomUUID(),
    };
  } else if (
    !doc.jwtSettings.tokenSignKey ||
    doc.jwtSettings.tokenSignKey.trim() === ""
  ) {
    doc.jwtSettings.tokenSignKey = randomUUID();
  }

  next();
});

// Pre-update hook to auto-generate slugs for customTextSections and customColors
OrganizationSchema.pre("findOneAndUpdate", function (next) {
  interface UpdateQuery {
    customTextSections?: ICustomTextSection[];
    orgTheme?: IOrgTheme;
    roles?: IRole[];
    $set?: {
      customTextSections?: ICustomTextSection[];
      "orgTheme.customColors"?: ICustomColor[];
      roles?: IRole[];
      [key: string]: unknown;
    };
  }

  const update = this.getUpdate() as UpdateQuery;

  // Auto-generate slug function
  const generateSlug = (text: string): string => {
    if (!text) return "";
    return text
      .trim()
      .replace(/[^\w\s]/g, "") // Remove special characters
      .replace(/\s+(.)/g, (_, char: string) => char.toUpperCase()) // Convert to camelCase
      .replace(/\s+/g, "") // Remove remaining spaces
      .replace(/^(.)/, (_, char: string) => char.toLowerCase()); // Ensure first char is lowercase
  };

  // Handle customTextSections
  if (update.customTextSections && Array.isArray(update.customTextSections)) {
    update.customTextSections.forEach((section: ICustomTextSection) => {
      if (section.name && !section.slug) {
        section.slug = generateSlug(section.name);
      }
    });
  }

  // Handle $set.customTextSections
  if (
    update.$set?.customTextSections &&
    Array.isArray(update.$set.customTextSections)
  ) {
    update.$set.customTextSections.forEach((section: ICustomTextSection) => {
      if (section.name && !section.slug) {
        section.slug = generateSlug(section.name);
      }
    });
  }

  // Handle orgTheme.customColors
  if (
    update.orgTheme?.customColors &&
    Array.isArray(update.orgTheme.customColors)
  ) {
    update.orgTheme.customColors.forEach((color: ICustomColor) => {
      if (color.title && !color.slug) {
        color.slug = generateSlug(color.title);
      }
    });
  }

  // Handle $set.orgTheme.customColors
  if (
    update.$set?.["orgTheme.customColors"] &&
    Array.isArray(update.$set["orgTheme.customColors"])
  ) {
    update.$set["orgTheme.customColors"].forEach((color: ICustomColor) => {
      if (color.title && !color.slug) {
        color.slug = generateSlug(color.title);
      }
    });
  }

  // Handle roles
  if (update.roles && Array.isArray(update.roles)) {
    update.roles.forEach((role: IRole) => {
      if (role.name && !role.slug) {
        role.slug = generateSlug(role.name);
      }
    });
  }

  // Handle $set.roles
  if (update.$set?.roles && Array.isArray(update.$set.roles)) {
    update.$set.roles.forEach((role: IRole) => {
      if (role.name && !role.slug) {
        role.slug = generateSlug(role.name);
      }
    });
  }

  next();
});

// Migration: Drop old companyId index if it exists
OrganizationSchema.post("init", async function () {
  try {
    const collection = this.db.collection("organizations");
    const indexes = await collection.indexes();
    const hasOldIndex = indexes.some((index) => index.name === "companyId_1");

    if (hasOldIndex) {
      await collection.dropIndex("companyId_1");
      logger.info(
        "✅ Dropped old companyId_1 index from organizations collection",
      );
    }
  } catch (error) {
    // Ignore errors if index doesn't exist or can't be dropped
    if (
      error &&
      typeof error === "object" &&
      "codeName" in error &&
      error.codeName !== "IndexNotFound"
    ) {
      logger.warn(
        "⚠️  Could not drop old companyId index:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }
});

// Export Model and Types
export { IOrganization };
export default mongoose.models.Organization ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);
