import { Response } from "express";
import Organization from "../organization/organization.model";
import User from "../../user/user.model";
import { successResponse, errorResponse } from "@exyconn/common/server";
import { logger } from "@exyconn/common/server";
import { GodAuthRequest } from "../../middlewares/god.middleware";
import { AuthRequest } from "../../middlewares/user.middleware";

/**
 * Get comprehensive organization statistics (God level)
 */
export const getOrganizationStatistics = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const organizationId = req.params.organizationId as string;

    // Get organization details
    const organization = await Organization.findById(organizationId).lean();

    if (!organization) {
      return errorResponse(
        res,
        new Error("Organization not found"),
        "Organization not found",
      );
    }

    const org = organization as any; // Type assertion for lean result

    // Get user statistics for this organization
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      usersByProvider,
      recentUsers,
      userGrowth,
    ] = await Promise.all([
      User.countDocuments({ companyId: organizationId }),
      User.countDocuments({ companyId: organizationId, isVerified: true }),
      User.countDocuments({ companyId: organizationId, isVerified: false }),
      User.aggregate([
        { $match: { companyId: organizationId } },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: { companyId: organizationId } },
        { $group: { _id: "$provider", count: { $sum: 1 } } },
      ]),
      User.find({ companyId: organizationId })
        .select("firstName lastName email role isVerified createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      User.aggregate([
        { $match: { companyId: organizationId } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }, // Last 12 months
      ]),
    ]);

    // Format user growth data
    const formattedUserGrowth = userGrowth.map((item: any) => ({
      period: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      users: item.count,
    }));

    const statistics = {
      organization: {
        _id: org._id,
        name: org.orgName,
        email: org.orgEmail,
        slug: org.orgSlug,
        website: org.orgWebsite,
        isActive: org.orgActiveStatus,
        businessType: org.orgBusinessType,
        scaleType: org.orgScaleType,
        numberOfEmployees: org.numberOfEmployees,
        createdAt: org.createdAt,
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        byRole: usersByRole.reduce((acc: any, item: any) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        byProvider: usersByProvider.reduce((acc: any, item: any) => {
          acc[item._id || "email"] = item.count;
          return acc;
        }, {}),
        recentUsers,
        growth: formattedUserGrowth,
      },
      features: {
        oauth: {
          google: org.oauthSettings?.google?.enabled || false,
          microsoft: org.oauthSettings?.microsoft?.enabled || false,
          apple: org.oauthSettings?.apple?.enabled || false,
          github: org.oauthSettings?.github?.enabled || false,
        },
        mfaEnabled: org.orgOptions?.mfaEnabled || false,
        emailVerification: org.featureFlags?.emailVerification || false,
        passwordReset: org.featureFlags?.passwordReset || false,
      },
      branding: {
        hasLogos: (org.orgLogos?.length || 0) > 0,
        hasFavIcon: !!org.orgFavIcon,
        hasLoginBackgrounds: (org.loginBgImages?.length || 0) > 0,
        hasCustomText: (org.customTextSections?.length || 0) > 0,
        hasCustomColors: (org.orgTheme?.customColors?.length || 0) > 0,
        hasCustomCss: !!org.customCss,
        hasCustomJs: !!org.customJs,
        loginPageDesign: org.loginPageDesign,
      },
      configuration: {
        smtpConfigured: !!(org.smtpSettings?.host && org.smtpSettings?.user),
        redirectionRules: org.orgRedirectionSettings?.length || 0,
        roles: org.roles?.length || 0,
      },
    };

    return successResponse(
      res,
      statistics,
      "Organization statistics fetched successfully",
    );
  } catch (error) {
    logger.error("Error fetching organization statistics", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to fetch organization statistics");
  }
};

/**
 * Get global statistics (all organizations) (God level)
 */
export const getGlobalStatistics = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const [
      totalOrganizations,
      activeOrganizations,
      inactiveOrganizations,
      totalUsers,
      verifiedUsers,
      organizationsByType,
      organizationsByScale,
      recentOrganizations,
      topOrganizationsByUsers,
    ] = await Promise.all([
      Organization.countDocuments(),
      Organization.countDocuments({ orgActiveStatus: true }),
      Organization.countDocuments({ orgActiveStatus: false }),
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      Organization.aggregate([
        { $group: { _id: "$orgBusinessType", count: { $sum: 1 } } },
      ]),
      Organization.aggregate([
        { $group: { _id: "$orgScaleType", count: { $sum: 1 } } },
      ]),
      Organization.find()
        .select("orgName orgEmail orgSlug orgActiveStatus createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Organization.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "companyId",
            as: "users",
          },
        },
        {
          $project: {
            orgName: 1,
            orgEmail: 1,
            orgSlug: 1,
            userCount: { $size: "$users" },
          },
        },
        { $sort: { userCount: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const statistics = {
      organizations: {
        total: totalOrganizations,
        active: activeOrganizations,
        inactive: inactiveOrganizations,
        byType: organizationsByType.reduce((acc: any, item: any) => {
          acc[item._id || "unspecified"] = item.count;
          return acc;
        }, {}),
        byScale: organizationsByScale.reduce((acc: any, item: any) => {
          acc[item._id || "unspecified"] = item.count;
          return acc;
        }, {}),
        recent: recentOrganizations,
        top: topOrganizationsByUsers,
      },
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: totalUsers - verifiedUsers,
        averagePerOrganization:
          totalOrganizations > 0
            ? Math.round(totalUsers / totalOrganizations)
            : 0,
      },
    };

    return successResponse(
      res,
      statistics,
      "Global statistics fetched successfully",
    );
  } catch (error) {
    logger.error("Error fetching global statistics", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to fetch global statistics");
  }
};

// Dashboard Statistics
export const getDashboardStats = async (req: GodAuthRequest, res: Response) => {
  try {
    const totalOrganizations = await Organization.countDocuments();
    const activeOrganizations = await Organization.countDocuments({
      orgActiveStatus: true,
    });
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const adminUsers = await User.countDocuments({ role: "admin" });
    const godUsers = await User.countDocuments({ role: "god" });

    // Get users per organization
    const usersByOrg = await User.aggregate([
      { $group: { _id: "$companyId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get recent users
    const recentUsers = await User.find()
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recent organizations
    const recentOrganizations = await Organization.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Get users created per month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Get organizations created per month (last 6 months)
    const orgGrowth = await Organization.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    logger.info("God dashboard stats fetched");

    return successResponse(
      res,
      {
        summary: {
          totalOrganizations,
          activeOrganizations,
          totalUsers,
          verifiedUsers,
          adminUsers,
          godUsers,
        },
        usersByOrg,
        recentUsers,
        recentOrganizations,
        userGrowth,
        orgGrowth,
      },
      "Dashboard statistics fetched successfully",
    );
  } catch (error: any) {
    logger.error("Failed to fetch god dashboard stats", {
      error: error.message,
    });
    return errorResponse(res, error, "Failed to fetch dashboard stats");
  }
};

// Get system-wide statistics
export const getSystemStats = async (req: GodAuthRequest, res: Response) => {
  try {
    // User statistics by role
    const usersByRole = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    // User statistics by verification status
    const usersByVerification = await User.aggregate([
      { $group: { _id: "$isVerified", count: { $sum: 1 } } },
    ]);

    // User statistics by provider
    const usersByProvider = await User.aggregate([
      { $group: { _id: "$provider", count: { $sum: 1 } } },
    ]);

    // Organization statistics
    const orgsByStatus = await Organization.aggregate([
      { $group: { _id: "$isActive", count: { $sum: 1 } } },
    ]);

    // Top organizations by user count
    const topOrganizations = await User.aggregate([
      { $group: { _id: "$companyId", userCount: { $sum: 1 } } },
      { $sort: { userCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "organizations",
          localField: "_id",
          foreignField: "companyId",
          as: "organization",
        },
      },
      { $unwind: { path: "$organization", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          companyId: "$_id",
          userCount: 1,
          name: "$organization.name",
          domain: "$organization.domain",
        },
      },
    ]);

    logger.info("System stats fetched");

    return successResponse(
      res,
      {
        usersByRole,
        usersByVerification,
        usersByProvider,
        orgsByStatus,
        topOrganizations,
      },
      "System statistics fetched successfully",
    );
  } catch (error: any) {
    logger.error("Failed to fetch system stats", { error: error.message });
    return errorResponse(res, error, "Failed to fetch system statistics");
  }
};
// force recompile
