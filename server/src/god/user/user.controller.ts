import { Response } from "express";
import User from "../../user/user.model";
import {
  successResponse,
  successResponseArr,
  errorResponse,
  notFoundResponse,
  noContentResponse,
  logger,
} from "../../common";
import { parseBulkDelete } from "../../common/middleware";
import { GodAuthRequest } from "../../middlewares/god.middleware";

/**
 * Get all users with pagination and filters (God level)
 */
export const getAllUsers = async (req: GodAuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      filter,
    } = (req as any).parsedQuery || {};
    const organizationId = filter?.organizationId;
    const role = filter?.role;
    const isVerified =
      filter?.isVerified === "true"
        ? true
        : filter?.isVerified === "false"
          ? false
          : undefined;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (organizationId) {
      query.companyId = organizationId;
    }

    if (role && ["user", "admin", "god"].includes(role)) {
      query.role = role;
    }

    if (isVerified !== undefined) {
      query.isVerified = isVerified;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Get users
    const users = await User.find(query)
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return successResponseArr(
      res,
      users,
      {
        total,
        page,
        limit,
        totalPages,
      },
      "Users fetched successfully",
    );
  } catch (error) {
    logger.error("Error fetching users", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to fetch users");
  }
};

/**
 * Get user by ID (God level)
 */
export const getUserById = async (req: GodAuthRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const user = await User.findById(userId)
      .select("-password -otp -otpExpires")
      .lean();

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    return successResponse(res, user, "User fetched successfully");
  } catch (error) {
    logger.error("Error fetching user", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to fetch user");
  }
};

/**
 * Get users by organization ID (God level)
 */
export const getUsersByOrganization = async (
  req: GodAuthRequest,
  res: Response,
) => {
  try {
    const organizationId = req.params.organizationId as string;
    const { page = 1, limit = 10, filter } = (req as any).parsedQuery || {};
    const role = filter?.role;

    const skip = (page - 1) * limit;

    const query: any = { companyId: organizationId };

    if (role && ["user", "admin"].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return successResponseArr(
      res,
      users,
      {
        total,
        page,
        limit,
        totalPages,
      },
      "Organization users fetched successfully",
    );
  } catch (error) {
    logger.error("Error fetching organization users", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to fetch organization users");
  }
};

/**
 * Delete user (God level)
 */
export const deleteUser = async (req: GodAuthRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    logger.info("User deleted by God", {
      userId,
      deletedBy: req.godUser?._id || req.godUser?.userId,
    });

    return noContentResponse(res);
  } catch (error) {
    logger.error("Error deleting user", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to delete user");
  }
};

/**
 * Update user (God level)
 */
export const updateUser = async (req: GodAuthRequest, res: Response) => {
  try {
    const userId = req.params.userId as string;
    const updates = req.body;

    // Don't allow password updates through this endpoint
    delete updates.password;
    delete updates.otp;
    delete updates.otpExpires;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password -otp -otpExpires");

    if (!user) {
      return notFoundResponse(res, "User not found");
    }

    logger.info("User updated by God", {
      userId,
      updatedBy: req.godUser?._id || req.godUser?.userId,
    });

    return successResponse(res, user, "User updated successfully");
  } catch (error) {
    logger.error("Error updating user", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to update user");
  }
};

/**
 * Get user statistics (God level)
 */
export const getUserStatistics = async (req: GodAuthRequest, res: Response) => {
  try {
    const organizationId =
      typeof req.query.organizationId === "string"
        ? req.query.organizationId
        : undefined;

    const matchQuery: any = organizationId ? { companyId: organizationId } : {};

    const [
      totalUsers,
      verifiedUsers,
      unverifiedUsers,
      usersByRole,
      usersByProvider,
      recentUsers,
    ] = await Promise.all([
      User.countDocuments(matchQuery),
      User.countDocuments({ ...matchQuery, isVerified: true }),
      User.countDocuments({ ...matchQuery, isVerified: false }),
      User.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      User.aggregate([
        { $match: matchQuery },
        { $group: { _id: "$provider", count: { $sum: 1 } } },
      ]),
      User.find(matchQuery)
        .select("firstName lastName email role isVerified createdAt")
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const statistics = {
      total: totalUsers,
      verified: verifiedUsers,
      unverified: unverifiedUsers,
      byRole: usersByRole.reduce((acc: any, item: any) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      byProvider: usersByProvider.reduce((acc: any, item: any) => {
        acc[item._id || "email"] = item.count;
        return acc;
      }, {}),
      recentUsers,
      ...(organizationId && { organizationId }),
    };

    return successResponse(
      res,
      statistics,
      "User statistics fetched successfully",
    );
  } catch (error) {
    logger.error("Error fetching user statistics", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to fetch user statistics");
  }
};

/**
 * Bulk delete users (God level)
 */
export const bulkDeleteUsers = async (req: GodAuthRequest, res: Response) => {
  try {
    const ids = (req as any).ids || [];
    const deleteAll = (req as any).deleteAll || false;

    if (deleteAll) {
      await User.deleteMany({});
      logger.info("All users deleted by God", {
        deletedBy: req.godUser?._id || req.godUser?.userId,
      });
    } else {
      await User.deleteMany({ _id: { $in: ids } });
      logger.info("Users bulk deleted by God", {
        ids,
        deletedBy: req.godUser?._id || req.godUser?.userId,
      });
    }

    return noContentResponse(res);
  } catch (error) {
    logger.error("Error bulk deleting users", {
      error: error instanceof Error ? error.message : String(error),
    });
    return errorResponse(res, error, "Failed to bulk delete users");
  }
};
