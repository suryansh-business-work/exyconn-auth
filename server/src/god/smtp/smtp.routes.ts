import express, { RequestHandler } from "express";
import { testSmtpConnection, sendTestEmail } from "./smtp.controller";
import { authenticateGod } from "../../middlewares/god.middleware";

const router = express.Router();

// All routes require God authentication
router.use(authenticateGod);

/**
 * @route   POST /v1/api/god/smtp/test-connection
 * @desc    Test SMTP server connection
 * @access  God only
 */
router.post("/test-connection", testSmtpConnection as RequestHandler);

/**
 * @route   POST /v1/api/god/smtp/send-test-email
 * @desc    Send a test email using provided SMTP settings
 * @access  God only
 */
router.post("/send-test-email", sendTestEmail as RequestHandler);

export default router;
