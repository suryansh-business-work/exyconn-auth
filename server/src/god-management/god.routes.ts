import { Router } from "express";
import { sendGodCredentialsEmail, godLogin } from "./god.controller";

const router = Router();

/**
 * @route   POST /v1/api/god-management/login
 * @desc    God user login (no company required)
 * @access  Public
 */
router.post("/login", godLogin);

/**
 * @route   GET /v1/api/god-management/send-credentials
 * @desc    Send God user credentials email
 * @access  Public (No middleware)
 */
router.get("/send-credentials", sendGodCredentialsEmail);

export default router;
