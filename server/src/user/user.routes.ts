import { Router } from "express";
import * as UserController from "./user.controller";
import { authenticateOrgUser } from "../middlewares/user.middleware";

const router = Router();

// Public routes
router.post("/login", UserController.login);
router.post("/signup", UserController.signup);
router.post("/verify", UserController.verifyAccount);
router.post("/forgot-password", UserController.forgotPassword);
router.post("/reset-password", UserController.resetPassword);

// Protected routes (organization users only, not god users)
router.get("/profile", authenticateOrgUser, UserController.getProfile);
router.put("/profile", authenticateOrgUser, UserController.updateProfile);
router.put(
  "/profile/picture",
  authenticateOrgUser,
  UserController.updateProfilePicture,
);
router.post("/resend-otp", authenticateOrgUser, UserController.resendOtp);

// Get available companies
router.get("/companies", UserController.getCompanies);

export default router;
