// Core Modules
import express from "express";

// Controllers
import { imageKitUpload } from "./imagekit.controllers";

// Initialization
const router = express.Router();

// Middleware
import { authenticateUser } from "../../middlewares/user.middleware";

router.post("/imagekit/upload", authenticateUser, imageKitUpload);

export default router;
